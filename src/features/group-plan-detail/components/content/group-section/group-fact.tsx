import type { LucideIcon } from "lucide-react";

interface GroupFactProps {
  icon: LucideIcon;
  label: string;
  value: string;
  supporting?: string;
}

export function GroupFact({
  icon: Icon,
  label,
  supporting,
  value,
}: GroupFactProps) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-forge-teal"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="font-semibold text-muted-foreground text-xs">{label}</p>
        <p className="mt-0.5 font-black text-foreground text-sm leading-snug">
          {value}
        </p>
        {supporting ? (
          <p className="mt-0.5 font-medium text-muted-foreground text-xs">
            {supporting}
          </p>
        ) : null}
      </div>
    </div>
  );
}
