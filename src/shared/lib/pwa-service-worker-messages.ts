export const PWA_SERVICE_WORKER_MESSAGE_TYPES = {
  notificationClick: "teamforge:pwa-notification-click",
  pushReceived: "teamforge:pwa-push-received",
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

export function isPwaServiceWorkerMessage(
  value: unknown,
): value is PwaServiceWorkerMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PwaServiceWorkerMessage>;

  return (
    isMessageType(candidate.type) &&
    typeof candidate.route === "string" &&
    typeof candidate.url === "string" &&
    typeof candidate.sentAt === "number"
  );
}
