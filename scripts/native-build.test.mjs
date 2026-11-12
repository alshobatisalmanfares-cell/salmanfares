import { test } from "node:test";
import assert from "node:assert/strict";
import { downloadNative } from "./native-download.mjs";

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