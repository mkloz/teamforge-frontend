import { memo } from "react";

import { ErrorMessageSendFailedVisual } from "@/assets/error-state/error-message-send-failed";
import { getActivityPopupPanelClass } from "@/features/activity/components/activity-popup-styles";
import type { ActivitySendMessageInput } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";

import { ActionTarget } from "./action-target";
import { AttachmentPreviewPanel } from "./attachment-preview-panel";
import { EditingMessageBanner } from "./editing-message-banner";
import { InputRow } from "./input-row";
import { RecordingOverlay } from "./recording-overlay";
import { ReplyPreview } from "./reply-preview";
import { useMessageComposer } from "./use-message-composer";

interface UnifiedMessageInputProps {
  chatId?: string | null;
  errorMessage?: string | null;
  onSend: (input: ActivitySendMessageInput) => Promise<void> | void;
  onClearError?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const UnifiedMessageInput = memo(function UnifiedMessageInput({
  chatId = null,
  errorMessage = null,
  onSend,
  onClearError,
  disabled = false,
  placeholder = "Type a message...",
}: UnifiedMessageInputProps) {
  const composer = useMessageComposer({
    chatId,
    disabled,
    errorMessage,
    onClearError,
    onSend,
  });

  const hasContextPanel =
    (!composer.isEditing && composer.replyingTo) ||
    composer.isEditing ||
    composer.pendingAttachments.length > 0 ||
    Boolean(composer.recordingError) ||
    Boolean(errorMessage);
  const inputPillClasses = cn(
    "relative flex min-h-11 min-w-0 flex-1 rounded-full border transition-colors duration-300",
    composer.isRecording
      ? "border-destructive/20 bg-destructive/5"
      : composer.isFocused
        ? "border-forge-teal/40 bg-card shadow-sm"
        : "border-border/50 bg-card/60 shadow-sm",
  );

  return (
    <div className="safe-area-inset-bottom isolate z-30 min-h-16 shrink-0 overflow-visible border-border/60 border-t bg-canvas/90 px-2.5 pt-2 pb-2.5 backdrop-blur-xl sm:px-3">
      <div className="mx-auto flex w-full items-center gap-2 sm:gap-2.5">
        {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: File drag/drop is pointer-only decoration around the actual message controls. */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: The keyboard-accessible controls live inside this drop zone. */}
        <div
          className="relative min-w-0 flex-1"
          onDragOver={composer.handleDragOver}
          onDragLeave={composer.handleDragLeave}
          onDrop={composer.handleDrop}
        >
          {composer.isDraggingFiles && (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-full border-2 border-forge-teal border-dashed bg-forge-teal/10 font-semibold text-forge-teal text-sm">
              Drop files to attach
            </div>
          )}
          {hasContextPanel && (
            <div
              className={getActivityPopupPanelClass(
                "absolute right-0 bottom-full left-0 z-20 mb-2 max-h-96 overflow-y-auto rounded-lg bg-card/95",
              )}
            >
              <ReplyPreview
                replyingTo={composer.isEditing ? null : composer.replyingTo}
                onClear={composer.clearReply}
              />

              {composer.isEditing && composer.editingMessage && (
                <EditingMessageBanner onCancel={composer.cancelEditing} />
              )}

              <AttachmentPreviewPanel
                disabled={composer.isDisabled}
                files={composer.pendingAttachments.map(
                  (attachment) => attachment.file,
                )}
                isEditing={composer.isEditing}
                onAppendAttachments={composer.appendAttachments}
                onRemoveAttachment={composer.removeAttachment}
              />

              {composer.recordingError && (
                <p className="px-4 py-2 font-medium text-destructive/80 text-xs">
                  {composer.recordingError === "permission-denied"
                    ? "Microphone access denied. Check your browser settings."
                    : composer.recordingError === "not-supported"
                      ? "Voice recording isn't supported on this browser."
                      : "Recording failed. Please try again."}
                </p>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2 px-4 py-2">
                  <ErrorMessageSendFailedVisual className="h-5 w-auto shrink-0 text-foreground" />
                  <p className="font-medium text-destructive/80 text-xs">
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className={inputPillClasses}>
            {composer.isRecording ? (
              <RecordingOverlay
                timeLabel={composer.formatRecordingTime(composer.recordingTime)}
              />
            ) : (
              <InputRow
                value={composer.value}
                onChange={composer.handleValueChange}
                onKeyDown={composer.handleKeyDown}
                onFocus={() => composer.setIsFocused(true)}
                onBlur={() => composer.setIsFocused(false)}
                textareaRef={composer.textareaRef}
                onInsertEmoji={composer.insertEmoji}
                onSelectGif={composer.sendGif}
                placeholder={
                  composer.isEditing ? "Edit your message..." : placeholder
                }
                disabled={composer.isDisabled}
                onSelectImages={
                  composer.isEditing ? () => {} : composer.appendAttachments
                }
                onSelectFiles={
                  composer.isEditing ? () => {} : composer.appendAttachments
                }
                canAttach={!composer.isEditing}
                canSendGif={!composer.isEditing}
              />
            )}
          </div>
        </div>

        <div className="flex h-11 shrink-0 items-center">
          <ActionTarget
            hasContent={composer.hasDraft}
            isRecording={composer.isRecording}
            onSend={() => {
              composer.handleSubmit();
            }}
            onCancelRecording={composer.cancelRecording}
            onStartRecording={() => {
              if (!composer.isDisabled) void composer.startRecording();
            }}
            onStopRecording={() => {
              if (!composer.isDisabled) void composer.handleStopRecording();
            }}
            disabled={composer.isDisabled}
          />
        </div>
      </div>
    </div>
  );
});
