import { useActivityStore } from "@/features/activity/store/activity.store";
import { useVoiceRecording } from "@/features/activity/hooks/use-voice-recording";
import { useAutoResize } from "@/shared/hooks/use-auto-resize";
import { cn } from "@/shared/lib/utils";
import { memo, useCallback, useState } from "react";
import { ActionTarget } from "./action-target";
import { InputRow } from "./input-row";
import { RecordingOverlay } from "./recording-overlay";
import { ReplyPreview } from "./reply-preview";

interface UnifiedMessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_TEXTAREA_HEIGHT = 120;

/**
 * UnifiedMessageInput - Shared input for both DMs and Groups.
 * Supports auto-resizing, attachments, emojis, and voice messages.
 */
export const UnifiedMessageInput = memo(function UnifiedMessageInput({
  onSend,
  disabled = false,
  placeholder = "Type a message...",
}: UnifiedMessageInputProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const replyingTo = useActivityStore((state) => state.replyingTo);
  const setReplyingTo = useActivityStore((state) => state.setReplyingTo);

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

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setValue("");
      setReplyingTo(null);
    }
  }, [value, disabled, onSend, setReplyingTo]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  /**
   * Stop recording and (when backend is wired) submit the voice blob.
   * For now we log the result — replace the comment block with an upload call.
   */
  const handleStopRecording = useCallback(async () => {
    const result = await stopRecording();
    if (result && result.durationSeconds > 0) {
      // TODO: upload result.blob to the server and call onSend with the
      // returned attachment URL. For now the blob is available via result.url.
      // Example:
      //   const url = await uploadVoice(result.blob);
      //   onSend("", [{ type: "voice", url, duration: result.durationSeconds }]);
      console.debug(
        "[voice] recorded",
        result.durationSeconds,
        "s",
        result.url,
      );
    }
  }, [stopRecording]);

  const containerClasses = cn(
    "flex-1 flex flex-col min-w-0 transition-colors duration-300 relative rounded-3xl border",
    isRecording
      ? "bg-red-500/5 border-red-500/20"
      : isFocused
        ? "bg-card border-forge-teal/40 shadow-[0_4px_16px_rgba(13,148,136,0.08)]"
        : "bg-card/60 border-border/50 shadow-sm",
  );

  return (
    <div className="shrink-0 px-3 pt-2 pb-2.5 border-t border-border/60 bg-canvas/90 backdrop-blur-xl safe-area-inset-bottom z-30 isolate overflow-visible min-h-16">
      <div className="flex items-end gap-2.5 w-full mx-auto">
        {/* Input Pill */}
        <div className={containerClasses}>
          <ReplyPreview
            replyingTo={replyingTo}
            onClear={() => setReplyingTo(null)}
          />

          <div className="flex items-end min-h-11 w-full relative z-10">
            {isRecording ? (
              <RecordingOverlay
                timeLabel={formatRecordingTime(recordingTime)}
              />
            ) : (
              <InputRow
                value={value}
                onChange={setValue}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                textareaRef={textareaRef}
                placeholder={placeholder}
                disabled={disabled}
              />
            )}
          </div>

          {/* Mic permission error hint */}
          {recordingError && (
            <p className="text-[10px] text-red-500/80 font-medium px-4 pb-1.5 -mt-1">
              {recordingError === "permission-denied"
                ? "Microphone access denied. Check your browser settings."
                : recordingError === "not-supported"
                  ? "Voice recording isn't supported on this browser."
                  : "Recording failed. Please try again."}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-end h-11 mb-0.5">
          <ActionTarget
            hasContent={!!value.trim()}
            isRecording={isRecording}
            onSend={handleSubmit}
            onCancelRecording={cancelRecording}
            onStartRecording={() => {
              if (!disabled) void startRecording();
            }}
            onStopRecording={() => {
              if (!disabled) void handleStopRecording();
            }}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
});
