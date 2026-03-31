import { cn } from "@/shared/lib/utils";
import { Smile } from "lucide-react";
import React, { memo } from "react";
import { AttachmentMenu } from "./attachment-menu";

interface InputRowProps {
  value: string;
  onChange: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  placeholder: string;
  disabled: boolean;
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
  }: InputRowProps) => (
    <>
      <div className="shrink-0 flex items-end pb-2.5 pl-3">
        <button
          type="button"
          className="text-slate-muted hover:text-spark-amber transition-colors outline-none cursor-pointer"
          aria-label="Add emoji"
          disabled={disabled}
        >
          <Smile size={24} strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center min-h-11 py-2.75 px-2.5">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className={cn(
            "w-full resize-none bg-transparent",
            "text-base leading-snug font-medium text-ink placeholder:text-slate-muted/60 caret-forge-teal",
            "focus-visible:outline-none scrollbar-hide max-h-30",
            "disabled:opacity-50 transition-colors",
          )}
          aria-label="Type a message"
        />
      </div>

      <div className="shrink-0 flex items-end pb-2.5 pr-3">
        <AttachmentMenu disabled={disabled} />
      </div>
    </>
  ),
);
