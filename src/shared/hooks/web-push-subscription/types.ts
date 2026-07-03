import type { QueryClient } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";

import type { PwaTelemetrySource } from "@/shared/lib/pwa-telemetry";
import type {
  BrowserNotificationPermission,
  WebPushSupport,
} from "@/shared/lib/web-push-browser";
import type {
  WebPushSubscription,
  WebPushTestDispatch,
} from "@/shared/schemas";

export interface WebPushActionVariables {
  source?: PwaTelemetrySource;
}

export interface WebPushPublicKeyState {
  enabled: boolean;
  publicKey: string;
}

export interface BrowserPushSubscriptionState {
  browserEndpoint: string | null;
  isCheckingBrowserSubscription: boolean;
  permission: BrowserNotificationPermission;
  refreshBrowserSubscription: () => Promise<void>;
  setBrowserEndpoint: (endpoint: string | null) => void;
  setPermission: (permission: BrowserNotificationPermission) => void;
  support: WebPushSupport;
}

export interface WebPushMutationSharedContext {
  queryClient: QueryClient;
  refreshBrowserSubscription: () => Promise<void>;
  setLastTestResult: Dispatch<SetStateAction<WebPushTestDispatch | null>>;
}

export interface SubscribeWebPushMutationContext
  extends WebPushMutationSharedContext {
  browserEndpoint: string | null;
  getPublicKeyState: () => Promise<WebPushPublicKeyState>;
  setBrowserEndpoint: (endpoint: string | null) => void;
  setPermission: (permission: BrowserNotificationPermission) => void;
}

export interface UnsubscribeWebPushMutationContext
  extends WebPushMutationSharedContext {
  browserEndpoint: string | null;
  setBrowserEndpoint: (endpoint: string | null) => void;
  setPermission: (permission: BrowserNotificationPermission) => void;
}

export interface WebPushDerivedStateInput {
  browserEndpoint: string | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  permission: BrowserNotificationPermission;
  publicKeyError: unknown;
  publicKeyIsError: boolean;
  publicKeyIsLoading: boolean;
  publicKeyState: WebPushPublicKeyState | undefined;
  serverSubscriptions: WebPushSubscription[];
  support: WebPushSupport;
}
