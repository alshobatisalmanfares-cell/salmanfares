import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listItems from "./tools/list-items";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "salmanfares-mcp",
  title: "Salman Fares MCP",
  version: "0.1.0",
  instructions:
    "Public tools for the Salman Fares (سلمان فارس) platform. Use `list_items` to browse curated apps, games, websites, and AI tools.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listItems],
});