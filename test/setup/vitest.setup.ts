import "@testing-library/jest-dom/vitest";

import { server } from "@test/support/msw/server";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { authApi } from "@/shared/api/api";
import { appQueryClient } from "@/shared/api/query-client";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  if (typeof document !== "undefined") {
    cleanup();
  }

  server.resetHandlers();
  appQueryClient.clear();
  authApi.clearSession();
});

afterAll(() => {
  server.close();
});
