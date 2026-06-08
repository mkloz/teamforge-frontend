import type { LucideIcon } from "lucide-react";
import { FactItem } from "@/shared/components/ui/fact-item";

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
    <FactItem
      icon={Icon}
      iconShape="square"
      iconSize="lg"
      iconTileClassName="mt-0.5 size-9"
      label={label}
      labelClassName="font-semibold text-muted-foreground"
      value={
        <>
          {value}
          {supporting ? (
            <span className="mt-0.5 block font-medium text-muted-foreground text-xs">
              {supporting}
            </span>
          ) : null}
        </>
      }
      valueClassName="mt-0.5 font-bold text-foreground"
      className="items-start gap-4"
    />
  );
}
