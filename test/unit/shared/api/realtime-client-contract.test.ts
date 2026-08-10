import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { ioMock, socket } = vi.hoisted(() => {
  const socketFixture = {
    connect: vi.fn<() => void>(),
    connected: false,
    disconnect: vi.fn<() => void>(),
    off: vi.fn<(event: string) => void>(),
    on: vi.fn<(event: string, listener: () => void) => void>(),
  };

  return {
    ioMock: vi.fn<
      (url: string, options: Record<string, unknown>) => typeof socketFixture
    >(() => socketFixture),
    socket: socketFixture,
  };
});

vi.mock("socket.io-client", () => ({ io: ioMock }));
vi.mock("virtual:scenario-runtime", () => ({
  scenarioRuntime: { allows: () => true },
}));
vi.mock("@/config/config", () => ({
  config: {
    apiUrl: "https://api.findafew.today/findafew/api/v1",
  },
}));

import { realtimeClient } from "@/shared/api/realtime-client";

describe("realtime browser contract", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_AUDIT_AUTH_ENABLED", "false");
  });

  afterEach(() => {
    realtimeClient.syncSession(null);
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("uses the exact namespace/path and permits polling-to-websocket upgrade", () => {
    realtimeClient.syncSession("access-token");

    expect(ioMock).toHaveBeenCalledWith(
      "https://api.findafew.today/realtime",
      expect.objectContaining({
        auth: { token: "access-token" },
        path: "/findafew/socket.io",
      }),
    );
    const options = ioMock.mock.calls[0]?.[1];
    expect(options).not.toHaveProperty("transports");
    expect(socket.on).toHaveBeenCalledWith("connect", expect.any(Function));
  });
});
