import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target } from "lucide-react";
import { fadeUpItem } from "../../../constants/motion";
import {
  TEST_LENGTH_CONFIG,
  type TestLength,
} from "../../../data/ipip-questions";

interface ActionSectionProps {
  isDone: boolean;
  selectedUpgrade: TestLength | null;
  onContinue: () => void;
  onAdjustLength: () => void;
}

export function ActionSection({
  isDone,
  selectedUpgrade,
  onContinue,
  onAdjustLength,
}: ActionSectionProps) {
  const upgradeConfig = selectedUpgrade
    ? TEST_LENGTH_CONFIG[selectedUpgrade]
    : null;

  const buttonLabel = upgradeConfig
    ? `Upgrade to ${upgradeConfig.label} & Continue`
    : isDone
      ? "Finish assessment"
      : "Continue assessment";
  return (
    <>
      {!isDone && (
        <motion.div variants={fadeUpItem} className="w-full mb-3">
          <Button
            variant="outline"
            onClick={onAdjustLength}
            className="w-full flex items-center justify-center gap-2 font-sans text-xs font-bold rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 transition-all h-11"
          >
            <Target size={14} strokeWidth={2.5} />
            Adjust test depth
          </Button>
        </motion.div>
      )}

      <motion.div variants={fadeUpItem} className="w-full pb-8">
        <Button
          size="lg"
          onClick={onContinue}
          className={cn(
            "w-full flex items-center justify-center gap-2 font-sans text-sm font-bold rounded-xl transition-all duration-200 active:scale-[0.98] h-14",
            upgradeConfig
              ? "bg-spark-amber text-white hover:bg-spark-amber/90 shadow-lg shadow-spark-amber/20"
              : "bg-forge-teal text-white hover:bg-forge-teal/90 shadow-lg shadow-forge-teal/20",
          )}
        >
          {buttonLabel}
          {upgradeConfig ? (
            <Sparkles size={16} strokeWidth={2.5} />
          ) : (
            <ArrowRight size={16} strokeWidth={2.5} />
          )}
        </Button>
      </motion.div>
    </>
  );
}
