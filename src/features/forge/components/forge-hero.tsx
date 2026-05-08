import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface ForgeHeroProps {
  onForgeClick: () => void;
}

const SAMPLE_BRIEF = [
  ["Activity", "Beginner bouldering"],
  ["When", "Thursday, 6:30 PM"],
  ["Where", "Depot Climbing or nearby"],
  ["Group", "4 people, relaxed pace"],
] as const;

export function ForgeHero({ onForgeClick }: ForgeHeroProps) {
  return (
    <section
      id="forge-hero"
      className="grid gap-7 border-border border-b pb-8 md:grid-cols-[minmax(0,1fr)_20rem] md:items-end md:pb-10"
    >
      <div className="flex min-w-0 flex-col gap-7">
        <div className="flex flex-col gap-4">
          <p className="font-black text-muted-foreground text-sm uppercase">
            Forge
          </p>
          <h1 className="max-w-3xl text-balance font-black text-4xl text-foreground leading-tight md:text-display-lg">
            What are you trying to make happen?
          </h1>
          <p className="max-w-2xl text-pretty font-medium text-base text-muted-foreground leading-relaxed">
            Give Forge a real activity and a few boundaries. It helps form a
            small group around the plan, then moves everyone into chat to sort
            out the final details.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={onForgeClick}
            variant="primary"
            size="hero"
            className="w-full sm:w-auto"
            aria-label="Forge my group"
          >
            <Plus size={20} />
            Forge my group
          </Button>
          <p className="max-w-sm font-medium text-muted-foreground text-sm leading-relaxed">
            Best when you already have a rough activity, time, or place in mind.
          </p>
        </div>
      </div>

      <aside
        aria-label="Example forge brief"
        className="rounded-xl border border-border bg-card"
      >
        <div className="flex items-center justify-between gap-4 border-border border-b px-4 py-3">
          <div>
            <p className="font-black text-foreground text-sm">Example brief</p>
            <p className="font-medium text-muted-foreground text-xs">
              Specific enough to start
            </p>
          </div>
          <ArrowRight size={17} className="text-forge-teal" />
        </div>

        <dl className="divide-y divide-border">
          {SAMPLE_BRIEF.map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 px-4 py-3"
            >
              <dt className="font-black text-muted-foreground text-xs uppercase">
                {label}
              </dt>
              <dd className="font-semibold text-foreground text-sm leading-relaxed">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </aside>
    </section>
  );
}
