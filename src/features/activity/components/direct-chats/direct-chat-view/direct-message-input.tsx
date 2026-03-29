import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Mic, Paperclip, Send, Smile } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

interface DirectMessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

/**
 * DirectMessageInput - Main input for direct messaging with brand colors.
 * Features auto-resizing, submit logic, and brand token usage.
 */
export const DirectMessageInput = memo(function DirectMessageInput({
  onSend,
  disabled = false,
}: DirectMessageInputProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setValue("");
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <div
      className={cn(
        "shrink-0 px-3 py-3 border-t border-border bg-canvas/60 backdrop-blur-md",
        "safe-area-inset-bottom",
      )}
    >
      <div
        className={cn(
          "flex items-end gap-2 p-1 rounded-2xl transition-all duration-300",
          isFocused
            ? "bg-muted shadow-sm ring-1 ring-forge-teal/20"
            : "bg-muted/50",
        )}
      >
        {/* Attachment button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-slate-muted hover:text-forge-teal hover:bg-forge-teal/10 rounded-full transition-colors"
          aria-label="Add attachment"
          disabled={disabled}
        >
          <Paperclip size={18} strokeWidth={2} />
        </Button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type a message..."
            rows={1}
            disabled={disabled}
            className={cn(
              "w-full resize-none bg-transparent px-2 py-2.5",
              "text-sm font-medium placeholder:text-slate-muted placeholder:font-normal",
              "focus-visible:outline-none",
              "transition-colors duration-150 scrollbar-hide",
              "disabled:opacity-50",
            )}
            aria-label="Type a message"
          />
        </div>

        {/* Emoji button - only show when not typing */}
        {!value.trim() && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-slate-muted hover:text-spark-amber hover:bg-spark-amber/10 rounded-full transition-colors"
            aria-label="Add emoji"
            disabled={disabled}
          >
            <Smile size={18} strokeWidth={2.1} />
          </Button>
        )}

        {/* Voice/Send button */}
        {value.trim() ? (
          <Button
            onClick={handleSubmit}
            disabled={disabled}
            size="icon"
            className={cn(
              "h-9 w-9 shrink-0 rounded-full bg-forge-teal text-white shadow-md",
              "hover:bg-forge-teal/90 hover:scale-105 active:scale-95 transition-all",
            )}
            aria-label="Send message"
          >
            <Send size={16} strokeWidth={2.5} />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-slate-muted hover:text-forge-teal hover:bg-forge-teal/10 rounded-full transition-colors"
            aria-label="Voice message"
            disabled={disabled}
          >
            <Mic size={18} strokeWidth={2} />
          </Button>
        )}
      </div>
    </div>
  );
});
