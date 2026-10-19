#!/usr/bin/env bash
# .devcontainer/setup.sh — runs once after the Codespace container is created.
set -euo pipefail

echo "==> Installing uv..."
curl -LsSf https://astral.sh/uv/install.sh | sh

# Make uv available for the rest of this script.
export PATH="$HOME/.local/bin:$PATH"

echo "==> Syncing Python dependencies with uv..."
# uv reads .python-version (3.13) and pyproject.toml automatically.
uv sync

# Persist uv on PATH and auto-activate the venv for every new terminal.
# CODESPACE_VSCODE_FOLDER is set by Codespaces to the repo root regardless of repo name.
cat >> "$HOME/.bashrc" <<'EOF'

# uv — added by devcontainer setup
export PATH="$HOME/.local/bin:$PATH"

# Activate the project virtual environment in every new terminal.
if [ -f "$CODESPACE_VSCODE_FOLDER/.venv/bin/activate" ]; then
  source "$CODESPACE_VSCODE_FOLDER/.venv/bin/activate"
fi
EOF

echo ""
echo "✅  Setup complete. Open a new terminal — the venv will be active automatically."
echo "   Export your AWS credentials, then start with Chapter 1:"
echo "     python 1_strands_basics/simple_agent.py"
