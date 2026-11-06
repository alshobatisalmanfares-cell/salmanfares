import { readFile, writeFile, access, cp } from "node:fs/promises";

let html;
// TanStack writes a "/" SPA shell as dist/client/.html; older layouts use index.html or _shell.
for (const path of ["dist/client/.html", "dist/client/index.html", "dist/client/_shell.html", "dist/client/_shell/index.html"]) {
  try { html = await readFile(path, "utf8"); break; } catch { /* Try shell output. */ }
}
if (!html || /http-equiv=["']refresh/i.test(html)) throw new Error("A real local SPA entry is required; remote redirects are forbidden.");
if (!html.includes("module")) throw new Error("Native entry has no application script.");
// Native fonts are bundled by CSS; remote fonts and advertising are unnecessary offline.
html = html.replace(/<link\b[^>]*href=["']https:\/\/fonts\.[^>]*>/g, "").replace(/<script\b[^>]*src=["']https:\/\/pagead2\.[^>]*>[\s\S]*?<\/script>/g, "");
await writeFile("dist/client/index.html", html);
await cp("dist/native-media", "dist/client/native-cache", { recursive: true });
await access("dist/client/native-cache");
console.log("Verified a local application entry and packaged media; no live-site redirect.");