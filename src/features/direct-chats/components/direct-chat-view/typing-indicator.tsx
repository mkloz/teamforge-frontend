interface TypingIndicatorProps {
  name: string;
  avatar: string;
}

export function TypingIndicator({ name, avatar }: TypingIndicatorProps) {
  return (
    <div className="flex items-end gap-2 px-2 mt-3">
      <img
        src={avatar}
        alt={name}
        className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-border"
      />
      <div className="px-3 py-2 rounded-2xl rounded-bl-md bg-card border border-border">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
