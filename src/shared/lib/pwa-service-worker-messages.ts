export const PWA_SERVICE_WORKER_MESSAGE_TYPES = {
  notificationClick: "findafew:pwa-notification-click",
  pushReceived: "findafew:pwa-push-received",
} as const;

export type PwaServiceWorkerMessageType =
  (typeof PWA_SERVICE_WORKER_MESSAGE_TYPES)[keyof typeof PWA_SERVICE_WORKER_MESSAGE_TYPES];

export interface PwaServiceWorkerMessage {
  badgeCount?: number;
  notificationTag?: string;
  route: string;
  sentAt: number;
  type: PwaServiceWorkerMessageType;
  url: string;
}

function isMessageType(value: unknown): value is PwaServiceWorkerMessageType {
  return Object.values(PWA_SERVICE_WORKER_MESSAGE_TYPES).some(
    (type) => type === value,
  );
}

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return Boolean(value) && typeof value === "object";
}

function hasRequiredPwaMessageFields(candidate: Record<PropertyKey, unknown>) {
  return (
    isMessageType(candidate.type) &&
    typeof candidate.route === "string" &&
    typeof candidate.url === "string" &&
    typeof candidate.sentAt === "number"
  );
}

export function isPwaServiceWorkerMessage(
  value: unknown,
): value is PwaServiceWorkerMessage {
  if (!isRecord(value)) {
    return false;
  }

  return hasRequiredPwaMessageFields(value);
}
