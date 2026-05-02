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
    "flex-1 flex flex-col min-w-0 transition-colors duration-300 relative rounded-3xl border",
    composer.isRecording
      ? "bg-red-500/5 border-red-500/20"
      : composer.isFocused
        ? "bg-card border-forge-teal/40 shadow-[0_4px_16px_rgba(13,148,136,0.08)]"
        : "bg-card/60 border-border/50 shadow-sm",
  );

  return (
    <div className="shrink-0 px-3 pt-2 pb-2.5 border-t border-border/60 bg-canvas/90 backdrop-blur-xl safe-area-inset-bottom z-30 isolate overflow-visible min-h-16">
      <div className="flex items-end gap-2.5 w-full mx-auto">
        <div
          className={containerClasses}
          onDragOver={composer.handleDragOver}
          onDragLeave={composer.handleDragLeave}
          onDrop={composer.handleDrop}
        >
          {composer.isDraggingFiles && (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-3xl border-2 border-dashed border-forge-teal bg-forge-teal/10 text-sm font-semibold text-forge-teal">
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

          <div className="flex items-end min-h-11 w-full relative z-10">
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
            <p className="text-[10px] text-red-500/80 font-medium px-4 pb-1.5 -mt-1">
              {composer.recordingError === "permission-denied"
                ? "Microphone access denied. Check your browser settings."
                : composer.recordingError === "not-supported"
                  ? "Voice recording isn't supported on this browser."
                  : "Recording failed. Please try again."}
            </p>
          )}

          {errorMessage && (
            <p className="px-4 pb-1.5 text-[10px] font-medium text-red-500/80">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="shrink-0 flex items-end h-11 mb-0.5">
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
