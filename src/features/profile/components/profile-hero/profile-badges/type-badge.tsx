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
  INTJ: "Often prefers independent planning and long-range goals.",
  INTP: "Often enjoys analyzing ideas and abstract problems.",
  ENTJ: "Often prefers clear goals, decisions, and organized action.",
  ENTP: "Often explores several angles through discussion and debate.",
  INFJ: "Often considers values, purpose, and other people's perspectives.",
  INFP: "Often values sincerity, imagination, and personal meaning.",
  ENFJ: "Often helps people contribute toward a shared goal.",
  ENFP: "Often brings new ideas and prefers room to change direction.",
  ISTJ: "Often values clear expectations, detail, and follow-through.",
  ISFJ: "Often notices practical needs and supports people consistently.",
  ESTJ: "Often organizes tasks and keeps attention on the goal.",
  ESFJ: "Often helps people feel welcome and included.",
  ISTP: "Often prefers hands-on problems and practical solutions.",
  ISFP: "Often notices atmosphere, detail, and immediate experience.",
  ESTP: "Often prefers action and responds quickly to changing situations.",
  ESFP: "Often brings energy and helps ease early social tension.",
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
