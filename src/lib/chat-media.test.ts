import { describe, expect, it } from "vitest";
import { ImageSchema, imageMessage } from "./chat-media";

describe("uploaded vision images", () => {
  it("sends image bytes in an image part, not just a filename", () => {
    const image = { dataUrl: "data:image/png;base64,aGVsbG8=" };
    expect(imageMessage("Read this image", image)).toEqual([
      { type: "text", text: "Read this image" },
      { type: "image_url", image_url: { url: image.dataUrl } },
    ]);
  });
  it("rejects filenames and non-image payloads", () => {
    expect(ImageSchema.safeParse({ dataUrl: "photo.png" }).success).toBe(false);
    expect(ImageSchema.safeParse({ dataUrl: "data:text/html;base64,aGVsbG8=" }).success).toBe(false);
  });
});