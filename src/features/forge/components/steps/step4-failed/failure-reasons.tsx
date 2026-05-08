import { SlidersHorizontal } from "lucide-react";

interface FailureReasonsProps {
  context: string;
  reasons: readonly string[];
}

export function FailureReasons({ context, reasons }: FailureReasonsProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-0.5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <SlidersHorizontal size={14} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-muted-foreground text-xs leading-none">
            What likely happened
          </p>
          <p className="mt-1 text-micro text-muted-foreground/55 leading-none">
            {context}
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {reasons.map((reason, index) => (
          <div
            key={reason}
            className="rounded-lg border border-border/40 bg-card/75 p-3"
          >
            <span className="font-black text-micro text-spark-amber tabular-nums">
              0{index + 1}
            </span>
            <p className="mt-2 font-medium text-muted-foreground text-xs leading-snug">
              {reason}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
