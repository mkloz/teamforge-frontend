import { Link } from "@tanstack/react-router";
import { MessageCircle, UserRoundPlus } from "lucide-react";
import { buildActivityDmNavigation } from "@/features/activity/lib/activity-route";
import { usePublicProfileActions } from "@/features/profile/hooks/use-public-profile-actions";
import { Button } from "@/shared/components/ui/button";
import type { User } from "@/shared/schemas";

interface PublicProfileActionsProps {
  user: User;
}

export function PublicProfileActions({ user }: PublicProfileActionsProps) {
  const {
    connectDisabled,
    connectLabel,
    connectLoading,
    messageChatId,
    messageDisabled,
    onConnect,
  } = usePublicProfileActions(user);

  return (
    <div className="grid w-full grid-cols-1 items-center gap-2 pr-0 sm:flex sm:w-auto sm:flex-row sm:gap-3 min-[390px]:grid-cols-2">
      <Button
        className="min-h-11 w-full shrink-0 sm:w-auto"
        disabled={connectDisabled}
        loading={connectLoading}
        onClick={() => onConnect()}
        aria-label={`${connectLabel} with ${user.name}`}
      >
        <UserRoundPlus className="shrink-0" />
        <span>{connectLabel}</span>
      </Button>
      {messageChatId ? (
        <Button
          asChild
          variant="outline"
          className="min-h-11 w-full border-2 sm:w-auto"
        >
          <Link
            {...buildActivityDmNavigation(messageChatId)}
            aria-label={`Message ${user.name}`}
          >
            <MessageCircle className="shrink-0" />
            <span>Message</span>
          </Link>
        </Button>
      ) : (
        <Button
          variant="outline"
          className="min-h-11 w-full border-2 sm:w-auto"
          disabled={messageDisabled}
          aria-label={`Message ${user.name}`}
        >
          <MessageCircle className="shrink-0" />
          <span>Message</span>
        </Button>
      )}
    </div>
  );
}
