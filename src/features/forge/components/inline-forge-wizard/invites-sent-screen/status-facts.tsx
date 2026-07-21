import type { StatusFactItem } from "./types";

interface StatusFactsProps {
  facts: StatusFactItem[];
}

export function StatusFacts({ facts }: StatusFactsProps) {
  return (
    <div className="grid gap-4 border-border/25 border-y py-4 sm:grid-cols-3">
      {facts.map((fact) => (
        <StatusFact key={fact.label} label={fact.label} value={fact.value} />
      ))}
    </div>
  );
}

function StatusFact({ label, value }: StatusFactItem) {
  return (
    <div className="min-w-0">
      <p className="font-bold text-muted-foreground/60 text-xs">{label}</p>
      <p className="mt-1 truncate font-semibold text-foreground text-sm">
        {value}
      </p>
    </div>
  );
}
