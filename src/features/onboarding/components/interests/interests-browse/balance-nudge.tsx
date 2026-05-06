import { motion } from "framer-motion";
import { X, Sprout } from "lucide-react";
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
      className="flex items-start gap-2.5 mb-4 px-3.5 py-3 bg-spark-amber/5 border border-spark-amber/20 rounded-xl"
    >
      <div className="text-spark-amber shrink-0 mt-0.5">
        <Sprout size={16} strokeWidth={2} />
      </div>
      <p className="font-sans text-xs text-ink leading-snug flex-1">
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
