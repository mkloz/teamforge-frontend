import { Button } from "@/shared/components/ui/button";
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
            size="sm"
            onClick={onAdjustLength}
            className="w-full"
          >
            <Target size={14} strokeWidth={2.5} />
            Adjust test depth
          </Button>
        </motion.div>
      )}

      <motion.div variants={fadeUpItem} className="w-full pb-8">
        <Button
          variant={upgradeConfig ? "secondary" : "primary"}
          size="lg"
          onClick={onContinue}
          className="w-full"
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
