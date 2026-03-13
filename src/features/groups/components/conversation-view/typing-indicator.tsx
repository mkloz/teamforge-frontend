

interface TypingUser {
  name: string;
  avatar: string;
}

interface TypingIndicatorProps {
  users: TypingUser[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const names = users.map((u) => u.name);
  const text =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
        ? `${names[0]} and ${names[1]} are typing`
        : `${names[0]} and ${names.length - 1} others are typing`;

  return (
    <div className="absolute bottom-2 left-4 right-4">
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-muted/90 backdrop-blur-sm shadow-sm border border-border/50">
        {/* Avatars */}
        <div className="flex -space-x-1.5">
          {users.slice(0, 3).map((user, i) => (
            <img
              key={i}
              src={user.avatar}
              alt={user.name}
              className="w-5 h-5 rounded-full object-cover ring-2 ring-muted"
            />
          ))}
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
        </div>

        {/* Text */}
        <span className="text-xs text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}
