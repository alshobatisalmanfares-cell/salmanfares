import { test } from "node:test";
import assert from "node:assert/strict";
import { downloadNative } from "./native-download.mjs";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

test("finalization preserves the local shell and copies media into the Capacitor package", async () => {
  const directory = await mkdtemp(join(tmpdir(), "native-finalize-"));
  try {
    await mkdir(join(directory, "dist/client"), { recursive: true });
    await mkdir(join(directory, "node_modules/.cache/native-media"), { recursive: true });
    const html = '<html><script type="module" src="/assets/app.js"></script></html>';
    await writeFile(join(directory, "dist/client/.html"), html);
    await writeFile(join(directory, "node_modules/.cache/native-media/image.png"), "fixture-image");
    execFileSync(process.execPath, [resolve("scripts/finalize-native.mjs")], { cwd: directory });
    assert.equal(await readFile(join(directory, "dist/client/index.html"), "utf8"), html);
    assert.equal(await readFile(join(directory, "dist/client/native-cache/image.png"), "utf8"), "fixture-image");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

const decode = response => response.text();
const wait = async () => {};

test("retries connection failures instead of terminating image preparation", async () => {
  let calls = 0;
  const result = await downloadNative("https://example.invalid/image", {
    label: "Item thumbnail", decode, wait,
    fetchImpl: async () => {
      if (++calls === 1) throw new TypeError("fetch failed");
      return new Response("image bytes");
    },
  });
  assert.equal(result, "image bytes");
  assert.equal(calls, 2);
});

test("retries interrupted body reads", async () => {
  let calls = 0;
  assert.equal(await downloadNative("https://example.invalid/image", {
    label: "Item thumbnail", decode, wait,
    fetchImpl: async () => ++calls === 1
      ? { ok: true, text: async () => { throw new Error("connection reset"); } }
      : new Response("complete"),
  }), "complete");
  assert.equal(calls, 2);
});

test("rate limit retries are bounded and recover", async () => {
  let calls = 0;
  const delays = [];
  await downloadNative("https://example.invalid/catalog", {
    label: "Public catalog", decode,
    wait: async delay => { delays.push(delay); },
    fetchImpl: async () => ++calls === 1
      ? new Response("", { status: 429, headers: { "retry-after": "99999" } })
      : new Response("[]"),
  });
  assert.deepEqual(delays, [30000]);
  assert.equal(calls, 2);
});

test("permanent missing assets fail immediately rather than producing incomplete APKs", async () => {
  let calls = 0;
  await assert.rejects(downloadNative("https://example.invalid/image", {
    label: "Item 123 thumbnail", decode, wait,
    fetchImpl: async () => { calls++; return new Response("", { status: 404 }); },
  }), /Item 123 thumbnail failed: HTTP 404/);
  assert.equal(calls, 1);
});

test("transport errors stop after four attempts", async () => {
  let calls = 0;
  await assert.rejects(downloadNative("https://example.invalid/catalog", {
    label: "Public catalog", decode, wait,
    fetchImpl: async () => { calls++; throw new Error("network unavailable"); },
  }), /Public catalog failed: network unavailable/);
  assert.equal(calls, 4);
});