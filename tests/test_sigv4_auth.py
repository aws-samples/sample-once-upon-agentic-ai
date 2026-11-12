"""SigV4Auth signs a request with the session's credentials and leaves its body alone."""

import httpx
import pytest
from sigv4_auth import SigV4Auth


def test_sigv4_auth_signs_request_without_changing_body(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("AWS_PROFILE", raising=False)
    monkeypatch.setenv("AWS_CONFIG_FILE", "/nonexistent")
    monkeypatch.setenv("AWS_SHARED_CREDENTIALS_FILE", "/nonexistent")
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "AKIDEXAMPLE")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "fake-secret-for-tests")
    monkeypatch.setenv("AWS_SESSION_TOKEN", "fake-session-token")
    monkeypatch.setenv("AWS_DEFAULT_REGION", "us-west-2")
    body = b'{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
    request = httpx.Request(
        "POST",
        "https://bedrock-agentcore.us-west-2.amazonaws.com/runtimes/x/invocations",
        content=body,
    )

    signed = next(SigV4Auth(service="bedrock-agentcore").auth_flow(request))

    assert signed.headers["Authorization"].startswith(
        "AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/"
    )
    assert (
        "/us-west-2/bedrock-agentcore/aws4_request" in signed.headers["Authorization"]
    )
    assert signed.headers["X-Amz-Date"]
    assert signed.headers["X-Amz-Security-Token"] == "fake-session-token"
    assert signed.content == body
