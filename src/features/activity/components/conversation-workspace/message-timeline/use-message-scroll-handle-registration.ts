import { useImperativeHandle } from "react";
import type {
  MessageScrollHandle,
  ScrollToMessage,
} from "./message-scroll.types";
import type { MessageTimelineProps } from "./message-timeline.types";

export function useMessageScrollHandleRegistration({
  messageScrollHandleRef,
  scrollToMessage,
}: {
  messageScrollHandleRef: MessageTimelineProps["messageScrollHandleRef"];
  scrollToMessage: ScrollToMessage;
}) {
  useImperativeHandle<MessageScrollHandle | null, MessageScrollHandle | null>(
    messageScrollHandleRef,
    () => ({ scrollToMessage }),
    [scrollToMessage],
  );
}
