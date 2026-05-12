import type { LucideIcon } from "lucide-react";

interface PlanFactProps {
  icon: LucideIcon;
  label: string;
  value: string;
  supporting?: string;
}

export function PlanFact({
  icon: Icon,
  label,
  supporting,
  value,
}: PlanFactProps) {
  return (
    <div className="flex min-w-0 items-start gap-4">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-forge-teal/10 text-forge-teal">
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 pt-0.5">
        <dt className="type-signature-label font-bold text-muted-foreground uppercase tracking-widest">
          {label}
        </dt>
        <dd className="mt-0.5 font-black text-foreground text-sm leading-snug">
          {value}
        </dd>
        {supporting ? (
          <p className="mt-0.5 font-medium text-muted-foreground text-xs">
            {supporting}
          </p>
        ) : null}
      </div>
    </div>
  );
}
