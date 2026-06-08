import type { LucideIcon } from "lucide-react";
import { Bell, MessageSquare, Send, UsersRound } from "lucide-react";

import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";

interface InviteNoteProps {
  forgeMode: "AUTO" | "MANUAL";
  inviteeCount: number;
}

export function InviteNote({ forgeMode, inviteeCount }: InviteNoteProps) {
  const manual = forgeMode === "MANUAL";
  const inviteText =
    inviteeCount === 1
      ? "1 selected friend"
      : `${inviteeCount} selected friends`;

  return (
    <section className="flex flex-col gap-3 border-border/25 border-t pt-4">
      <div className="flex items-center justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm leading-none">
            What happens next
          </p>
          <p className="mt-1 text-micro text-muted-foreground/55 leading-none">
            A short handoff before the group opens.
          </p>
        </div>
        <StatusPill tone={manual ? "amber" : "teal"} size="sm">
          {manual ? inviteText : "Ready now"}
        </StatusPill>
      </div>

      <div className="border-border/25 border-t">
        <NextStepItem
          active
          icon={manual ? Send : UsersRound}
          title={manual ? "Invites go out" : "Group opens"}
          text={
            manual
              ? "Selected people receive the group invitation."
              : "The matched members land in the same group space."
          }
          tone={manual ? "amber" : "teal"}
        />
        <NextStepItem
          icon={Bell}
          title={manual ? "Replies arrive" : "Members are notified"}
          text={
            manual
              ? "Accepted invites appear from the group hub."
              : "Everyone can pick up the plan from the hub."
          }
        />
        <NextStepItem
          icon={MessageSquare}
          title="Chat is ready"
          text="Use the group chat to settle details and keep the plan moving."
          last
        />
      </div>
    </section>
  );
}

interface NextStepItemProps {
  active?: boolean;
  icon: LucideIcon;
  last?: boolean;
  title: string;
  text: string;
  tone?: "teal" | "amber";
}

function NextStepItem({
  active = false,
  icon,
  last = false,
  title,
  text,
  tone = "teal",
}: NextStepItemProps) {
  const amber = tone === "amber";

  return (
    <div
      className={cn("flex gap-3 py-3", !last && "border-border/25 border-b")}
    >
      <IconTile
        icon={icon}
        tone={active ? (amber ? "amber" : "none") : "neutral"}
        size="md"
        bordered={active && amber}
        className={cn(
          active && amber && "bg-spark-amber/12",
          active && !amber && "bg-forge-teal text-primary-foreground",
        )}
        iconClassName="size-3.5"
      />
      <div className="min-w-0">
        <p
          className={cn(
            "font-semibold text-sm leading-tight",
            active
              ? amber
                ? "text-spark-amber"
                : "text-forge-teal"
              : "text-foreground",
          )}
        >
          {title}
        </p>
        <p className="mt-1 text-muted-foreground text-xs leading-snug">
          {text}
        </p>
      </div>
    </div>
  );
}
