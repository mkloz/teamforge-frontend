import { Bell, MessageSquare, Send, UsersRound } from "lucide-react";
import type { ReactNode } from "react";

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
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-1 font-bold text-xs",
            manual
              ? "border-spark-amber/25 bg-spark-amber/10 text-spark-amber"
              : "border-forge-teal/25 bg-forge-teal/10 text-forge-teal",
          )}
        >
          {manual ? inviteText : "Ready now"}
        </span>
      </div>

      <div className="border-border/25 border-t">
        <NextStepItem
          active
          icon={manual ? <Send size={15} /> : <UsersRound size={15} />}
          title={manual ? "Invites go out" : "Group opens"}
          text={
            manual
              ? "Selected people receive the group invitation."
              : "The matched members land in the same group space."
          }
          tone={manual ? "amber" : "teal"}
        />
        <NextStepItem
          icon={<Bell size={15} />}
          title={manual ? "Replies arrive" : "Members are notified"}
          text={
            manual
              ? "Accepted invites appear from the group hub."
              : "Everyone can pick up the plan from the hub."
          }
        />
        <NextStepItem
          icon={<MessageSquare size={15} />}
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
  icon: ReactNode;
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
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          active
            ? amber
              ? "border border-spark-amber/25 bg-spark-amber/12 text-spark-amber"
              : "bg-forge-teal text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {icon}
      </div>
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
