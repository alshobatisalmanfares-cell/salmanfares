import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { NATIVE_APP, nativeServerUrl } from "@/lib/native-runtime";

// Capacitor's native HTTP bridge preserves the RPC protocol and bypasses WebView CORS.
const nativeTransport = createMiddleware({ type: "function" }).client(({ next }) => next({
  fetch: async (input, init) => {
    if (!NATIVE_APP) return fetch(input, init);
    const url = input instanceof Request ? input.url : String(input);
    return fetch(nativeServerUrl(url), init);
  },
}));

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth, nativeTransport],
  requestMiddleware: [errorMiddleware],
}));
