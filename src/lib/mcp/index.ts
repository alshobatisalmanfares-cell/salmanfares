import { defineMcp } from "@lovable.dev/mcp-js";
import listItems from "./tools/list-items";

export default defineMcp({
  name: "salmanfares-mcp",
  title: "Salman Fares MCP",
  version: "0.1.0",
  instructions:
    "Public tools for the Salman Fares (سلمان فارس) platform. Use `list_items` to browse curated apps, games, websites, and AI tools.",
  tools: [listItems],
});