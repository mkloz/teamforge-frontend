import { BadgeAlert, RefreshCcw, Send } from "lucide-react";

import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";

interface FailureReasonsProps {
  context: string;
  reasons: readonly string[];
}

const REASON_ICONS = [Send, BadgeAlert, RefreshCcw] as const;

export function FailureReasons({ context, reasons }: FailureReasonsProps) {
  return (
    <section
      aria-labelledby="failure-reasons-heading"
      className="flex flex-col gap-3"
    >
      <div className="px-1">
        <h3
          id="failure-reasons-heading"
          className="font-black text-foreground text-lg tracking-tight"
        >
          What may have happened
        </h3>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
          {context}
        </p>
      </div>

      <GroupedMenuList aria-label="Possible reasons">
        {reasons.map((reason, index) => {
          const Icon = REASON_ICONS[index] ?? BadgeAlert;

          return (
            <GroupedMenuItem key={reason}>
              <div className="flex min-h-14 items-center gap-3 px-3.5 py-3">
                <Icon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <p className="font-semibold text-foreground text-sm leading-snug">
                  {reason}
                </p>
              </div>
            </GroupedMenuItem>
          );
        })}
      </GroupedMenuList>
    </section>
  );
}
