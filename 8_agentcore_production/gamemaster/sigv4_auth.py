"""Sign httpx requests with AWS Signature Version 4, for the runtimes deployed on AgentCore."""

from collections.abc import Generator

import boto3
import httpx
from botocore.auth import SigV4Auth as BotocoreSigV4Auth
from botocore.awsrequest import AWSRequest


class SigV4Auth(httpx.Auth):
    """Add a SigV4 signature to every request, like the AWS SDK does for its own calls.

    The credentials and the region come from your boto3 session: AWS_DEFAULT_REGION on
    your machine, the runtime's own region in the cloud. A request signed for another
    region than the runtime's is rejected with a 403.

    Args:
        service: The AWS service the requests are for, "bedrock-agentcore" for AgentCore Runtime.
    """

    # The signature covers a hash of the body, so httpx must read the body before signing.
    requires_request_body = True

    def __init__(self, service: str) -> None:
        session = boto3.Session()
        credentials = session.get_credentials()
        if credentials is None:
            raise RuntimeError(
                "No AWS credentials found: configure them before starting"
            )
        self._signer = BotocoreSigV4Auth(credentials, service, session.region_name)

    def auth_flow(
        self, request: httpx.Request
    ) -> Generator[httpx.Request, httpx.Response, None]:
        aws_request = AWSRequest(
            method=request.method, url=str(request.url), data=request.content
        )
        self._signer.add_auth(aws_request)
        # X-Amz-Date, Authorization, and X-Amz-Security-Token for temporary credentials
        request.headers.update(dict(aws_request.headers.items()))
        yield request
