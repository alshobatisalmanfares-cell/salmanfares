import { useEffect, useState } from "react";

export type ChatModel = "google/gemini-3-flash-preview" | "google/gemini-2.5-flash" | "google/gemini-2.5-flash-lite";
export type FontSize = "sm" | "md" | "lg";
export type AppSettings = { model: ChatModel; memoryEnabled: boolean; fontSize: FontSize };

const KEY = "app:settings";
const DEFAULTS: AppSettings = { model: "google/gemini-3-flash-preview", memoryEnabled: true, fontSize: "md" };
const listeners = new Set<(s: AppSettings) => void>();

export function readSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return DEFAULTS;
  }
}

export function applyFontSize(size: FontSize) {
  document.documentElement.style.fontSize = size === "sm" ? "14px" : size === "lg" ? "18px" : "";
}

export function writeSettings(patch: Partial<AppSettings>) {
  const next = { ...readSettings(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  applyFontSize(next.fontSize);
  listeners.forEach((fn) => fn(next));
}

export function useAppSettings() {
  const [s, setS] = useState<AppSettings>(DEFAULTS);
  useEffect(() => {
    setS(readSettings());
    listeners.add(setS);
    return () => {
      listeners.delete(setS);
    };
  }, []);
  return [s, writeSettings] as const;
}
