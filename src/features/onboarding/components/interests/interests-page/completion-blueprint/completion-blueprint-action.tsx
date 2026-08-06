import { m } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

import { completionFadeUp } from "./completion-blueprint-motion";

interface CompletionBlueprintActionProps {
  onEnter: () => void;
  onBack: () => void;
}

export function CompletionBlueprintAction({
  onEnter,
  onBack,
}: CompletionBlueprintActionProps) {
  return (
    <m.div
      variants={completionFadeUp}
      className="mt-12 flex w-full flex-col items-center"
    >
      <Button
        variant="primary"
        size="hero"
        className="group w-full"
        onClick={onEnter}
      >
        Enter TeamForge
        <ArrowRight
          size={20}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </Button>

      <Button variant="ghost" size="sm" className="mt-2" onClick={onBack}>
        Back to interests
      </Button>

      <p className="mt-6 max-w-50 text-center font-bold font-sans text-muted-foreground text-xs leading-relaxed drop-shadow-sm">
        This starter profile is not your full compatibility profile.
      </p>
    </m.div>
  );
}
