import { useEffect, useState } from "react";

type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

let deferredPrompt: PromptEvent | null = null;
const listeners = new Set<(e: PromptEvent | null) => void>();

function emit() {
  listeners.forEach((fn) => fn(deferredPrompt));
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as PromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    emit();
  });
}

export function usePwaInstall() {
  const [prompt, setPrompt] = useState<PromptEvent | null>(deferredPrompt);

  useEffect(() => {
    const fn = (e: PromptEvent | null) => setPrompt(e);
    listeners.add(fn);
    setPrompt(deferredPrompt);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  async function install(): Promise<"accepted" | "dismissed" | "unavailable"> {
    if (!prompt) return "unavailable";
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      deferredPrompt = null;
      emit();
      return choice.outcome === "accepted" ? "accepted" : "dismissed";
    } catch {
      return "unavailable";
    }
  }

  return { canInstall: !!prompt, install };
}