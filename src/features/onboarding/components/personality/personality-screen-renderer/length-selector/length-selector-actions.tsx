import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { fadeUpItem } from "@/features/onboarding/constants/motion";
import { Button } from "@/shared/components/ui/button";

interface LengthSelectorActionsProps {
  actionLabel: string;
  backLabel: string;
  onBegin: () => void;
  onBack: () => void;
}

export function LengthSelectorActions({
  actionLabel,
  onBegin,
  backLabel,
  onBack,
}: LengthSelectorActionsProps) {
  return (
    <motion.div
      variants={fadeUpItem}
      className="mt-auto flex w-full flex-col-reverse items-stretch gap-3 pt-6 min-[430px]:flex-row min-[430px]:items-center"
    >
      <Button
        size="lg"
        variant="outline"
        onClick={onBack}
        className="w-full min-w-0 px-4 min-[430px]:w-auto min-[430px]:shrink-0"
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        <span className="truncate">{backLabel}</span>
      </Button>
      <Button
        size="lg"
        onClick={onBegin}
        className="w-full min-w-0 min-[430px]:flex-1"
      >
        <span className="truncate">{actionLabel}</span>
        <ArrowRight size={18} strokeWidth={2.5} />
      </Button>
    </motion.div>
  );
}
