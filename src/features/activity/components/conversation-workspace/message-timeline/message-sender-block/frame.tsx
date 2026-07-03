import { getMessageBlockPositionStyle } from "../message-row-render-state";
import { getMessageRowsClassName, getSenderGroupClassName } from "./classnames";
import { MessageSenderBlockRows } from "./rows";
import { SenderAvatarSlot } from "./sender-avatar";
import { MessageBlockDateSeparator } from "./separators";
import type { MessageSenderBlockFrameProps } from "./types";

export function MessageSenderBlockFrame({
  block,
  blockRef,
  getMessageRef,
  highlightedMessageId,
  onShowParticipantProfile,
  rendererProps,
  renderState,
  selectionState,
}: MessageSenderBlockFrameProps) {
  const {
    hasHighlightedMessage,
    isSystemBlock,
    sender,
    shouldShowSenderAvatar,
  } = renderState;

  return (
    <div
      ref={blockRef}
      data-message-block-key={block.key}
      className="absolute right-0 left-0 flex min-w-0 max-w-full flex-col gap-0"
      style={getMessageBlockPositionStyle(block)}
    >
      <MessageBlockDateSeparator block={block} />

      <div
        className={getSenderGroupClassName({
          block,
          isSystemBlock,
        })}
      >
        <SenderAvatarSlot
          onShowParticipantProfile={onShowParticipantProfile}
          sender={sender}
          shouldShowSenderAvatar={shouldShowSenderAvatar}
        />

        <div
          className={getMessageRowsClassName({
            hasHighlightedMessage,
            isSystemBlock,
          })}
        >
          <MessageSenderBlockRows
            block={block}
            getMessageRef={getMessageRef}
            highlightedMessageId={highlightedMessageId}
            isSystemBlock={isSystemBlock}
            rendererProps={rendererProps}
            selectionState={selectionState}
          />
        </div>
      </div>
    </div>
  );
}
