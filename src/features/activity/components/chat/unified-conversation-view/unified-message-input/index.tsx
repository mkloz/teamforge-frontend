import { memo } from "react";

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

  const containerClasses = cn(
    "relative flex min-w-0 flex-1 flex-col rounded-xl border transition-colors duration-300",
    composer.isRecording
      ? "border-destructive/20 bg-destructive/5"
      : composer.isFocused
        ? "border-forge-teal/40 bg-card shadow-[0_4px_16px_rgba(13,148,136,0.08)]"
        : "border-border/50 bg-card/60 shadow-sm",
  );

  return (
    <div className="safe-area-inset-bottom isolate z-30 min-h-16 shrink-0 overflow-visible border-t border-border/60 bg-canvas/90 px-3 pt-2 pb-2.5 backdrop-blur-xl">
      <div className="mx-auto flex w-full items-end gap-2.5">
        <div
          className={containerClasses}
          onDragOver={composer.handleDragOver}
          onDragLeave={composer.handleDragLeave}
          onDrop={composer.handleDrop}
        >
          {composer.isDraggingFiles && (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-xl border-2 border-dashed border-forge-teal bg-forge-teal/10 text-sm font-semibold text-forge-teal">
              Drop files to attach
            </div>
          )}
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

          <div className="relative z-10 flex min-h-11 w-full items-end">
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
              />
            )}
          </div>

          {composer.recordingError && (
            <p className="-mt-1 px-4 pb-1.5 text-xs font-medium text-destructive/80">
              {composer.recordingError === "permission-denied"
                ? "Microphone access denied. Check your browser settings."
                : composer.recordingError === "not-supported"
                  ? "Voice recording isn't supported on this browser."
                  : "Recording failed. Please try again."}
            </p>
          )}

          {errorMessage && (
            <p className="px-4 pb-1.5 text-xs font-medium text-destructive/80">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="mb-0.5 flex h-11 shrink-0 items-end">
          <ActionTarget
            hasContent={composer.hasDraft}
            isRecording={composer.isRecording}
            onSend={() => {
              void composer.handleSubmit();
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
