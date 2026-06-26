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
  const note = getInviteNoteViewState({ forgeMode, inviteeCount });

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
        <StatusPill tone={note.statusTone} size="sm">
          {note.statusText}
        </StatusPill>
      </div>

      <div className="border-border/25 border-t">
        <NextStepItem {...note.primaryStep} />
        <NextStepItem {...note.secondaryStep} />
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

interface InviteNoteViewState {
  primaryStep: NextStepItemProps;
  secondaryStep: NextStepItemProps;
  statusText: string;
  statusTone: "teal" | "amber";
}

interface NextStepItemState {
  bordered: boolean;
  iconClassName: string;
  iconTone: "amber" | "neutral" | "none";
  titleClassName: string;
}

function NextStepItem({
  active = false,
  icon,
  last = false,
  title,
  text,
  tone = "teal",
}: NextStepItemProps) {
  const itemState = getNextStepItemState({ active, tone });

  return (
    <div
      className={cn("flex gap-3 py-3", !last && "border-border/25 border-b")}
    >
      <IconTile
        icon={icon}
        tone={itemState.iconTone}
        size="md"
        bordered={itemState.bordered}
        className={cn(itemState.iconClassName)}
        iconClassName="size-3.5"
      />
      <div className="min-w-0">
        <p
          className={cn(
            "font-semibold text-sm leading-tight",
            itemState.titleClassName,
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

function getInviteNoteViewState({
  forgeMode,
  inviteeCount,
}: InviteNoteProps): InviteNoteViewState {
  const manual = forgeMode === "MANUAL";

  return {
    primaryStep: getPrimaryStep(manual),
    secondaryStep: getSecondaryStep(manual),
    statusText: manual ? getInviteText(inviteeCount) : "Ready now",
    statusTone: manual ? "amber" : "teal",
  };
}

function getInviteText(inviteeCount: number) {
  return inviteeCount === 1
    ? "1 selected friend"
    : `${inviteeCount} selected friends`;
}

function getPrimaryStep(manual: boolean): NextStepItemProps {
  return {
    active: true,
    icon: manual ? Send : UsersRound,
    title: manual ? "Invites go out" : "Group opens",
    text: manual
      ? "Selected people receive the group invitation."
      : "The matched members land in the same group space.",
    tone: manual ? "amber" : "teal",
  };
}

function getSecondaryStep(manual: boolean): NextStepItemProps {
  return {
    icon: Bell,
    title: manual ? "Replies arrive" : "Members are notified",
    text: manual
      ? "Accepted invites appear from the group hub."
      : "Everyone can pick up the plan from the hub.",
  };
}

function getNextStepItemState({
  active,
  tone,
}: Pick<NextStepItemProps, "active" | "tone">): NextStepItemState {
  const isActive = Boolean(active);
  const amber = tone === "amber";

  return {
    bordered: isActive && amber,
    iconTone: getNextStepIconTone(isActive, amber),
    iconClassName: getNextStepIconClassName(isActive, amber),
    titleClassName: getNextStepTitleClassName(isActive, amber),
  };
}

function getNextStepIconTone(
  isActive: boolean,
  amber: boolean,
): NextStepItemState["iconTone"] {
  if (!isActive) {
    return "neutral";
  }

  return amber ? "amber" : "none";
}

function getNextStepIconClassName(isActive: boolean, amber: boolean) {
  if (!isActive) {
    return "";
  }

  return amber ? "bg-spark-amber/12" : "bg-forge-teal text-primary-foreground";
}

function getNextStepTitleClassName(isActive: boolean, amber: boolean) {
  if (!isActive) {
    return "text-foreground";
  }

  return amber ? "text-spark-amber" : "text-forge-teal";
}
