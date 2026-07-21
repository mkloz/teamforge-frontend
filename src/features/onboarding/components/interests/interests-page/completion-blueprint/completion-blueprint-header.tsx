import { m } from "framer-motion";
import { BadgeCheck } from "lucide-react";

import { DialogTitle } from "@/shared/components/ui/dialog";
import { StatusPill } from "@/shared/components/ui/status-pill";

import { completionFadeUp } from "./completion-blueprint-motion";

export function CompletionBlueprintHeader() {
  return (
    <m.div variants={completionFadeUp} className="mb-12 text-center">
      <StatusPill
        icon={BadgeCheck}
        tone="none"
        size="sm"
        className="mb-4 border-white/12 bg-white/8 text-foreground/86 shadow-sm backdrop-blur-sm"
      >
        All set
      </StatusPill>
      <DialogTitle asChild>
        <h1 className="font-extrabold font-sans text-4xl text-foreground leading-tight tracking-tight drop-shadow-lg">
          Your TeamForge profile is ready
        </h1>
      </DialogTitle>
    </m.div>
  );
}
