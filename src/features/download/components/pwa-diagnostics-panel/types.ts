import type { LucideIcon } from "lucide-react";

import type { IconTileTone } from "@/shared/components/ui/icon-tile";
import type { StatusPillTone } from "@/shared/components/ui/status-pill";
import type { useServiceWorkerDiagnostics } from "@/shared/hooks/use-service-worker-diagnostics";
import type { useWebPushSubscription } from "@/shared/hooks/use-web-push-subscription";

export type DiagnosticTone = "blocked" | "neutral" | "ready" | "warning";

export interface DiagnosticAction {
  disabled?: boolean;
  icon?: LucideIcon;
  label: string;
  loading?: boolean;
  onClick: () => void;
}

export interface DiagnosticItem {
  action?: DiagnosticAction;
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: DiagnosticTone;
  value: string;
}

export interface DiagnosticItemState {
  detail: string;
  tone: DiagnosticTone;
  value: string;
}

export interface DiagnosticItemRule<TInput> {
  state: DiagnosticItemState;
  shouldUse: (input: TInput) => boolean;
}

export type PushDiagnosticsState = ReturnType<typeof useWebPushSubscription>;

export type ServiceWorkerDiagnosticsState = ReturnType<
  typeof useServiceWorkerDiagnostics
>;

export type NonActiveServiceWorkerStatus = Exclude<
  ServiceWorkerDiagnosticsState["status"],
  "active"
>;

export type DiagnosticIconTones = Record<DiagnosticTone, IconTileTone>;

export type DiagnosticStatusTones = Record<DiagnosticTone, StatusPillTone>;
