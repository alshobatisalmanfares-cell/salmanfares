import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { nativeServerUrl } from "./native-runtime";

describe("offline Android packaging", () => {
  it("does not use a live website URL for the app shell", () => {
    const config = readFileSync("capacitor.config.ts", "utf8");
    expect(config).not.toMatch(/url:\s*["']https?:/);
    expect(config).toContain('webDir: "dist/client"');
  });
  it("keeps the generated server-function protocol on the hosted origin", () => {
    expect(nativeServerUrl("https://localhost/_serverFn/test?x=1")).toBe("https://salmanfares.lovable.app/_serverFn/test?x=1");
  });
  it("fails instead of inserting a remote redirect when the local shell is missing", () => {
    const workflow = readFileSync(".github/workflows/build-apk.yml", "utf8");
    expect(workflow).toContain("npm run build:native");
    expect(workflow).not.toContain("http-equiv");
  });
});