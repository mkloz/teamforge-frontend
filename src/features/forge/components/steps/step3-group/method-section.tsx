import { Cpu, Zap } from "lucide-react";

import type { ForgeMode } from "@/features/forge/lib/forge-contract";

import { ModeButton } from "./mode-button";

interface MethodSectionProps {
  forgeMode: ForgeMode;
  onForgeModeChange: (v: ForgeMode) => void;
}

export function MethodSection({
  forgeMode,
  onForgeModeChange,
}: MethodSectionProps) {
  return (
    <section className="space-y-2.5 pt-2 border-t border-muted/20">
      <p className="text-xs md:text-sm font-semibold text-muted-foreground px-0.5">
        Choose your method
      </p>
      <div className="grid grid-cols-2 gap-3">
        <ModeButton
          active={forgeMode === "AUTO"}
          onClick={() => onForgeModeChange("AUTO")}
          icon={<Cpu size={16} />}
          title="Algorithmic"
          description="Algorithm finds the best balance for you."
          activeColor="primary"
        />
        <ModeButton
          active={forgeMode === "MANUAL"}
          onClick={() => onForgeModeChange("MANUAL")}
          icon={<Zap size={16} />}
          title="Manual"
          description="You pick the members and set a fixed size."
          activeColor="accent"
        />
      </div>
    </section>
  );
}
