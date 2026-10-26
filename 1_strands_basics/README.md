# Chapter 1: The Art of Agent Summoning

Summon your first agent with Strands: a Game Master that answers an adventurer with nothing more than an `Agent`, a system prompt and one call.

## What you build

`simple_agent.py` does three things:

1. **Debug logging**: sets the `strands` logger to `DEBUG`, the only level where Strands shows the request sent to the model and the response streamed back.
2. **The agent**: `Agent(system_prompt="You are a game master for a fantasy role-playing game")`.
3. **The call**: `agent("Hi, I am an adventurer ready for adventure!")`.

No model is configured: by default Strands uses Amazon Bedrock with Claude Sonnet 4.6 (`global.anthropic.claude-sonnet-4-6`) in the AWS region of your credentials. To use another model, pass one to the agent, see the [Amazon Bedrock model provider](https://strandsagents.com/latest/documentation/docs/user-guide/concepts/model-providers/amazon-bedrock/) page. If Anthropic models are not available in your country, use another Bedrock model, for example `global.zai.glm-5.3`, and pass its ID in every file where you create an agent.

## Run it

```bash
cd 1_strands_basics
python simple_agent.py
```

You need AWS credentials allowed to call `bedrock:InvokeModel` and `bedrock:InvokeModelWithResponseStream` on the model. The Game Master should answer with enthusiasm and set the scene for an adventure.

Debug logs go to stderr and the reply to stdout, so they may interleave in the terminal. Raise the level to `INFO` once you have seen enough.

## Troubleshooting

- `AccessDeniedException ... not authorized to perform: bedrock:InvokeModelWithResponseStream`: your IAM identity has no policy allowing Bedrock invocation, or model access is not enabled for the account.
- Wrong region in the log (`region=<...>`): set `AWS_REGION` or fix the region of your AWS profile.

Next: [Chapter 2](../2_vended_tools/).
