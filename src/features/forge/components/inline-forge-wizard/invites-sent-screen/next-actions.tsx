import { Bell, MessageSquare, UsersRound } from "lucide-react";

import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";

import type { NextActionItem } from "./types";

interface NextActionsProps {
  isManual: boolean;
}

interface NextCardState {
  bordered: boolean;
  iconClassName: string;
  iconTone: "amber" | "neutral" | "none";
  titleClassName: string;
}

export function NextActions({ isManual }: NextActionsProps) {
  const actions = getNextActions(isManual);

  return (
    <section className="flex flex-col gap-4 lg:border-border/25 lg:border-l lg:pl-8">
      <p className="font-semibold text-foreground text-sm">
        You can do this next
      </p>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
        {actions.map((action) => (
          <NextCard key={action.title} {...action} />
        ))}
      </div>
    </section>
  );
}

function getNextActions(isManual: boolean): NextActionItem[] {
  return [
    {
      active: true,
      icon: UsersRound,
      text: isManual
        ? "Accepted invites appear in the group hub."
        : "See who joined and keep the group moving.",
      title: isManual ? "Track responses" : "Review members",
      tone: isManual ? "amber" : "teal",
    },
    {
      icon: MessageSquare,
      text: "Settle timing, links, and small details.",
      title: "Start chat",
    },
    {
      icon: Bell,
      text: isManual
        ? "You will be notified when someone accepts."
        : "Members get their group updates from here.",
      title: "Stay updated",
    },
  ];
}

function NextCard({
  active = false,
  icon,
  text,
  title,
  tone = "teal",
}: NextActionItem) {
  const cardState = getNextCardState({ active, tone });

  return (
    <div className="min-w-0 lg:flex lg:gap-3">
      <IconTile
        icon={icon}
        tone={cardState.iconTone}
        size="md"
        bordered={cardState.bordered}
        className={cn("mb-2 lg:mb-0", cardState.iconClassName)}
      />
      <div className="min-w-0">
        <p
          className={cn(
            "font-semibold text-sm leading-tight",
            cardState.titleClassName,
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

function getNextCardState({
  active,
  tone,
}: Pick<NextActionItem, "active" | "tone">): NextCardState {
  const isActive = Boolean(active);
  const isAmber = tone === "amber";

  return {
    bordered: isActive && isAmber,
    iconTone: getNextCardIconTone(isActive, isAmber),
    iconClassName: getNextCardIconClassName(isActive, isAmber),
    titleClassName: getNextCardTitleClassName(isActive, isAmber),
  };
}

function getNextCardIconTone(
  isActive: boolean,
  isAmber: boolean,
): NextCardState["iconTone"] {
  if (!isActive) {
    return "neutral";
  }

  return isAmber ? "amber" : "none";
}

function getNextCardIconClassName(isActive: boolean, isAmber: boolean) {
  if (!isActive) {
    return "";
  }

  return isAmber
    ? "bg-spark-amber/12"
    : "bg-forge-teal text-primary-foreground";
}

function getNextCardTitleClassName(isActive: boolean, isAmber: boolean) {
  if (!isActive) {
    return "text-foreground";
  }

  return isAmber ? "text-spark-amber" : "text-forge-teal";
}
