import type { LucideIcon } from "lucide-react";
import { FactItem } from "@/shared/components/ui/fact-item";
import { cn } from "@/shared/lib/utils";

interface RailInfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
  truncateValue?: boolean;
}

export function RailInfoRow({
  icon: Icon,
  label,
  truncateValue = false,
  value,
}: RailInfoRowProps) {
  return (
    <dl>
      <FactItem
        icon={Icon}
        iconShape="square"
        iconSize="lg"
        iconTileClassName="size-9"
        label={label}
        labelClassName="font-semibold text-muted-foreground"
        value={value}
        valueClassName={cn(
          "font-bold text-foreground",
          truncateValue && "truncate",
        )}
        className="[&>dd]:gap-3.5"
      />
    </dl>
  );
}
