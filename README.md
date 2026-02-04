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
      "agrs": ["-y", "loco-mcp"]
    }
  }
}
```

## Usage

Once configured, your AI assistant will have access to tools like `list_assets`, `create_asset`, `get_translation`, etc. Each tool requires your Loco API key as a parameter.

You can find your API key in your Loco project under **Developer Tools → API Keys (Full Access Key)**.
