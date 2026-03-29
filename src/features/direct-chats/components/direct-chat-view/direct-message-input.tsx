import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Mic, Paperclip, Send, Smile } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface DirectMessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function DirectMessageInput({
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
        "flex-shrink-0 px-3 py-2 border-t border-border bg-canvas",
        "safe-area-inset-bottom",
      )}
    >
      <div
        className={cn(
          "flex items-end gap-2 p-1 rounded-2xl transition-all duration-200",
          isFocused ? "bg-muted/70 ring-1 ring-border" : "bg-muted/40",
        )}
      >
        {/* Attachment button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-foreground rounded-full"
          aria-label="Add attachment"
          disabled={disabled}
        >
          <Paperclip size={18} />
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
              "w-full resize-none bg-transparent px-2 py-2",
              "text-sm placeholder:text-muted-foreground",
              "focus-visible:outline-none",
              "transition-colors duration-150",
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
            className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-foreground rounded-full"
            aria-label="Add emoji"
            disabled={disabled}
          >
            <Smile size={18} />
          </Button>
        )}

        {/* Voice/Send button */}
        {value.trim() ? (
          <Button
            onClick={handleSubmit}
            disabled={disabled}
            size="icon"
            className="h-9 w-9 flex-shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Send message"
          >
            <Send size={16} />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-foreground rounded-full"
            aria-label="Voice message"
            disabled={disabled}
          >
            <Mic size={18} />
          </Button>
        )}
      </div>
    </div>
  );
}
