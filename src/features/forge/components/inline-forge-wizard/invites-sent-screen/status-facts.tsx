import type { StatusFactItem } from "./types";

interface StatusFactsProps {
  facts: StatusFactItem[];
}

export function StatusFacts({ facts }: StatusFactsProps) {
  return (
    <div className="grid gap-4 border-y border-border/25 py-4 sm:grid-cols-3">
      {facts.map((fact) => (
        <StatusFact key={fact.label} label={fact.label} value={fact.value} />
      ))}
    </div>
  );
}

function StatusFact({ label, value }: StatusFactItem) {
  return (
    <div className="min-w-0">
      <p className="text-micro font-bold uppercase tracking-wide text-muted-foreground/60">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}
