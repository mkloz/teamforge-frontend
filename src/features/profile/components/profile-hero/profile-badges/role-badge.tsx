import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { ProfileSignal } from "./profile-signal";

const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  Strategist: "Shapes how the group thinks through a problem before acting.",
  Thinker:
    "Adds depth and perspective — asks the question no one else thought of.",
  Leader: "Moves the group forward with clear direction and energy.",
  Visionary: "Spots possibilities early and keeps options open.",
  Guide: "Holds the bigger picture while staying attuned to how people feel.",
  Dreamer: "Brings heart and imagination to ideas that could go either way.",
  Mentor: "Draws people out and helps the group work at its best.",
  Spark: "Generates enthusiasm that makes the group want to start.",
  Anchor: "Keeps things grounded when plans get complicated.",
  Caretaker: "Attentive to what the group needs and quietly makes it happen.",
  Director: "Keeps the group on track and makes sure decisions land.",
  Host: "Holds the social fabric together — everyone feels welcomed.",
  Craftsman: "Brings practical ability and calm under pressure.",
  Artist: "Adds a sensory and creative lens to what the group does.",
  Dynamo: "High-energy presence that accelerates the group's momentum.",
  Performer:
    "Makes the experience itself memorable — the group is the activity.",
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
          className="group rounded text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
              Group role in TeamForge
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
