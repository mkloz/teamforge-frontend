import type { ForgeMode } from "@/features/forge/lib/forge-contract";

import { PlanDecisionToggle } from "./plan-decision-toggle";

interface FormationMethodSectionProps {
  onChange: (value: ForgeMode) => void;
  value: ForgeMode;
}

export function FormationMethodSection({
  onChange,
  value,
}: FormationMethodSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="max-w-xl text-muted-foreground text-sm leading-relaxed">
        Choose how the first members should arrive.
      </p>
      <div className="border-border/30 border-t">
        <PlanDecisionToggle
          checked={value === "AUTO"}
          checkedDescription="TeamForge keeps searching until a group can be proposed."
          label="Let TeamForge find people"
          onCheckedChange={(checked) => onChange(checked ? "AUTO" : "MANUAL")}
          uncheckedDescription="You’ll choose and invite people yourself."
        />
      </div>
    </div>
  );
}
