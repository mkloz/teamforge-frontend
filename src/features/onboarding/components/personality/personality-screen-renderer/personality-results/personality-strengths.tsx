import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { popDownItem } from "@/features/onboarding/constants/motion";

interface PersonalityStrengthsProps {
  strengths: string[];
}

export function PersonalityStrengths({ strengths }: PersonalityStrengthsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border/70" />
        <p className="shrink-0 text-[11px] font-black uppercase tracking-[0.18em] text-forge-teal">
          Key strengths
        </p>
        <span className="h-px flex-1 bg-border/70" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {strengths.map((strength) => (
          <StrengthItem key={strength}>{strength}</StrengthItem>
        ))}
      </div>
    </div>
  );
}

function StrengthItem({ children }: { children: string }) {
  return (
    <motion.div
      variants={popDownItem}
      className="flex items-start gap-3 text-sm font-semibold leading-snug text-ink/86"
    >
      <Check size={15} className="mt-0.5 shrink-0 text-forge-teal" />
      <span>{children}</span>
    </motion.div>
  );
}
