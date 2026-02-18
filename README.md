# loco-mcp

An MCP server that lets AI assistants manage translations through the [Loco](https://localise.biz) API.

## What it does

This MCP provides tools to:
- List, create, update, and delete translatable assets
- Get and update translations across locales
- Manage tags on your assets

## Configuration

### API Key

You can provide your Loco API key in three ways (in order of precedence):

1. **CLI Argument** (highest priority)
   ```bash
   npx loco-mcp --api-key YOUR_API_KEY
   ```

2. **Environment Variable**
   
   On macOS/Linux:
   ```bash
   export LOCO_API_KEY=your_key_here
   ```
   
   On Windows (PowerShell):
   ```powershell
   setx LOCO_API_KEY "your_key_here"
   ```
   
   On Windows (Command Prompt):
   ```cmd
   set LOCO_API_KEY=your_key_here
   ```

3. **Tool Parameter** (lowest priority)
   
   If neither CLI argument nor environment variable is set, you can still provide the API key as a parameter when calling each tool.

You can find your API key in your Loco project under **Developer Tools → API Keys (Full Access Key)**.

## Use it with your favorite tool

### OpenCode

```json
{
  "mcp": {
    "loco": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "loco-mcp", "--api-key", "YOUR_API_KEY"]
    }
  }
}
```

Or using environment variable:

```json
{
  "mcp": {
    "loco": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "loco-mcp"],
      "env": {
        "LOCO_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

## Usage

Once configured with your API key (via CLI argument, environment variable, or tool parameter), your AI assistant will have access to tools like `list_assets`, `create_asset`, `get_translation`, etc.

When the API key is set globally (via CLI argument or environment variable), you don't need to provide it as a parameter to each tool call. However, you can still override the global API key by providing it explicitly to any tool.
