import { useRef } from "react";

type OnLoadOlderMessages = () => Promise<void> | void;

export interface LoadOlderMessagesState {
  hasOlderMessages: boolean;
  isLoadingOlderMessages: boolean;
  olderLoadInFlight: boolean;
  onLoadOlderMessages?: OnLoadOlderMessages;
}

export interface LoadOlderMessagesRequestOptions {
  beforeLoad?: () => void;
}

const LOAD_OLDER_SCROLL_TOP_THRESHOLD_PX = 180;

export function useLoadOlderMessagesRequest({
  hasOlderMessages,
  isLoadingOlderMessages,
  onLoadOlderMessages,
}: Pick<
  LoadOlderMessagesState,
  "hasOlderMessages" | "isLoadingOlderMessages" | "onLoadOlderMessages"
>) {
  const olderLoadInFlightRef = useRef(false);

  function getLoadOlderState(): LoadOlderMessagesState {
    return {
      hasOlderMessages,
      isLoadingOlderMessages,
      olderLoadInFlight: olderLoadInFlightRef.current,
      onLoadOlderMessages,
    };
  }

  function requestLoadOlderMessages(
    options: LoadOlderMessagesRequestOptions = {},
  ) {
    const loadOlderState = getLoadOlderState();

    if (
      !canLoadOlderMessages(loadOlderState) ||
      !loadOlderState.onLoadOlderMessages
    ) {
      return false;
    }

    olderLoadInFlightRef.current = true;
    options.beforeLoad?.();
    void Promise.resolve(loadOlderState.onLoadOlderMessages()).finally(() => {
      olderLoadInFlightRef.current = false;
    });

    return true;
  }

  return {
    getLoadOlderState,
    requestLoadOlderMessages,
  };
}

export function shouldLoadOlderMessagesFromScroll({
  isScrollingUp,
  scrollTop,
  ...loadOlderState
}: Parameters<typeof canLoadOlderMessages>[0] & {
  isScrollingUp: boolean;
  scrollTop: number;
}) {
  return (
    isScrollingUp &&
    scrollTop < LOAD_OLDER_SCROLL_TOP_THRESHOLD_PX &&
    canLoadOlderMessages(loadOlderState)
  );
}

function canLoadOlderMessages({
  hasOlderMessages,
  isLoadingOlderMessages,
  olderLoadInFlight,
  onLoadOlderMessages,
}: LoadOlderMessagesState) {
  return (
    hasOlderMessages &&
    !isLoadingOlderMessages &&
    !olderLoadInFlight &&
    Boolean(onLoadOlderMessages)
  );
}
