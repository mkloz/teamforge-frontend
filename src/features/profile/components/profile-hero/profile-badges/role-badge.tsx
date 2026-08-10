import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { ProfileSignal } from "./profile-signal";

const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  Strategist: "May help the group examine a problem before acting.",
  Thinker: "May ask questions others have not considered.",
  Leader: "May help the group choose a direction and next step.",
  Visionary: "May notice new options early.",
  Guide: "May consider both the overall plan and how people respond to it.",
  Dreamer: "May bring care and imagination to an open-ended idea.",
  Mentor: "May encourage other people to contribute.",
  Particle: "May help the group get started.",
  Anchor: "May keep attention on practical details when plans get complicated.",
  Caretaker: "May notice and respond to practical group needs.",
  Director: "May help the group track decisions and tasks.",
  Host: "May help people feel welcome and included.",
  Craftsman: "May contribute practical skills when a problem appears.",
  Artist: "May notice creative and sensory details in the activity.",
  Dynamo: "May encourage action when the group stalls.",
  Performer: "May keep attention on the shared experience.",
};

export function RoleBadge({
  archetype,
  groupMode,
}: {
  archetype: string;
  groupMode: string;
}) {
  const description = ARCHETYPE_DESCRIPTIONS[groupMode];

  if (!description) {
    return <ProfileSignal label="Role" value={groupMode} />;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group inline-flex min-h-9 min-w-9 items-center rounded text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={`Group role: ${groupMode}. Click for more information.`}
        >
          <ProfileSignal label="Role" value={groupMode} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={10}
        className="w-64 border-white/8 bg-ink p-4"
      >
        <div className="flex flex-col gap-2">
          <div>
            <p className="font-semibold text-sm text-white">{archetype}</p>
            <p className="mt-0.5 text-slate-muted text-xs">
              Group role in Findafew
            </p>
          </div>
          <p className="text-slate-muted text-xs leading-relaxed">
            {description}
          </p>
          <div className="border-white/6 border-t pt-2">
            <p className="type-signature-label text-white/35 leading-relaxed">
              Roles are shaped by personality type and how you tend to show up
              in group settings.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
