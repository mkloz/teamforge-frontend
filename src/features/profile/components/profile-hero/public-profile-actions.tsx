import { Link } from "@tanstack/react-router";
import { Compass, UsersRound } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { User } from "@/shared/schemas";

interface PublicProfileActionsProps {
  user: User;
}

export function PublicProfileActions({ user }: PublicProfileActionsProps) {
  return (
    <div className="grid w-full grid-cols-1 items-center gap-2 pr-0 sm:flex sm:w-auto sm:flex-row sm:gap-3 min-[390px]:grid-cols-2">
      <Button asChild className="min-h-11 w-full shrink-0 sm:w-auto">
        <Link
          to="/forge"
          aria-label={`Forge a group after viewing ${user.name}'s profile`}
        >
          <UsersRound className="shrink-0" />
          <span>Forge a group</span>
        </Link>
      </Button>
      <Button
        asChild
        variant="outline"
        className="min-h-11 w-full border-2 sm:w-auto"
      >
        <Link to="/explore" aria-label="Explore more groups">
          <Compass className="shrink-0" />
          <span>Explore groups</span>
        </Link>
      </Button>
    </div>
  );
}
