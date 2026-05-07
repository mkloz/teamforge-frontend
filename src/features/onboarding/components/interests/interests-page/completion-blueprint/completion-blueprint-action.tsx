import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { completionFadeUp } from "./completion-blueprint-motion";

interface CompletionBlueprintActionProps {
  onEnter: () => void;
}

export function CompletionBlueprintAction({
  onEnter,
}: CompletionBlueprintActionProps) {
  return (
    <motion.div
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

      <p className="mt-6 max-w-50 text-center font-sans text-[10px] leading-relaxed font-bold tracking-widest text-muted-foreground uppercase drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
        Built from your personality and interests.
      </p>
    </motion.div>
  );
}
