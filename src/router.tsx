import { createRootRoute, createRouter } from "@tanstack/react-router";

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const rootRoute = createRootRoute({
  component: () => <div>Root</div>,
});

const routeTree = rootRoute.addChildren([]);

export const router = createRouter({
  routeTree,
});
