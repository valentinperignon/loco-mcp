#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LocoClient } from "./loco-client.js";

// region API key resolution

function parseArgs(args: string[]): { apiKey?: string; apiKeyRelativePath?: string } {
  const result: { apiKey?: string; apiKeyRelativePath?: string } = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--api-key" && i + 1 < args.length) {
      result.apiKey = args[++i];
    } else if (args[i] === "--api-key-relative-path" && i + 1 < args.length) {
      result.apiKeyRelativePath = args[++i];
    }
  }
  return result;
}

function resolveApiKey(): string | undefined {
  const { apiKey, apiKeyRelativePath } = parseArgs(process.argv.slice(2));

  // Priority: --api-key > LOCO_MCP_API_KEY env var > --api-key-relative-path
  if (apiKey) {
    return apiKey;
  }

  const envKey = process.env.LOCO_MCP_API_KEY;
  if (envKey) {
    return envKey;
  }

  if (apiKeyRelativePath) {
    try {
      const absolutePath = resolve(process.cwd(), apiKeyRelativePath);
      return readFileSync(absolutePath, "utf-8").trim();
    } catch (error) {
      console.error(`Warning: Could not read API key from file "${apiKeyRelativePath}": ${error}`);
    }
  }

  return undefined;
}

const configuredApiKey = resolveApiKey();

function getApiKey(paramApiKey?: string): string {
  const key = paramApiKey || configuredApiKey;
  if (!key) {
    throw new Error(
      "No API key provided. Supply it via --api-key, LOCO_MCP_API_KEY environment variable, --api-key-relative-path, or as a tool parameter."
    );
  }
  return key;
}

// endregion

const server = new McpServer({
  name: "loco-mcp",
  version: "1.1.0",
});

// region Locale tools

server.registerTool(
    "list_locales",
    {
        description: "Lists all locales in the project. The source language will always be the first in the list",
        inputSchema: {
            apiKey: z.string().optional().describe("Loco API key for the project (optional if configured via CLI or environment)")
        }
    },
    async ({ apiKey }) => {
        const client = new LocoClient(getApiKey(apiKey));
        const result = await client.listLocales();
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        }
    }
);

// endregion

// region Asset tools

