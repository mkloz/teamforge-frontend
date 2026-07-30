import type { StatusFactItem } from "./types";

interface StatusFactsProps {
  facts: StatusFactItem[];
}

export function StatusFacts({ facts }: StatusFactsProps) {
  return (
    <dl className="grid grid-cols-2 divide-x divide-border/35 border-border/45 border-y">
      {facts.map((fact) => (
        <StatusFact key={fact.label} label={fact.label} value={fact.value} />
      ))}
    </dl>
  );
}

function StatusFact({ label, value }: StatusFactItem) {
  return (
    <div className="min-w-0 px-3 py-3 first:pl-0">
      <dt className="font-bold text-muted-foreground/65 text-xs">{label}</dt>
      <dd className="mt-1 truncate font-semibold text-foreground text-sm">
        {value}
      </dd>
    </div>
  );
}
