import type { LucideIcon } from "lucide-react";
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
    <div className="flex items-center gap-3.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-forge-teal/10">
        <Icon className="size-4 text-forge-teal" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-muted-foreground text-xs">{label}</p>
        <p
          className={cn(
            "font-black text-foreground text-sm leading-snug",
            truncateValue && "truncate",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
