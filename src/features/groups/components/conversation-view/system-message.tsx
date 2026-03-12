import type { Message } from "../../types/groups.types";

interface SystemMessageProps {
  message: Message;
}

export function SystemMessage({ message }: SystemMessageProps) {
  return (
    <div className="flex justify-center my-2">
      <p className="text-xs text-muted-foreground italic px-3 py-1">
        {message.content}
      </p>
    </div>
  );
}
