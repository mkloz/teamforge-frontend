import { scenarioRuntime } from "virtual:scenario-runtime";
import { io, type Socket } from "socket.io-client";

import { config } from "@/config/config";
import type { RealtimeEventName } from "@/shared/schemas";

type RealtimeConnectHandler = () => void;

const API_PREFIX_PATTERN = /\/api\/v\d+$/u;

function getApiUrl() {
  if (
    !scenarioRuntime.allows("realtime") ||
    !config.apiUrl ||
    import.meta.env.VITE_AUDIT_AUTH_ENABLED === "true"
  ) {
    return null;
  }

  return new URL(config.apiUrl);
}

function buildRealtimeUrl(apiUrl: URL) {
  return new URL("/realtime", apiUrl.origin).toString();
}

function buildSocketPath(apiUrl: URL) {
  const publicBasePath = apiUrl.pathname
    .replace(/\/+$/u, "")
    .replace(API_PREFIX_PATTERN, "");

  return `${publicBasePath}/socket.io`.replace(/\/{2,}/gu, "/");
}

class RealtimeClient {
  private socket: Socket | null = null;
  private token: string | null = null;
  private readonly handlers = new Map<
    string,
    Set<(...args: unknown[]) => void>
  >();
  private readonly connectHandlers = new Set<RealtimeConnectHandler>();

  syncSession(nextToken: string | null) {
    if (!nextToken) {
      this.token = null;
      this.disconnect();
      return;
    }

    if (this.socket && this.token === nextToken) {
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return;
    }

    this.token = nextToken;
    this.connect(nextToken);
  }

  reconnectSession(nextToken: string | null) {
    if (!nextToken) {
      this.token = null;
      this.disconnect();
      return;
    }

    this.token = nextToken;
    this.connect(nextToken);
  }

  onConnect(handler: RealtimeConnectHandler) {
    this.connectHandlers.add(handler);

    return () => {
      this.connectHandlers.delete(handler);
    };
  }

  isConnected() {
    return Boolean(this.socket?.connected);
  }

  on(event: RealtimeEventName, handler: (...args: unknown[]) => void) {
    const bucket =
      this.handlers.get(event) ?? new Set<(...args: unknown[]) => void>();
    bucket.add(handler);
    this.handlers.set(event, bucket);
    this.socket?.on(event, handler);

    return () => {
      bucket.delete(handler);
      this.socket?.off(event, handler);

      if (bucket.size === 0) {
        this.handlers.delete(event);
      }
    };
  }

  emit(event: RealtimeEventName, payload: unknown) {
    this.socket?.emit(event, payload);
  }

  private connect(token: string) {
    const apiUrl = getApiUrl();

    if (!apiUrl) {
      return;
    }

    this.disconnect();

    const socket = io(buildRealtimeUrl(apiUrl), {
      autoConnect: true,
      auth: {
        token,
      },
      path: buildSocketPath(apiUrl),
    });

    socket.on("connect", () => {
      this.notifyConnectHandlers();
    });

    for (const [event, handlers] of this.handlers.entries()) {
      for (const handler of handlers) {
        socket.on(event, handler);
      }
    }

    this.socket = socket;
  }

  private notifyConnectHandlers() {
    for (const handler of this.connectHandlers) {
      handler();
    }
  }

  private disconnect() {
    if (!this.socket) {
      return;
    }

    for (const [event, handlers] of this.handlers.entries()) {
      for (const handler of handlers) {
        this.socket.off(event, handler);
      }
    }

    this.socket.disconnect();
    this.socket = null;
  }
}

export const realtimeClient = new RealtimeClient();
