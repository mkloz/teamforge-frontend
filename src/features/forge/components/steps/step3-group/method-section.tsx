import { Flame, UsersRound } from "lucide-react";

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
      <p className="px-0.5 font-semibold text-foreground text-sm">
        How should this group start?
      </p>
      <div className="grid grid-cols-2 gap-2">
        <ModeButton
          active={forgeMode === "AUTO"}
          onClick={() => onForgeModeChange("AUTO")}
          icon={Flame}
          title="Forge for me"
          description="TeamForge keeps the request active and checks it again automatically."
          activeColor="primary"
        />
        <ModeButton
          active={forgeMode === "MANUAL"}
          onClick={() => onForgeModeChange("MANUAL")}
          icon={UsersRound}
          title="Invite people I know"
          description="Choose people yourself and set a fixed group size."
          activeColor="accent"
        />
      </div>
    </section>
  );
}
