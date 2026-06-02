import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { AnimatedBriefCycler } from "./components/animated-brief-cycler";

interface ChipIdea {
  detail?: string;
  label: string;
  laneKey?: string;
  title: string;
}

const FORGE_IDEA_CHIPS: ChipIdea[] = [
  {
    label: "Coffee between classes",
    title: "Coffee between classes",
    laneKey: "social",
  },
  {
    label: "Beginner climbing",
    title: "Beginner climbing session",
    laneKey: "outdoors",
  },
  {
    label: "Board games Friday",
    title: "Board game night",
    detail: "Friday evening at a board game café",
    laneKey: "play",
  },
  { label: "Sunday cycle", title: "Sunday cycle route", laneKey: "outdoors" },
  {
    label: "Exam revision block",
    title: "Exam revision session",
    laneKey: "learning",
  },
  {
    label: "Five-a-side football",
    title: "Five-a-side football",
    laneKey: "outdoors",
  },
  {
    label: "Hack session",
    title: "Hackathon or coding session",
    laneKey: "builder",
  },
  { label: "Walk after work", title: "Walk after work", laneKey: "outdoors" },
  {
    label: "Portfolio review",
    title: "Portfolio review session",
    laneKey: "creative",
  },
];

interface ForgePageShellProps {
  children: React.ReactNode;
  isOpen?: boolean;
}

interface ForgeIntroContentProps {
  onForgeClick: (options?: {
    idea?: { detail?: string; laneKey?: string; title: string };
  }) => void;
}

export function ForgePageShell({
  children,
  isOpen = false,
}: ForgePageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto flex h-full flex-col md:pb-12",
        isOpen
          ? "w-full max-w-none gap-0 px-0"
          : "w-full max-w-6xl gap-8 px-4 sm:px-6 md:px-8",
      )}
    >
      {children}
    </div>
  );
}

export function ForgeIntroContent({ onForgeClick }: ForgeIntroContentProps) {
  return (
    <div className="flex flex-col gap-10 py-5 lg:py-10">
      {/* Hero */}
      <section
        id="forge-hero"
        className="grid gap-7 border-border border-b pb-8 md:grid-cols-[minmax(0,1fr)_minmax(16rem,25rem)] md:items-end md:pb-10 lg:gap-12"
      >
        <div className="flex min-w-0 flex-col gap-7">
          <div className="flex flex-col gap-4">
            <p className="font-black text-muted-foreground text-sm uppercase">
              Forge
            </p>
            <h1 className="max-w-3xl text-balance text-center font-black text-4xl text-foreground leading-tight md:text-left md:text-display-lg">
              What are you trying to make happen?
            </h1>
            <p className="max-w-xl text-pretty font-medium text-base text-muted-foreground leading-relaxed">
              Give Forge a real activity and a few boundaries — it forms a
              compatible group and moves everyone into a shared chat.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={() => onForgeClick()}
              variant="primary"
              size="hero"
              className="w-full sm:w-auto"
              aria-label="Forge my group"
            >
              <Plus size={20} />
              Forge my group
            </Button>
          </div>
        </div>

        <AnimatedBriefCycler />
      </section>

      {/* Idea chips */}
      <section aria-labelledby="starter-ideas-title">
        <p
          id="starter-ideas-title"
          className="font-black text-muted-foreground text-sm uppercase"
        >
          Start here
        </p>
        <h2 className="mt-2 text-balance font-black text-2xl text-foreground leading-tight">
          Pick an idea and we'll pre-fill the details.
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {FORGE_IDEA_CHIPS.map((chip) => (
            <button
              key={chip.title}
              type="button"
              onClick={() =>
                onForgeClick({
                  idea: {
                    detail: chip.detail,
                    laneKey: chip.laneKey,
                    title: chip.title,
                  },
                })
              }
              className="rounded-full border border-border/50 bg-card/70 px-4 py-2 font-medium text-muted-foreground text-sm transition-colors duration-150 hover:border-forge-teal/40 hover:bg-forge-teal/5 hover:text-forge-teal"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
