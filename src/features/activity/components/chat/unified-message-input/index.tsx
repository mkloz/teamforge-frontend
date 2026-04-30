import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useVoiceRecording } from "@/features/activity/hooks/use-voice-recording";
import { useChatTypingSignal } from "@/features/activity/hooks/use-chat-typing-signal";
import type {
  ActivityOutgoingAttachment,
  ActivitySendMessageInput,
} from "@/features/activity/lib/activity-contract";
import { useActivityStore } from "@/features/activity/store/activity.store";
import { Button } from "@/shared/components/ui/button";
import { useAutoResize } from "@/shared/hooks/use-auto-resize";
import { cn } from "@/shared/lib/utils";
import { FileText, Image as ImageIcon, PencilLine, X } from "lucide-react";

import { ActionTarget } from "./action-target";
import { InputRow } from "./input-row";
import { RecordingOverlay } from "./recording-overlay";
import { ReplyPreview } from "./reply-preview";

interface UnifiedMessageInputProps {
  chatId?: string | null;
  errorMessage?: string | null;
  onSend: (input: ActivitySendMessageInput) => Promise<void> | void;
  onClearError?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_TEXTAREA_HEIGHT = 120;

function getVoiceExtension(mimeType: string) {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "m4a";
  return "webm";
}

function dedupeAttachments(nextAttachments: ActivityOutgoingAttachment[]) {
  const seen = new Set<string>();

  return nextAttachments.filter(({ file }) => {
    const key = [file.name, file.size, file.lastModified].join(":");
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function AttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: ActivityOutgoingAttachment;
  onRemove: () => void;
}) {
  const Icon = attachment.file.type.startsWith("image/") ? ImageIcon : FileText;

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/40 px-2.5 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-card text-forge-teal">
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-ink">
          {attachment.file.name}
        </p>
        <p className="text-[10px] text-slate-muted">
          {Math.max(1, Math.round(attachment.file.size / 1024))} KB
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="rounded-full text-slate-muted hover:text-ink"
        onClick={onRemove}
        aria-label={`Remove ${attachment.file.name}`}
      >
        <X size={14} />
      </Button>
    </div>
  );
}

export const UnifiedMessageInput = memo(function UnifiedMessageInput({
  chatId = null,
  errorMessage = null,
  onSend,
  onClearError,
  disabled = false,
  placeholder = "Type a message...",
}: UnifiedMessageInputProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<
    ActivityOutgoingAttachment[]
  >([]);

  const replyingTo = useActivityStore((state) => state.replyingTo);
  const editingMessage = useActivityStore((state) => state.editingMessage);
  const setReplyingTo = useActivityStore((state) => state.setReplyingTo);
  const setEditingMessage = useActivityStore(
    (state) => state.setEditingMessage,
  );

  const {
    isRecording,
    recordingTime,
    recordingError,
    startRecording,
    stopRecording,
    cancelRecording,
    formatRecordingTime,
  } = useVoiceRecording();

  const textareaRef = useAutoResize({ value, maxHeight: MAX_TEXTAREA_HEIGHT });

  const isDisabled = disabled || isSubmitting;
  const isEditing = editingMessage !== null;
  const hasDraft = value.trim().length > 0 || pendingAttachments.length > 0;
  const wasEditingRef = useRef(false);

  useChatTypingSignal({
    chatId,
    isFocused,
    isPaused: isRecording || isSubmitting || isEditing,
    text: value,
  });

  useEffect(() => {
    if (editingMessage) {
      wasEditingRef.current = true;
      setPendingAttachments([]);
      setValue(editingMessage.content);
      return;
    }

    if (wasEditingRef.current) {
      wasEditingRef.current = false;
      setValue("");
    }
  }, [editingMessage]);

  const clearComposer = useCallback(() => {
    setValue("");
    setPendingAttachments([]);
    setReplyingTo(null);
    setEditingMessage(null);
  }, [setEditingMessage, setReplyingTo]);

  const handleValueChange = useCallback(
    (nextValue: string) => {
      if (errorMessage) {
        onClearError?.();
      }

      setValue(nextValue);
    },
    [errorMessage, onClearError],
  );

  const appendAttachments = useCallback(
    (files: File[]) => {
      if (files.length === 0) {
        return;
      }

      if (errorMessage) {
        onClearError?.();
      }

      setPendingAttachments((current) =>
        dedupeAttachments([
          ...current,
          ...files.map((file) => ({
            file,
          })),
        ]),
      );
    },
    [errorMessage, onClearError],
  );

  const removeAttachment = useCallback(
    (index: number) => {
      if (errorMessage) {
        onClearError?.();
      }

      setPendingAttachments((current) => current.filter((_, i) => i !== index));
    },
    [errorMessage, onClearError],
  );

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim();

    if ((!trimmed && pendingAttachments.length === 0) || isDisabled) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSend({
        content: trimmed,
        attachments: pendingAttachments,
      });
      clearComposer();
    } catch {
      return;
    } finally {
      setIsSubmitting(false);
    }
  }, [clearComposer, isDisabled, onSend, pendingAttachments, value]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleStopRecording = useCallback(async () => {
    const result = await stopRecording();

    if (!result || result.durationSeconds <= 0 || isDisabled) {
      return;
    }

    const mimeType = result.blob.type || "audio/webm";
    const extension = getVoiceExtension(mimeType);
    const voiceFile = new File(
      [result.blob],
      `voice-note-${Date.now()}.${extension}`,
      {
        type: mimeType,
      },
    );

    setIsSubmitting(true);

    try {
      await onSend({
        content: "",
        attachments: [
          {
            file: voiceFile,
            duration: result.durationSeconds,
          },
        ],
      });
      setReplyingTo(null);
    } catch {
      return;
    } finally {
      setIsSubmitting(false);
    }
  }, [isDisabled, onSend, setReplyingTo, stopRecording]);

