import type { ForwardDialogStateProps } from "./forward-message-dialog.types";

interface ForwardDialogStateInput {
  hasLoadError: boolean;
  isLoading: boolean;
  isOnline: boolean;
  targetCount: number;
}

type ForwardDialogStatus = "empty" | "error" | "loading" | "offline";

const FORWARD_DIALOG_STATE_BY_STATUS: Record<
  ForwardDialogStatus,
  ForwardDialogStateProps
> = {
  empty: {
    description: "Start another chat before forwarding this message.",
    label: "There is nowhere else to forward this yet.",
  },
  error: {
    description: "Close this and try again in a moment.",
    label: "We couldn't load your conversations.",
    role: "alert",
  },
  loading: {
    description: "This usually takes a moment.",
    label: "Finding conversations...",
    role: "status",
  },
  offline: {
    description: "Reconnect before forwarding messages.",
    label: "You're offline.",
    role: "status",
  },
};

const FORWARD_DIALOG_STATE_CHECKS: Array<{
  isActive: (input: ForwardDialogStateInput) => boolean;
  status: ForwardDialogStatus;
}> = [
  {
    isActive: ({ isOnline }) => !isOnline,
    status: "offline",
  },
  {
    isActive: ({ isLoading }) => isLoading,
    status: "loading",
  },
  {
    isActive: ({ hasLoadError }) => hasLoadError,
    status: "error",
  },
  {
    isActive: ({ targetCount }) => targetCount === 0,
    status: "empty",
  },
];

export function getForwardDialogState({
  hasLoadError,
  isLoading,
  isOnline,
  targetCount,
}: ForwardDialogStateInput): ForwardDialogStateProps | null {
  const matchingState = FORWARD_DIALOG_STATE_CHECKS.find(({ isActive }) =>
    isActive({ hasLoadError, isLoading, isOnline, targetCount }),
  );

  return matchingState
    ? FORWARD_DIALOG_STATE_BY_STATUS[matchingState.status]
    : null;
}
