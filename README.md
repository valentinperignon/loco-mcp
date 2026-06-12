# loco-mcp

An MCP server that lets AI assistants manage translations through the [Loco](https://localise.biz) API.

## What it does

This MCP provides tools to:
- List, create, update, and delete translatable assets
- Get and update translations across locales
- Manage tags on your assets

## Use it with your favorite tool

### OpenCode

```json
{
  "mcp": {
    "loco": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "loco-mcp", "--api-key", "<your-api-key>"]
    }
  }
}
```

## API Key Configuration

The API key can be provided in several ways (in priority order):

1. **CLI argument** `--api-key <key>` — pass the key directly as a command-line argument
2. **Environment variable** `LOCO_MCP_API_KEY` — set the key in your environment
3. **File path** `--api-key-relative-path <path>` — read the key from a file (path relative to the working directory)
4. **Tool parameter** — pass it as the `apiKey` parameter in each tool call (original behavior, still supported)

### Examples

```bash
# 1. Direct CLI argument
npx -y loco-mcp --api-key loco_abc123

# 2. Environment variable
LOCO_MCP_API_KEY=loco_abc123 npx -y loco-mcp

# 3. Read from a file
npx -y loco-mcp --api-key-relative-path .loco-api-key
```

You can find your API key in your Loco project under **Developer Tools → API Keys (Full Access Key)**.
