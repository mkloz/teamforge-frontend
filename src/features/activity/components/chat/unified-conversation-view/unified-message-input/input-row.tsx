import type React from "react";
import { memo } from "react";
import type { ActivityOutgoingGifAttachment } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";
import { AttachmentMenu } from "./attachment-menu";
import { ExpressionPicker } from "./expression-picker";

interface InputRowProps {
  value: string;
  onChange: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  placeholder: string;
  disabled: boolean;
  canAttach?: boolean;
  canSendGif?: boolean;
  onInsertEmoji: (emoji: string) => void;
  onSelectGif: (gif: ActivityOutgoingGifAttachment) => void;
  onSelectImages: (files: File[]) => void;
  onSelectFiles: (files: File[]) => void;
}

export const InputRow = memo(
  ({
    value,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    textareaRef,
    placeholder,
    disabled,
    canAttach = true,
    canSendGif = true,
    onInsertEmoji,
    onSelectGif,
    onSelectImages,
    onSelectFiles,
  }: InputRowProps) => (
    <>
      <div className="flex h-11 shrink-0 items-center gap-0.5 pl-1.5">
        <ExpressionPicker
          canSendGif={canSendGif}
          disabled={disabled}
          onInsertEmoji={onInsertEmoji}
          onSelectGif={onSelectGif}
        />
        {canAttach && (
          <AttachmentMenu
            disabled={disabled}
            onSelectImages={onSelectImages}
            onSelectFiles={onSelectFiles}
          />
        )}
      </div>

      <div className="relative flex min-h-11 flex-1 items-center px-1.5 py-2">
        <textarea
          ref={textareaRef}
          name="chat-message"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className={cn(
            "min-h-0 w-full resize-none rounded-none border-0 bg-transparent p-0 shadow-none outline-none",
            "font-medium text-base text-ink leading-snug caret-forge-teal placeholder:text-slate-muted/60",
            "scrollbar-hide max-h-30 focus-visible:outline-none focus-visible:ring-0",
            "transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          )}
          aria-label="Type a message"
        />
      </div>
    </>
  ),
);
