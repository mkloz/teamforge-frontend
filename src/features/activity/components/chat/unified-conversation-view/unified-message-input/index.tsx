import { Paperclip, X } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ErrorMessageSendFailedVisual } from "@/features/activity/assets/error-message-send-failed";
import { getActivityPopupPanelClass } from "@/features/activity/components/activity-popup-styles";
import type { ActivitySendMessageInput } from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import { cn } from "@/shared/lib/utils";

import { ActionTarget } from "./action-target";
import { AttachmentPreviewPanel } from "./attachment-preview-panel";
import { ChatDropzoneOverlay } from "./chat-dropzone-overlay";
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
  onCreateProposal?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const UnifiedMessageInput = memo(function UnifiedMessageInput({
  chatId = null,
  errorMessage = null,
  onSend,
  onClearError,
  onCreateProposal,
  disabled = false,
  placeholder = "Type a message...",
}: UnifiedMessageInputProps) {
  const inputRootRef = useRef<HTMLDivElement>(null);
  const [dropzoneRoot, setDropzoneRoot] = useState<HTMLElement | null>(null);
  const composer = useMessageComposer({
    chatId,
    disabled,
    dropzoneRoot,
    errorMessage,
    onClearError,
    onSend,
  });

  const hasContextPanel =
    (!composer.isEditing && composer.replyingTo) ||
    composer.isEditing ||
    composer.pendingAttachments.length > 0 ||
    !composer.isOnline ||
    Boolean(composer.attachmentNotice) ||
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
  const isActionTargetDisabled = composer.isRecording
    ? false
    : composer.areNetworkActionsDisabled;

  useEffect(() => {
    setDropzoneRoot(
      inputRootRef.current?.closest<HTMLElement>("[data-chat-dropzone-root]") ??
        null,
    );
  }, []);

  return (
    <div
      ref={inputRootRef}
      className="isolate z-30 min-h-16 shrink-0 overflow-visible border-border/60 border-t bg-canvas/90 px-2.5 pt-2 pb-safe-bottom backdrop-blur-xl sm:px-3"
    >
      {dropzoneRoot && composer.isDraggingFiles
        ? createPortal(<ChatDropzoneOverlay />, dropzoneRoot)
        : null}

      <div className="mx-auto flex w-full items-center gap-2 sm:gap-2.5">
        <div className="relative min-w-0 flex-1">
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
                disabled={composer.areNetworkActionsDisabled}
                files={composer.pendingAttachments.map(
                  (attachment) => attachment.file,
                )}
                isEditing={composer.isEditing}
                onAppendAttachments={composer.appendAttachments}
                onRemoveAttachment={composer.removeAttachment}
              />

              {composer.attachmentNotice && (
                <div
                  role="status"
                  className="flex items-center gap-2 px-3 py-2.5 text-slate-muted"
                >
                  <Paperclip className="size-4 shrink-0" aria-hidden="true" />
                  <p className="min-w-0 flex-1 font-medium text-xs">
                    {composer.attachmentNotice}
                  </p>
                </div>
              )}

              {!composer.isOnline && (
                <OfflineNotice
                  size="xs"
                  iconClassName="mt-0"
                  className="items-center border-0 bg-transparent px-3 py-2.5 text-spark-amber"
                  contentClassName="font-medium"
                >
                  <p>
                    You are offline. Reconnect before sending messages or adding
                    attachments.
                  </p>
                </OfflineNotice>
              )}

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
                <div
                  role="alert"
                  className="flex items-center gap-2 px-3 py-2.5"
                >
                  <ErrorMessageSendFailedVisual className="h-5 w-auto shrink-0 text-foreground" />
                  <p className="min-w-0 flex-1 font-medium text-destructive/80 text-xs">
                    {errorMessage}
                  </p>
                  {onClearError ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Dismiss send error"
                      className="size-7 shrink-0 rounded-full text-slate-muted focus-visible:ring-destructive/25 hover:enabled:bg-destructive/8 hover:enabled:text-destructive"
                      onClick={onClearError}
                    >
                      <X className="size-3.5" />
                    </Button>
                  ) : null}
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
                  composer.isEditing
                    ? () => {}
                    : composer.appendImageAttachments
                }
                onSelectFiles={
                  composer.isEditing ? () => {} : composer.appendAttachments
                }
                controlsDisabled={composer.areNetworkActionsDisabled}
                canAttach={!composer.isEditing}
                canSendGif={!composer.isEditing && composer.isOnline}
                onCreateProposal={
                  composer.isEditing ? undefined : onCreateProposal
                }
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
              if (!isActionTargetDisabled) {
                void composer.startRecording();
              }
            }}
            onStopRecording={() => {
              if (composer.isRecording || !isActionTargetDisabled) {
                void composer.handleStopRecording();
              }
            }}
            disabled={isActionTargetDisabled}
          />
        </div>
      </div>
    </div>
  );
});
