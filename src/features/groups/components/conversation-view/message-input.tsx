import { useState, useCallback, useRef, useEffect } from "react";
import { Paperclip, Send, Smile } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
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

  if (disabled) {
    return (
      <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-muted/30">
        <p className="text-sm text-muted-foreground text-center">
          This group has been completed
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-shrink-0 px-3 py-2 border-t border-border bg-background",
      "safe-area-inset-bottom", // For mobile safe area
    )}>
      <div className={cn(
        "flex items-end gap-2 p-1 rounded-2xl transition-all duration-200",
        isFocused ? "bg-muted/70 ring-1 ring-border" : "bg-muted/40",
      )}>
        {/* Attachment button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-foreground rounded-full"
          aria-label="Add attachment"
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
            className={cn(
              "w-full resize-none bg-transparent px-2 py-2",
              "text-sm placeholder:text-muted-foreground",
              "focus-visible:outline-none",
              "transition-colors duration-150",
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
          >
            <Smile size={18} />
          </Button>
        )}

        {/* Send button */}
        <Button
          onClick={handleSubmit}
          disabled={!value.trim()}
          size="icon"
          className={cn(
            "h-9 w-9 flex-shrink-0 rounded-full transition-all duration-200",
            value.trim() 
              ? "bg-primary text-primary-foreground hover:bg-primary/90 scale-100" 
              : "bg-transparent text-muted-foreground scale-95 opacity-50",
          )}
          aria-label="Send message"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
