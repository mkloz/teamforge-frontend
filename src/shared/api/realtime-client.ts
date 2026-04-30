import { io, type Socket } from "socket.io-client";

import { config } from "@/config/config";
import type { RealtimeEventName } from "@/shared/schemas";

function buildRealtimeUrl() {
  if (!config.apiUrl) {
    return null;
  }

  const apiUrl = new URL(config.apiUrl);
  return new URL("/realtime", apiUrl.origin).toString();
}

class RealtimeClient {
  private socket: Socket | null = null;
  private token: string | null = null;
  private readonly handlers = new Map<
    string,
    Set<(...args: unknown[]) => void>
  >();

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
    const url = buildRealtimeUrl();

    if (!url) {
      return;
    }

    this.disconnect();

    const socket = io(url, {
      autoConnect: true,
      auth: {
        token,
      },
      transports: ["websocket"],
    });

    for (const [event, handlers] of this.handlers.entries()) {
      for (const handler of handlers) {
        socket.on(event, handler);
      }
    }

    this.socket = socket;
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