server.registerTool(
  "list_assets",
  {
    description: "List all translatable assets in the project. Optionally filter by tags.",
    inputSchema: {
      apiKey: z.string().optional().describe("Loco API key for the project (optional if configured via CLI or environment)"),
      filter: z
        .string()
        .optional()
        .describe(
          "Filter by comma-separated tag names. Use * to match any tag, prefix with ! to negate"
        ),
    },
  },
  async ({ apiKey, filter }) => {
    const client = new LocoClient(getApiKey(apiKey));
    const result = await client.listAssets(filter);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  "get_asset",
  {
    description: "Get a single asset by its ID",
    inputSchema: {
      apiKey: z.string().optional().describe("Loco API key for the project (optional if configured via CLI or environment)"),
      assetId: z.string().describe("The unique asset identifier"),
    },
  },
  async ({ apiKey, assetId }) => {
    const client = new LocoClient(getApiKey(apiKey));
    const result = await client.getAsset(assetId);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  "create_asset",
  {
    description: "Create a new translatable asset in the project",
    inputSchema: {
      apiKey: z.string().optional().describe("Loco API key for the project (optional if configured via CLI or environment)"),
      id: z
        .string()
        .optional()
        .describe("Unique asset identifier (auto-generated if omitted)"),
      text: z
        .string()
        .optional()
        .describe("Initial source language translation (required if id is empty)"),
      context: z.string().optional().describe("Contextual information for translators"),
      notes: z.string().optional().describe("Notes/guidance for translators"),
    },
  },
  async ({ apiKey, id, text, context, notes }) => {
    const client = new LocoClient(getApiKey(apiKey));
    const result = await client.createAsset({ id, text, type: 'text', context, notes });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  "update_asset",
  {
    description: "Update an existing asset's properties (not tags or translations)",
    inputSchema: {
      apiKey: z.string().optional().describe("Loco API key for the project (optional if configured via CLI or environment)"),
      assetId: z.string().describe("The asset identifier to update"),
      newId: z.string().optional().describe("New unique identifier for the asset"),
      context: z.string().optional().describe("Contextual information for translators"),
      notes: z.string().optional().describe("Notes/guidance for translators"),
    },
  },
  async ({ apiKey, assetId, newId, context, notes }) => {
    const client = new LocoClient(getApiKey(apiKey));
    const result = await client.updateAsset(assetId, {
      id: newId,
      type: 'text',
      context,
      notes,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  "delete_asset",
  {
    description: "Permanently delete an asset from the project",
    inputSchema: {
      apiKey: z.string().optional().describe("Loco API key for the project (optional if configured via CLI or environment)"),
      assetId: z.string().describe("The asset identifier to delete"),
    },
  },
  async ({ apiKey, assetId }) => {
    const client = new LocoClient(getApiKey(apiKey));
    const result = await client.deleteAsset(assetId);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// endregion

// region Translation tools

server.registerTool(
  "get_translations",
  {
    description: "Get all translations for an asset across all locales",
    inputSchema: {
      apiKey: z.string().optional().describe("Loco API key for the project (optional if configured via CLI or environment)"),
      assetId: z.string().describe("The asset identifier"),
    },
  },
  async ({ apiKey, assetId }) => {
    const client = new LocoClient(getApiKey(apiKey));
    const result = await client.getTranslations(assetId);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  "get_translation",
  {
    description: "Get a single translation for an asset in a specific locale",
    inputSchema: {
      apiKey: z.string().optional().describe("Loco API key for the project (optional if configured via CLI or environment)"),
      assetId: z.string().describe("The asset identifier"),
      locale: z.string().describe("Locale code (e.g., en, fr, de, en_US)"),
    },
  },
  async ({ apiKey, assetId, locale }) => {
    const client = new LocoClient(getApiKey(apiKey));
    const result = await client.getTranslation(assetId, locale);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  "update_translation",
  {
    description: "Add or update a translation for an asset in a specific locale",
    inputSchema: {
      apiKey: z.string().optional().describe("Loco API key for the project (optional if configured via CLI or environment)"),
      assetId: z.string().describe("The asset identifier"),
      locale: z.string().describe("Locale code (e.g., en, fr, de, en_US)"),
      text: z.string().describe("The translation text (empty string marks as untranslated)"),
    },
  },
  async ({ apiKey, assetId, locale, text }) => {
    const client = new LocoClient(getApiKey(apiKey));
    const result = await client.updateTranslation(assetId, locale, text);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// endregion

// region Tag tools

server.registerTool(
  "list_tags",
  {
    description: "List all tags in the project",
    inputSchema: {
      apiKey: z.string().optional().describe("Loco API key for the project (optional if configured via CLI or environment)"),
    },
  },
  async ({ apiKey }) => {
    const client = new LocoClient(getApiKey(apiKey));
    const result = await client.listTags();
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  "tag_asset",
  {
    description: "Add a tag to an asset. Creates the tag if it doesn't exist.",
    inputSchema: {
      apiKey: z.string().optional().describe("Loco API key for the project (optional if configured via CLI or environment)"),
      assetId: z.string().describe("The asset identifier to tag"),
      tag: z.string().describe("The tag name to add"),
    },
  },
  async ({ apiKey, assetId, tag }) => {
    const client = new LocoClient(getApiKey(apiKey));
    const result = await client.tagAsset(assetId, tag);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  "untag_asset",
  {
    description: "Remove a tag from an asset",
    inputSchema: {
      apiKey: z.string().optional().describe("Loco API key for the project (optional if configured via CLI or environment)"),
      assetId: z.string().describe("The asset identifier"),
      tag: z.string().describe("The tag name to remove"),
    },
  },
  async ({ apiKey, assetId, tag }) => {
    const client = new LocoClient(getApiKey(apiKey));
    const result = await client.untagAsset(assetId, tag);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// endregion

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("loco-mcp server running on stdio…");
}

main().catch(console.error);
