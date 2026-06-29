import { m } from "framer-motion";
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
    <m.div
      variants={fadeUpItem}
      className="mt-auto flex w-full xs:flex-row flex-col-reverse xs:items-center items-stretch gap-3 pt-6"
    >
      <Button
        size="md"
        variant="outline"
        onClick={onBack}
        className="w-full xs:w-auto min-w-0 xs:shrink-0 px-4"
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        <span className="truncate">{backLabel}</span>
      </Button>
      <Button size="md" onClick={onBegin} className="w-full min-w-0 xs:flex-1">
        <span className="truncate">{actionLabel}</span>
        <ArrowRight size={18} strokeWidth={2.5} />
      </Button>
    </m.div>
  );
}
