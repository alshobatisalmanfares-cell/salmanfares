import { z } from "zod";

export const ImageSchema = z.object({
  dataUrl: z.string().max(7_000_000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/),
});

export function imageMessage(content: string, image?: { dataUrl: string }) {
  return image
    ? [{ type: "text" as const, text: content }, { type: "image_url" as const, image_url: { url: image.dataUrl } }]
    : content;
}

export async function readImage(file: File): Promise<{ dataUrl: string }> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    throw new Error("اختر صورة PNG أو JPEG أو WebP");
  }
  if (!file.size || file.size > 5 * 1024 * 1024) throw new Error("حجم الصورة يجب ألا يتجاوز 5 ميغابايت");
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("تعذّر قراءة الصورة"));
    reader.onerror = () => reject(new Error("تعذّر قراءة الصورة"));
    reader.readAsDataURL(file);
  });
  return ImageSchema.parse({ dataUrl });
}