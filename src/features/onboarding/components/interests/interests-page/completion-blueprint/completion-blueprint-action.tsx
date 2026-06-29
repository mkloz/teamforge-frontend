import { m } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

import { completionFadeUp } from "./completion-blueprint-motion";

interface CompletionBlueprintActionProps {
  onEnter: () => void;
}

export function CompletionBlueprintAction({
  onEnter,
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

      <p className="mt-6 max-w-50 text-center font-bold font-sans text-muted-foreground text-xs leading-relaxed drop-shadow-sm">
        Built from your personality and interests.
      </p>
    </m.div>
  );
}
