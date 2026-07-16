import { MethodSection } from "@/features/forge/components/steps/step3-group/method-section";

import type { CurrentForgeStepProps } from "./types";

type TemplatesStepPanelProps = Pick<CurrentForgeStepProps, "fw">;

export function TemplatesStepPanel({ fw }: TemplatesStepPanelProps) {
  return (
    <div className="pb-4">
      <MethodSection
        forgeMode={fw.forgeMode}
        onForgeModeChange={fw.setForgeMode}
      />
    </div>
  );
}
