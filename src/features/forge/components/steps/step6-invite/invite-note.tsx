import { Bell, MessageSquare, Send, UsersRound } from "lucide-react";

import { StatusPill } from "@/shared/components/ui/status-pill";

interface InviteNoteProps {
  forgeMode: "AUTO" | "MANUAL";
  inviteeCount: number;
}

interface HandoffStep {
  icon: typeof Send;
  text: string;
  title: string;
}

export function InviteNote({ forgeMode, inviteeCount }: InviteNoteProps) {
  const note = getInviteNoteViewState({ forgeMode, inviteeCount });

  return (
    <aside className="md:sticky md:top-28 md:border-border/40 md:border-l md:pl-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-base text-foreground tracking-tight">
            What happens next
          </h3>
          <p className="mt-1 text-muted-foreground text-xs">
            A quick handoff into the group.
          </p>
        </div>
        <StatusPill tone={note.statusTone} size="2xs">
          {note.statusText}
        </StatusPill>
      </div>

      <ol className="mt-5">
        {note.steps.map((step, index) => (
          <HandoffStepItem
            key={step.title}
            index={index}
            isLast={index === note.steps.length - 1}
            step={step}
          />
        ))}
      </ol>
    </aside>
  );
}

function HandoffStepItem({
  index,
  isLast,
  step,
}: {
  index: number;
  isLast: boolean;
  step: HandoffStep;
}) {
  const Icon = step.icon;

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {!isLast && (
        <span
          className="absolute top-7 bottom-0 left-3 w-px bg-border/55"
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-border/60 bg-canvas text-foreground">
        <Icon className="size-3" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="font-bold text-foreground text-sm leading-tight">
          <span className="sr-only">Step {index + 1}: </span>
          {step.title}
        </p>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
          {step.text}
        </p>
      </div>
    </li>
  );
}

function getInviteNoteViewState({ forgeMode, inviteeCount }: InviteNoteProps) {
  const hasInvites = inviteeCount > 0;

  return {
    statusText: hasInvites ? getInviteText(inviteeCount) : "Ready",
    statusTone: hasInvites ? ("amber" as const) : ("teal" as const),
    steps: getHandoffSteps(hasInvites, forgeMode),
  };
}

function getInviteText(inviteeCount: number) {
  return inviteeCount === 1 ? "1 invite" : `${inviteeCount} invites`;
}

function getHandoffSteps(
  hasInvites: boolean,
  forgeMode: InviteNoteProps["forgeMode"],
): HandoffStep[] {
  return [
    {
      icon: hasInvites ? Send : UsersRound,
      title: hasInvites ? "Send the invitations" : "Open the group",
      text: hasInvites
        ? "Your selected friends receive the group invitation."
        : forgeMode === "AUTO"
          ? "The people TeamForge found already have access."
          : "Your group is ready to open.",
    },
    {
      icon: Bell,
      title: hasInvites ? "Watch for replies" : "Members are notified",
      text: hasInvites
        ? "Accepted members appear in the group workspace."
        : "Everyone gets the group update.",
    },
    {
      icon: MessageSquare,
      title: "Start the conversation",
      text: "Use the group chat to settle the remaining details.",
    },
  ];
}
