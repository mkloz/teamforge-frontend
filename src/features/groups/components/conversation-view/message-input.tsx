import { useState, useCallback, useRef, useEffect } from "react";
import { Paperclip, Send } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [value, setValue] = useState("");
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
    <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-background">
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Add attachment"
        >
          <Paperclip size={20} />
        </Button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className={cn(
              "w-full resize-none rounded-xl border border-input bg-muted/50 px-4 py-2.5",
              "text-sm placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:bg-background",
              "transition-colors duration-150",
            )}
            aria-label="Type a message"
          />
        </div>

        {/* Send button */}
        <Button
          onClick={handleSubmit}
          disabled={!value.trim()}
          size="icon"
          className={cn(
            "h-10 w-10 flex-shrink-0 rounded-full",
            !value.trim() && "opacity-50",
          )}
          aria-label="Send message"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
}
