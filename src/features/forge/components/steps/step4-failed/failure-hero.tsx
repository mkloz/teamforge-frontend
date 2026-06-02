import { ErrorForgeGroupFailedVisual } from "@/assets/error-state/error-forge-group-failed";

interface FailureHeroProps {
  description: string;
}

export function FailureHero({ description }: FailureHeroProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-spark-amber/25 bg-spark-amber/8">
      <div className="flex flex-col items-start gap-3 px-4 py-4 sm:flex-row sm:items-center">
        <ErrorForgeGroupFailedVisual className="h-14 w-auto shrink-0 text-foreground" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-spark-amber text-xs">Pool constraint</p>
          <h3 className="mt-1 font-black text-foreground text-lg leading-tight">
            We could not form this group yet
          </h3>
          <p className="mt-1 text-muted-foreground text-xs leading-snug">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
