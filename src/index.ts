#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { LocoClient } from "./loco-client.js";

const server = new McpServer({
  name: "loco-mcp",
  version: "1.0.0",
});

// ============ ASSET TOOLS ============

server.tool(
  "list_assets",
  "List all translatable assets in the project. Optionally filter by tags.",
  {
    apiKey: z.string().describe("Loco API key for the project"),
    filter: z
      .string()
      .optional()
      .describe(
        "Filter by comma-separated tag names. Use * to match any tag, prefix with ! to negate"
      ),
  },
  async ({ apiKey, filter }) => {
    const client = new LocoClient(apiKey);
    const result = await client.listAssets(filter);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "get_asset",
  "Get a single asset by its ID",
  {
    apiKey: z.string().describe("Loco API key for the project"),
    assetId: z.string().describe("The unique asset identifier"),
  },
  async ({ apiKey, assetId }) => {
    const client = new LocoClient(apiKey);
    const result = await client.getAsset(assetId);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "create_asset",
  "Create a new translatable asset in the project",
  {
    apiKey: z.string().describe("Loco API key for the project"),
    id: z
      .string()
      .optional()
      .describe("Unique asset identifier (auto-generated if omitted)"),
    text: z
      .string()
      .optional()
      .describe("Initial source language translation (required if id is empty)"),
    type: z
      .enum(["text", "html", "xml"])
      .optional()
      .describe("Content type: text, html, or xml (default: text)"),
    context: z.string().optional().describe("Contextual information for translators"),
    notes: z.string().optional().describe("Notes/guidance for translators"),
  },
  async ({ apiKey, id, text, type, context, notes }) => {
    const client = new LocoClient(apiKey);
    const result = await client.createAsset({ id, text, type, context, notes });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "update_asset",
  "Update an existing asset's properties (not tags or translations)",
  {
    apiKey: z.string().describe("Loco API key for the project"),
    assetId: z.string().describe("The asset identifier to update"),
    newId: z.string().optional().describe("New unique identifier for the asset"),
    type: z
      .enum(["text", "html", "xml"])
      .optional()
      .describe("Content type: text, html, or xml"),
    context: z.string().optional().describe("Contextual information for translators"),
    notes: z.string().optional().describe("Notes/guidance for translators"),
  },
  async ({ apiKey, assetId, newId, type, context, notes }) => {
    const client = new LocoClient(apiKey);
    const result = await client.updateAsset(assetId, {
      id: newId,
      type,
      context,
      notes,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "delete_asset",
  "Permanently delete an asset from the project",
  {
    apiKey: z.string().describe("Loco API key for the project"),
    assetId: z.string().describe("The asset identifier to delete"),
  },
  async ({ apiKey, assetId }) => {
    const client = new LocoClient(apiKey);
    const result = await client.deleteAsset(assetId);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ============ TRANSLATION TOOLS ============

server.tool(
  "get_translations",
  "Get all translations for an asset across all locales",
  {
    apiKey: z.string().describe("Loco API key for the project"),
    assetId: z.string().describe("The asset identifier"),
  },
  async ({ apiKey, assetId }) => {
    const client = new LocoClient(apiKey);
    const result = await client.getTranslations(assetId);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "get_translation",
  "Get a single translation for an asset in a specific locale",
  {
    apiKey: z.string().describe("Loco API key for the project"),
    assetId: z.string().describe("The asset identifier"),
    locale: z.string().describe("Locale code (e.g., en, fr, de, en_US)"),
  },
  async ({ apiKey, assetId, locale }) => {
    const client = new LocoClient(apiKey);
    const result = await client.getTranslation(assetId, locale);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "update_translation",
  "Add or update a translation for an asset in a specific locale",
  {
    apiKey: z.string().describe("Loco API key for the project"),
    assetId: z.string().describe("The asset identifier"),
    locale: z.string().describe("Locale code (e.g., en, fr, de, en_US)"),
    text: z.string().describe("The translation text (empty string marks as untranslated)"),
  },
  async ({ apiKey, assetId, locale, text }) => {
    const client = new LocoClient(apiKey);
    const result = await client.updateTranslation(assetId, locale, text);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ============ TAG TOOLS ============

server.tool(
  "list_tags",
  "List all tags in the project",
  {
    apiKey: z.string().describe("Loco API key for the project"),
  },
  async ({ apiKey }) => {
    const client = new LocoClient(apiKey);
    const result = await client.listTags();
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "tag_asset",
  "Add a tag to an asset. Creates the tag if it doesn't exist.",
  {
    apiKey: z.string().describe("Loco API key for the project"),
    assetId: z.string().describe("The asset identifier to tag"),
    tag: z.string().describe("The tag name to add"),
  },
  async ({ apiKey, assetId, tag }) => {
    const client = new LocoClient(apiKey);
    const result = await client.tagAsset(assetId, tag);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "untag_asset",
  "Remove a tag from an asset",
  {
    apiKey: z.string().describe("Loco API key for the project"),
    assetId: z.string().describe("The asset identifier"),
    tag: z.string().describe("The tag name to remove"),
  },
  async ({ apiKey, assetId, tag }) => {
    const client = new LocoClient(apiKey);
    const result = await client.untagAsset(assetId, tag);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ============ START SERVER ============

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("loco-mcp server running on stdio");
}

main().catch(console.error);
