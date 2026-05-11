import { Smile } from "lucide-react";
import type React from "react";
import { memo } from "react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
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
  canAttach?: boolean;
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
    onSelectImages,
    onSelectFiles,
  }: InputRowProps) => (
    <>
      <div className="flex shrink-0 items-end pb-1 pl-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer rounded-full text-slate-muted outline-none transition-colors hover:text-spark-amber"
              aria-label="Add emoji"
              disabled={disabled}
            >
              <Smile className="size-5" strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add emoji</TooltipContent>
        </Tooltip>
      </div>

      <div className="relative flex min-h-11 flex-1 items-center px-2.5 py-2.75">
        <Textarea
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
            "min-h-0 resize-none border-0 bg-transparent p-0 shadow-none",
            "font-medium text-base text-ink leading-snug caret-forge-teal placeholder:text-slate-muted/60",
            "scrollbar-hide max-h-30 focus-visible:ring-0",
            "transition-colors disabled:opacity-50",
          )}
          aria-label="Type a message"
        />
      </div>

      {canAttach && (
        <div className="flex shrink-0 items-end pr-2 pb-1">
          <AttachmentMenu
            disabled={disabled}
            onSelectImages={onSelectImages}
            onSelectFiles={onSelectFiles}
          />
        </div>
      )}
    </>
  ),
);
