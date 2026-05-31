import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Clock3,
  MapPin,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";

import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { AvatarWithBadge } from "@/shared/components/common/avatar-with-badge";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import type { AttentionQueueFriendRequest } from "./attention-queue.types";
import { getFriendRequestMeta } from "./attention-queue-formatters";
import { AttentionQueueMeta } from "./attention-queue-meta";

interface FriendRequestQueueItemProps {
  request: AttentionQueueFriendRequest;
  isFocused: boolean;
  acceptingRequestId: string | null;
  decliningRequestId: string | null;
  isAccepting: boolean;
  isDeclining: boolean;
  onAccept: (requesterId: string) => Promise<void>;
  onDecline: (requesterId: string) => Promise<void>;
}

export function FriendRequestQueueItem({
  acceptingRequestId,
  decliningRequestId,
  isAccepting,
  isDeclining,
  isFocused,
  onAccept,
  onDecline,
  request,
}: FriendRequestQueueItemProps) {
  const profileNavigation = buildProfileNavigation(request.counterpart.id);
  const [cityLabel, trustLabel, sentLabel] = getFriendRequestMeta(request);
  const requestMeta = [
    { icon: MapPin, label: cityLabel },
    { icon: ShieldCheck, label: trustLabel },
    { icon: Clock3, label: sentLabel },
  ].filter((item) => item.label);

  return (
    <li
      className={cn(
        "group border-border/55 border-b px-1 py-3 transition-colors duration-150 last:border-b-0 sm:px-3",
        isFocused ? "bg-forge-teal/8" : "hover:bg-forge-teal/5",
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <Link
          {...profileNavigation}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AvatarWithBadge
            src={request.counterpart.avatar}
            name={request.counterpart.name}
            fallback={<UserPlus className="size-4 text-muted-foreground" />}
            imageSize={96}
            avatarClassName="size-10 border-border/60"
            icon={UserPlus}
            badgeTone="teal"
          />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate font-black text-foreground text-sm transition-colors duration-150 group-hover:text-forge-teal">
                {request.counterpart.name}
              </p>
              {request.counterpart.personalityType ? (
                <span className="rounded-full bg-forge-teal/8 px-2 py-0.5 font-black text-forge-teal text-micro leading-none">
                  {request.counterpart.personalityType}
                </span>
              ) : null}
              <ArrowRight
                className="size-3.5 shrink-0 text-muted-foreground/70 opacity-0 transition duration-150 group-focus-within:translate-x-0.5 group-focus-within:text-forge-teal group-focus-within:opacity-100 group-hover:translate-x-0.5 group-hover:text-forge-teal group-hover:opacity-100"
                aria-hidden="true"
              />
            </div>
            <p className="mt-1 truncate font-medium text-muted-foreground text-xs">
              {getFirstName(request.counterpart.name)} wants to connect with
              you.
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
              {requestMeta.map((item) => (
                <AttentionQueueMeta key={item.label} icon={item.icon}>
                  {item.label}
                </AttentionQueueMeta>
              ))}
            </div>
          </div>
        </Link>
        <div className="flex shrink-0 items-center justify-end gap-1.5">
          <Button
            size="icon-xs"
            className="sm:w-auto sm:px-3"
            loading={acceptingRequestId === request.requesterId}
            disabled={isAccepting || isDeclining}
            onClick={() => void onAccept(request.requesterId)}
            aria-label={`Accept ${request.counterpart.name}'s friend request`}
          >
            <Check className="size-3" />
            <span className="hidden sm:inline">Accept</span>
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon-xs"
            loading={decliningRequestId === request.requesterId}
            disabled={isAccepting || isDeclining}
            onClick={() => void onDecline(request.requesterId)}
            aria-label={`Decline ${request.counterpart.name}'s friend request`}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
    </li>
  );
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}
