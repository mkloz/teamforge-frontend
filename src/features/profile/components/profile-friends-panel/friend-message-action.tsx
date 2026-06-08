import { Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { buildActivityDmNavigation } from "@/features/activity/lib/activity-route";
import { Button } from "@/shared/components/ui/button";

interface FriendMessageActionProps {
  chatId: string | null;
}

export function FriendMessageAction({ chatId }: FriendMessageActionProps) {
  const className = "size-8 text-muted-foreground hover:text-forge-teal";

  if (!chatId) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={className}
        disabled
        aria-label="Message unavailable"
        title="Message unavailable"
      >
        <MessageSquare className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={className}
      aria-label="Message"
      title="Message"
    >
      <Link {...buildActivityDmNavigation(chatId)}>
        <MessageSquare className="size-4" />
      </Link>
    </Button>
  );
}
