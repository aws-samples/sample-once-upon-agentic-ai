"""Level 1 + 3 tests for the ``agent_factory`` migration on chapter 5.

Level 1 (import-time smoke tests):
- ``character_agent`` and ``rules_agent`` modules import cleanly.
- Each exposes a ``create_agent(context_id) -> Agent`` callable.
- Each builds an ``A2AServer`` using ``agent_factory=`` (not the deprecated ``agent=``).

Level 3 (multi-tenant isolation):
- ``A2AServer.executor`` builds a *distinct* Agent per ``context_id``, so two
  concurrent contexts cannot share ``messages`` / ``state``. This is the whole
  point of the migration.

We never hit a real model in these tests — we only exercise the framing
(constructor wiring + context bookkeeping in the executor).
"""

from __future__ import annotations

import asyncio
import inspect
from typing import Callable

import pytest

from strands import Agent
from strands.multiagent.a2a import A2AServer
from strands.multiagent.a2a.executor import StrandsA2AExecutor


# ---------- Level 1: import + wiring ----------------------------------------


def _load_agent_module(name: str):
    """Import a chapter-5 agent module by its leaf name. conftest.py has already
    added the containing directory to sys.path."""
    import importlib

    return importlib.import_module(name)


@pytest.mark.parametrize("module_name", ["character_agent", "rules_agent"])
def test_module_imports_cleanly(module_name):
    mod = _load_agent_module(module_name)
    assert mod is not None


@pytest.mark.parametrize("module_name", ["character_agent", "rules_agent"])
def test_module_exposes_create_agent_factory(module_name):
    mod = _load_agent_module(module_name)
    assert hasattr(mod, "create_agent"), (
        f"{module_name} must expose create_agent(context_id) for the factory pattern"
    )
    assert callable(mod.create_agent)
    sig = inspect.signature(mod.create_agent)
    params = list(sig.parameters.values())
    assert len(params) == 1, "create_agent must take exactly one argument (context_id)"


@pytest.mark.parametrize("module_name", ["character_agent", "rules_agent"])
def test_create_agent_returns_fresh_agent_each_call(module_name):
    mod = _load_agent_module(module_name)
    a1 = mod.create_agent("ctx-A")
    a2 = mod.create_agent("ctx-B")
    assert isinstance(a1, Agent)
    assert isinstance(a2, Agent)
    assert a1 is not a2, (
        "create_agent must return a NEW Agent instance per call — otherwise "
        "we are silently back to the deprecated shared-agent mode."
    )
    # Independent message stores
    assert a1.messages is not a2.messages


@pytest.mark.parametrize("module_name", ["character_agent", "rules_agent"])
def test_a2a_server_uses_agent_factory(module_name):
    mod = _load_agent_module(module_name)
    assert hasattr(mod, "a2a_server"), f"{module_name} must instantiate an A2AServer"
    server = mod.a2a_server
    assert isinstance(server, A2AServer)

    # The executor holds the factory-mode bookkeeping. In factory mode:
    #   - self.agent is None
    #   - self._agent_factory is set
    #   - self._contexts is the LRU OrderedDict
    executor = _extract_executor(server)
    assert isinstance(executor, StrandsA2AExecutor)
    assert executor._agent_factory is not None, (
        f"{module_name}'s A2AServer must be constructed with agent_factory=, "
        "not the deprecated agent= parameter."
    )
    assert executor.agent is None, (
        "A single shared agent is set — this means agent= was used and the "
        "factory migration was reverted."
    )


# ---------- Level 3: multi-tenant isolation ---------------------------------


@pytest.mark.parametrize("module_name", ["character_agent", "rules_agent"])
@pytest.mark.asyncio
async def test_executor_creates_distinct_agents_per_context(module_name):
    """Two different context_ids must resolve to two distinct Agent instances,
    each with its own asyncio.Lock. Same context_id → same Agent (LRU cache)."""
    mod = _load_agent_module(module_name)
    executor: StrandsA2AExecutor = _extract_executor(mod.a2a_server)

    agent_a, lock_a = await executor._acquire_context_agent("alice")
    agent_b, lock_b = await executor._acquire_context_agent("bob")

    assert agent_a is not agent_b, "distinct context_ids must map to distinct Agents"
    assert lock_a is not lock_b, "distinct context_ids must have distinct locks"

    # Same context_id returns the cached entry
    agent_a_again, lock_a_again = await executor._acquire_context_agent("alice")
    assert agent_a_again is agent_a
    assert lock_a_again is lock_a


@pytest.mark.parametrize("module_name", ["character_agent", "rules_agent"])
@pytest.mark.asyncio
async def test_message_history_is_isolated_per_context(module_name):
    """If we mutate alice's agent.messages, bob's must be untouched. This is the
    concrete failure mode that agent= exhibits and agent_factory= prevents."""
    mod = _load_agent_module(module_name)
    executor: StrandsA2AExecutor = _extract_executor(mod.a2a_server)

    agent_a, _ = await executor._acquire_context_agent("alice")
    agent_b, _ = await executor._acquire_context_agent("bob")

    agent_a.messages.append(
        {"role": "user", "content": [{"text": "my char is Aragorn lvl 5"}]}
    )

    assert len(agent_b.messages) == 0, (
        "Bob's message history leaked into Alice's — the shared-agent bug is back."
    )


@pytest.mark.parametrize("module_name", ["character_agent", "rules_agent"])
@pytest.mark.asyncio
async def test_state_is_isolated_per_context(module_name):
    mod = _load_agent_module(module_name)
    executor: StrandsA2AExecutor = _extract_executor(mod.a2a_server)

    agent_a, _ = await executor._acquire_context_agent("alice")
    agent_b, _ = await executor._acquire_context_agent("bob")

    agent_a.state.set("last_action", "attacked_dragon")

    assert agent_b.state.get("last_action") is None, (
        "AgentState leaked across contexts — factory isolation is broken."
    )


# ---------- helpers ---------------------------------------------------------


def _extract_executor(server: A2AServer) -> StrandsA2AExecutor:
    """The A2AServer stores its executor privately; walk the request handler chain
    to find it. This is test-only introspection — production code should never
    reach for these."""
    # Common attribute names across SDK versions; try them in order.
    for attr in ("_executor", "executor", "_agent_executor", "agent_executor"):
        exec_ = getattr(server, attr, None)
        if isinstance(exec_, StrandsA2AExecutor):
            return exec_

    # Fallback: walk the request handler if present.
    handler = getattr(server, "_request_handler", None) or getattr(server, "request_handler", None)
    if handler is not None:
        for attr in ("agent_executor", "_agent_executor", "executor", "_executor"):
            exec_ = getattr(handler, attr, None)
            if isinstance(exec_, StrandsA2AExecutor):
                return exec_

    # Last resort: scan __dict__.
    for value in vars(server).values():
        if isinstance(value, StrandsA2AExecutor):
            return value
        # Walk one level deep in case it's nested in a handler object.
        if hasattr(value, "__dict__"):
            for inner in vars(value).values():
                if isinstance(inner, StrandsA2AExecutor):
                    return inner

    raise AssertionError(
        f"Could not locate StrandsA2AExecutor on A2AServer instance. "
        f"Available attrs: {list(vars(server).keys())}"
    )
