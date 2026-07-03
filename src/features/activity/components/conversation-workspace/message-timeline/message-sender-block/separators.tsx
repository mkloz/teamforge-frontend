import { cn } from "@/shared/lib/utils";
import { DateSeparator } from "../date-separator";
import { NewMessagesSeparator } from "../new-messages-separator";
import type {
  MessageBlockDateSeparatorProps,
  MessageRowSeparatorProps,
} from "./types";

export function MessageBlockDateSeparator({
  block,
}: MessageBlockDateSeparatorProps) {
  if (!block.showDateSeparator) {
    return null;
  }

  return <DateSeparator date={block.date} />;
}

export function MessageRowSeparator({
  block,
  isSystemBlock,
  rowState,
}: MessageRowSeparatorProps) {
  if (!rowState.hasNewMessagesSeparator) {
    return null;
  }

  return (
    <div className={cn(!isSystemBlock && !block.isOwn && "-ml-11")}>
      <NewMessagesSeparator />
    </div>
  );
}
