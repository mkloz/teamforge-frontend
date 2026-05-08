import { motion } from "framer-motion";
import { Sprout, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";

export function BalanceNudge() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="mb-4 flex items-start gap-2.5 rounded-xl border border-spark-amber/20 bg-spark-amber/5 px-3.5 py-3"
    >
      <div className="mt-0.5 shrink-0 text-spark-amber">
        <Sprout size={16} strokeWidth={2} />
      </div>
      <p className="flex-1 font-sans text-ink text-xs leading-snug">
        You have a strong lane here. A few picks from another area can make the
        profile feel more like the full you.
      </p>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => setDismissed(true)}
        className="mt-0.5 shrink-0 text-spark-amber/50 hover:text-spark-amber"
        aria-label="Dismiss"
      >
        <X size={14} strokeWidth={2.5} />
      </Button>
    </motion.div>
  );
}
