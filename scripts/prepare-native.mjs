import { loadEnv } from "vite";
import { mkdir, writeFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";

const env = { ...loadEnv("production", process.cwd(), "VITE_"), ...process.env };
const origin = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!origin || !key) throw new Error("Native packaging needs the public Cloud URL and publishable key in repository variables.");
const response = await fetch(`${origin}/rest/v1/items?select=*&order=sort_order.desc,created_at.desc`, { headers: { apikey: key } });
if (!response.ok) throw new Error(`Cannot package catalog: ${response.status}`);
const rows = await response.json();
await mkdir("node_modules/.cache/native-media", { recursive: true });
const media = new Map();
async function localMedia(url) {
  if (!url || !url.startsWith("https://")) return url;
  if (media.has(url)) return media.get(url);
  const hash = createHash("sha256").update(url).digest("hex");
  for (const ext of ["jpg", "png", "webp", "gif", "svg"]) {
    try {
      await access(`node_modules/.cache/native-media/${hash}.${ext}`);
      const path = `/native-cache/${hash}.${ext}`;
      media.set(url, path);
      return path;
    } catch { /* Not cached by an earlier run. */ }
  }
  let r;
  for (let attempt = 0; attempt < 4; attempt++) {
    r = await fetch(url);
    if (r.ok || (r.status !== 429 && r.status < 500)) break;
    await new Promise(resolve => setTimeout(resolve, Math.max(Number(r.headers.get("retry-after") ?? 0) * 1000, 2000 * 2 ** attempt)));
  }
  if (!r) throw new Error("Image request did not complete");
  if (!r.ok) throw new Error(`Cannot package a catalog image: ${r.status}`);
  const extensions = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg" };
  const ext = extensions[(r.headers.get("content-type") ?? "").split(";")[0]];
  if (!ext) throw new Error("Catalog media must be an image");
  const name = `${hash}.${ext}`;
  await writeFile(`node_modules/.cache/native-media/${name}`, new Uint8Array(await r.arrayBuffer()));
  const path = `/native-cache/${name}`;
  media.set(url, path);
  return path;
}
for (const row of rows) {
  row.image_url = await localMedia(row.image_url);
  const gallery = [];
  for (const image of row.gallery ?? []) gallery.push(await localMedia(image));
  row.gallery = gallery;
}
await writeFile("src/lib/native-catalog.json", JSON.stringify(rows));
console.log(`Packaged ${rows.length} public catalog entries and ${media.size} local images.`);