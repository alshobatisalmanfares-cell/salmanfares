import { loadEnv } from "vite";
import { mkdir, writeFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { downloadNative } from "./native-download.mjs";

const env = { ...loadEnv("production", process.cwd(), "VITE_"), ...process.env };
const origin = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!origin || !key) throw new Error("Native packaging needs VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env or the build environment.");
const rows = await downloadNative(`${origin}/rest/v1/items?select=*&order=sort_order.desc,created_at.desc`, {
  label: "Public catalog", headers: { apikey: key }, decode: response => response.json(),
});
if (!Array.isArray(rows)) throw new Error("Public catalog must be an array of items");
await mkdir("node_modules/.cache/native-media", { recursive: true });
const media = new Map();
async function localMedia(url, label) {
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
  const extensions = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg" };
  const { ext, bytes } = await downloadNative(url, {
    label,
    decode: async response => {
      const ext = extensions[(response.headers.get("content-type") ?? "").split(";")[0].trim()];
      if (!ext) throw Object.assign(new Error("Catalog media must be an image"), { permanent: true });
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (!bytes.length) throw new Error("Catalog image is empty");
      return { ext, bytes };
    },
  });
  const name = `${hash}.${ext}`;
  await writeFile(`node_modules/.cache/native-media/${name}`, bytes);
  const path = `/native-cache/${name}`;
  media.set(url, path);
  return path;
}
for (const row of rows) {
  row.image_url = await localMedia(row.image_url, `Item ${row.id} thumbnail`);
  const gallery = [];
  for (const image of row.gallery ?? []) gallery.push(await localMedia(image, `Item ${row.id} gallery image ${gallery.length + 1}`));
  row.gallery = gallery;
}
await writeFile("src/lib/native-catalog.json", JSON.stringify(rows));
console.log(`Packaged ${rows.length} public catalog entries and ${media.size} local images.`);