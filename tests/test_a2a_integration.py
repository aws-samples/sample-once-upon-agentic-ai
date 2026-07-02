"""Level 2 integration test: actually start an A2AServer built with agent_factory
and verify the standard A2A endpoints respond.

We don't invoke the LLM — we only exercise the transport + agent-card path:

- ``GET /.well-known/agent-card.json`` returns metadata built from the factory's
  representative agent (name, description, capabilities).
- The HTTP server actually binds and accepts connections.

Two servers are started on distinct ports so we can also confirm both agents
serve their card correctly.
"""

from __future__ import annotations

import contextlib
import socket
import threading
import time
from typing import Iterator

import httpx
import pytest
import uvicorn


def _pick_port() -> int:
    """Grab an OS-assigned free port so parallel test runs don't collide."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@contextlib.contextmanager
def _run_server_in_thread(a2a_server, port: int) -> Iterator[None]:
    """Start an A2AServer on a background thread bound to the given port.

    We drive it through uvicorn.Server directly rather than a2a_server.serve()
    so we can shut it down cleanly at the end of the test.
    """
    app = a2a_server.to_fastapi_app()
    config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="warning")
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    # Wait until the server is accepting connections (max 5s).
    deadline = time.time() + 5.0
    while time.time() < deadline:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=0.2):
                break
        except OSError:
            time.sleep(0.05)
    else:
        raise RuntimeError(f"A2AServer did not start on port {port} within 5s")

    try:
        yield
    finally:
        server.should_exit = True
        thread.join(timeout=5)


@pytest.mark.parametrize(
    ("module_name", "expected_name_substring"),
    [
        ("character_agent", "character"),
        ("rules_agent", "rules"),
    ],
)
def test_agent_card_is_served(module_name, expected_name_substring):
    """The A2A protocol contract: every server publishes an agent card at
    ``/.well-known/agent-card.json``. If the factory pattern breaks card
    generation, this is where we'd find out."""
    import importlib

    mod = importlib.import_module(module_name)
    port = _pick_port()

    # The module was constructed with a fixed port; rebuild the server on a free one
    # to avoid conflicts when tests run in parallel or after a hung previous run.
    from strands.multiagent.a2a import A2AServer

    server = A2AServer(agent_factory=mod.create_agent, port=port)

    with _run_server_in_thread(server, port):
        resp = httpx.get(
            f"http://127.0.0.1:{port}/.well-known/agent-card.json", timeout=5.0
        )
        assert resp.status_code == 200, resp.text
        card = resp.json()

    # Standard A2A agent card fields
    assert "name" in card
    assert "description" in card
    assert expected_name_substring.lower() in card["name"].lower(), (
        f"Expected agent name to mention '{expected_name_substring}', got: {card['name']!r}"
    )
