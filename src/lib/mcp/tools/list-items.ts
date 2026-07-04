import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "list_items",
  title: "List items on Salman Fares",
  description: "List curated apps, games, websites, or AI tools published on the Salman Fares platform. Filter by category when useful.",
  inputSchema: {
    category: z
      .enum(["apps", "games", "websites", "ai"]) 
      .optional()
      .describe("Optional category filter."),
    limit: z.number().int().min(1).max(50).optional().describe("Max items to return (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, limit }) => {
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    let q = supabase.from("items").select("id,slug,title,description,categories,url").limit(limit ?? 10);
    if (category) q = q.contains("categories", [category]);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { items: data ?? [] },
    };
  },
});