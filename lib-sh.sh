# Shared setup for the shell scripts: repo root, optional portable Node 22, config check.
cd "$(dirname "${BASH_SOURCE[0]}")"
N22="${NODE22_BIN:-$HOME/.local/node-v22.20.0-linux-x64/bin}"; [ -d "$N22" ] && export PATH="$N22:$PATH"
if [ ! -f wrangler.toml ]; then echo "wrangler.toml not found: cp wrangler.toml.example wrangler.toml and fill in your ids (see INSTALL.md)." >&2; exit 1; fi
if grep -q '<YOUR_' wrangler.toml; then echo "wrangler.toml still has <YOUR_...> placeholders (see INSTALL.md)." >&2; exit 1; fi
