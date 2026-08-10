import { m } from "framer-motion";
import { Sprout, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

export function BalanceNudge() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <m.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="mb-4 flex items-start gap-2.5 rounded-xl border border-brand-amber/20 bg-accent-soft px-3.5 py-3"
    >
      <div className="mt-0.5 shrink-0 text-brand-amber">
        <Sprout size={16} strokeWidth={2} />
      </div>
      <p className="flex-1 font-sans text-ink text-xs leading-snug">
        Most of your picks are in one area. Add interests from another area if
        they also appeal to you.
      </p>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setDismissed(true)}
            className="mt-0.5 shrink-0 text-brand-amber/50 hover:text-brand-amber"
            aria-label="Dismiss"
          >
            <X size={14} strokeWidth={2.5} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Dismiss</TooltipContent>
      </Tooltip>
    </m.div>
  );
}
