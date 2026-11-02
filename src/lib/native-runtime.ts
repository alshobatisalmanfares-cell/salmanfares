export const NATIVE_APP = import.meta.env.VITE_NATIVE_APP === "true";
export const HOSTED_ORIGIN = "https://salmanfares.lovable.app";

export function nativeServerUrl(input: string) {
  return new URL(new URL(input, "https://localhost").pathname + new URL(input, "https://localhost").search, HOSTED_ORIGIN).href;
}

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; }
  catch { return fallback; }
}

export function writeLocal(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { /* Storage may be full or disabled; never break the interface. */ }
}