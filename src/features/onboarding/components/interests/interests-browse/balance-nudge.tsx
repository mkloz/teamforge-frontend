import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

export function BalanceNudge() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2.5 mb-4 px-3.5 py-3 bg-amber-50 border border-amber-200 rounded-xl"
    >
      <span className="text-base shrink-0 mt-0.5">🌱</span>
      <p className="font-sans text-xs text-amber-800 leading-snug flex-1">
        Great depth in one area! Adding interests from other categories helps us
        find better team matches for you.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-amber-400 hover:text-amber-600 shrink-0 mt-0.5 transition-colors"
        aria-label="Dismiss"
      >
        <X size={13} strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}
