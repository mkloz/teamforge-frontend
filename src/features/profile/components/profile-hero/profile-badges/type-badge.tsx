import { TYPE_INFO } from "@/features/profile/lib/archetypes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import type { PersonalityType } from "@/shared/schemas/enums";
import { ProfileSignal } from "./profile-signal";

const MBTI_CATEGORY: Record<PersonalityType, string> = {
  INTJ: "Analyst",
  INTP: "Analyst",
  ENTJ: "Analyst",
  ENTP: "Analyst",
  INFJ: "Diplomat",
  INFP: "Diplomat",
  ENFJ: "Diplomat",
  ENFP: "Diplomat",
  ISTJ: "Sentinel",
  ISFJ: "Sentinel",
  ESTJ: "Sentinel",
  ESFJ: "Sentinel",
  ISTP: "Explorer",
  ISFP: "Explorer",
  ESTP: "Explorer",
  ESFP: "Explorer",
};

const MBTI_DESCRIPTION: Record<PersonalityType, string> = {
  INTJ: "Strategic, independent, and driven by a long-range vision.",
  INTP: "Analytical and inventive — thrives on solving abstract problems.",
  ENTJ: "Natural-born organiser who rallies people around a shared goal.",
  ENTP: "Quick thinker who finds a new angle on every conversation.",
  INFJ: "Quietly insightful — understands people at a deeper level.",
  INFP: "Creative and empathetic, brings warmth and meaning to a group.",
  ENFJ: "Energises others and helps groups move toward a common purpose.",
  ENFP: "Spontaneous and ideas-driven — keeps things lively and open.",
  ISTJ: "Reliable, thorough, and the kind of person who actually shows up.",
  ISFJ: "Warm and dependable — creates comfort for everyone around them.",
  ESTJ: "Efficient organiser who keeps the group on track.",
  ESFJ: "Social glue — makes sure everyone feels included.",
  ISTP: "Calm under pressure and quietly skilled at practical things.",
  ISFP: "Gentle and perceptive, brings a creative and sensory awareness.",
  ESTP: "High-energy and action-first — turns plans into motion.",
  ESFP: "Enthusiastic and fun, makes any group feel alive.",
};

export function TypeBadge({
  personalityType,
}: {
  personalityType: PersonalityType | null;
}) {
  const typeValue = personalityType ?? "Open";

  if (!personalityType) {
    return <ProfileSignal label="Type" value={typeValue} />;
  }

  const typeInfo = TYPE_INFO[personalityType];
  const category = MBTI_CATEGORY[personalityType];
  const description = MBTI_DESCRIPTION[personalityType];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group rounded text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={`Personality type: ${personalityType}. Click for more information.`}
        >
          <ProfileSignal label="Type" value={typeValue} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={10}
        className="w-64 border-white/8 bg-ink p-4"
      >
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm text-white">
                {typeInfo.title}
              </p>
              <p className="mt-0.5 font-medium text-forge-teal text-xs">
                {personalityType} · {category}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-forge-teal/10 px-2 py-1 font-bold text-forge-teal text-sm leading-none">
              {personalityType}
            </span>
          </div>

          <p className="text-slate-muted text-xs leading-relaxed">
            {description}
          </p>

          <div className="border-white/6 border-t pt-2">
            <TypeDimensionRow code={personalityType} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TypeDimensionRow({ code }: { code: PersonalityType }) {
  const dims = [
    { pair: ["E", "I"], active: code[0] },
    { pair: ["S", "N"], active: code[1] },
    { pair: ["T", "F"], active: code[2] },
    { pair: ["J", "P"], active: code[3] },
  ] as const;

  return (
    <div className="flex items-center gap-1.5">
      {dims.map(({ pair, active }) => (
        <div key={pair.join("")} className="flex items-center gap-0.5">
          {pair.map((letter) => (
            <span
              key={letter}
              className={cn(
                "type-signature-label flex size-5 items-center justify-center rounded font-bold transition-colors",
                letter === active
                  ? "bg-forge-teal/15 text-forge-teal"
                  : "text-white/20",
              )}
            >
              {letter}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
