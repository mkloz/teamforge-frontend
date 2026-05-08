import { AlertCircle } from "lucide-react";

interface FailureHeroProps {
  description: string;
}

export function FailureHero({ description }: FailureHeroProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-spark-amber/25 bg-spark-amber/8">
      <div className="flex items-start gap-3 px-4 py-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-spark-amber text-ink shadow-sm shadow-spark-amber/25">
          <AlertCircle size={20} strokeWidth={2.4} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-spark-amber text-xs uppercase tracking-wide">
            Pool constraint
          </p>
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
