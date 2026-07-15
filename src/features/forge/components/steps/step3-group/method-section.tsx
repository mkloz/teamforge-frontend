import { Cpu, UsersRound } from "lucide-react";

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
    <section className="flex flex-col gap-2.5 border-border/25 border-t pt-4">
      <p className="px-0.5 font-semibold text-foreground text-sm">Method</p>
      <div className="grid grid-cols-2 gap-2">
        <ModeButton
          active={forgeMode === "AUTO"}
          onClick={() => onForgeModeChange("AUTO")}
          icon={Cpu}
          title="Forge for me"
          description="TeamForge uses your profile and group preferences to choose people."
          activeColor="primary"
        />
        <ModeButton
          active={forgeMode === "MANUAL"}
          onClick={() => onForgeModeChange("MANUAL")}
          icon={UsersRound}
          title="Pick my own"
          description="Choose members yourself and set a fixed group size."
          activeColor="accent"
        />
      </div>
    </section>
  );
}