  const containerClasses = cn(
    "flex-1 flex flex-col min-w-0 transition-colors duration-300 relative rounded-3xl border",
    isRecording
      ? "bg-red-500/5 border-red-500/20"
      : isFocused
        ? "bg-card border-forge-teal/40 shadow-[0_4px_16px_rgba(13,148,136,0.08)]"
        : "bg-card/60 border-border/50 shadow-sm",
  );

  const attachmentPreview = useMemo(
    () =>
      pendingAttachments.length > 0 ? (
        <div className="grid gap-2 px-3 pt-3">
          {pendingAttachments.map((attachment, index) => (
            <AttachmentChip
              key={`${attachment.file.name}-${attachment.file.size}-${attachment.file.lastModified}`}
              attachment={attachment}
              onRemove={() => removeAttachment(index)}
            />
          ))}
        </div>
      ) : null,
    [pendingAttachments, removeAttachment],
  );

  return (
    <div className="shrink-0 px-3 pt-2 pb-2.5 border-t border-border/60 bg-canvas/90 backdrop-blur-xl safe-area-inset-bottom z-30 isolate overflow-visible min-h-16">
      <div className="flex items-end gap-2.5 w-full mx-auto">
        <div className={containerClasses}>
          <ReplyPreview
            replyingTo={isEditing ? null : replyingTo}
            onClear={() => setReplyingTo(null)}
          />

          {isEditing && editingMessage && (
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-3 py-2 text-xs">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-forge-teal/10 text-forge-teal">
                  <PencilLine size={14} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-ink">Editing message</p>
                  <p className="truncate text-slate-muted">
                    Save your updated text to replace the original.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-full px-3 text-slate-muted hover:text-ink"
                onClick={() => {
                  setEditingMessage(null);
                  setValue("");
                }}
              >
                Cancel
              </Button>
            </div>
          )}

          {attachmentPreview}

          <div className="flex items-end min-h-11 w-full relative z-10">
            {isRecording ? (
              <RecordingOverlay
                timeLabel={formatRecordingTime(recordingTime)}
              />
            ) : (
              <InputRow
                value={value}
                onChange={handleValueChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                textareaRef={textareaRef}
                placeholder={isEditing ? "Edit your message..." : placeholder}
                disabled={isDisabled}
                onSelectImages={isEditing ? () => {} : appendAttachments}
                onSelectFiles={isEditing ? () => {} : appendAttachments}
                canAttach={!isEditing}
              />
            )}
          </div>

          {recordingError && (
            <p className="text-[10px] text-red-500/80 font-medium px-4 pb-1.5 -mt-1">
              {recordingError === "permission-denied"
                ? "Microphone access denied. Check your browser settings."
                : recordingError === "not-supported"
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
            hasContent={hasDraft}
            isRecording={isRecording}
            onSend={() => {
              void handleSubmit();
            }}
            onCancelRecording={cancelRecording}
            onStartRecording={() => {
              if (!isDisabled) void startRecording();
            }}
            onStopRecording={() => {
              if (!isDisabled) void handleStopRecording();
            }}
            disabled={isDisabled}
          />
        </div>
      </div>
    </div>
  );
});
