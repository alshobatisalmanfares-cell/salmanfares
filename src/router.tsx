import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { NATIVE_APP } from "./lib/native-runtime";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { networkMode: NATIVE_APP ? "always" : "online" } },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
