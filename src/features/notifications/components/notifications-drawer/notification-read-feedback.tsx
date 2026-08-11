import { Button } from "@/shared/components/ui/button";

export type NotificationReadAction = "mark-read" | "mark-unread";

export type NotificationReadFeedback =
  | {
      kind: "error";
      action: NotificationReadAction;
      notificationId: string;
      title: string;
    }
  | {
      kind: "success";
      message: string;
    }
  | null;

interface NotificationReadFeedbackNoticeProps {
  feedback: NotificationReadFeedback;
  isRetrying: boolean;
  onRetry: () => void;
}

export function NotificationReadFeedbackNotice({
  feedback,
  isRetrying,
  onRetry,
}: NotificationReadFeedbackNoticeProps) {
  return (
    <>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {feedback?.kind === "success" ? feedback.message : ""}
      </p>
      {feedback?.kind === "error" ? (
        <div
          className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2 text-sm"
          role="alert"
        >
          <p className="min-w-0 text-foreground">
            We couldn&apos;t mark <strong>{feedback.title}</strong> as{" "}
            {getNotificationReadStateLabel(feedback.action)}. Its previous state
            was restored.
          </p>
          <Button
            size="sm"
            variant="outline"
            loading={isRetrying}
            onClick={onRetry}
            className="shrink-0"
          >
            Retry
          </Button>
        </div>
      ) : null}
    </>
  );
}

export function getNotificationReadSuccessMessage(
  title: string,
  action: NotificationReadAction,
) {
  return `${title} marked ${getNotificationReadStateLabel(action)}.`;
}

function getNotificationReadStateLabel(action: NotificationReadAction) {
  return action === "mark-read" ? "read" : "unread";
}
