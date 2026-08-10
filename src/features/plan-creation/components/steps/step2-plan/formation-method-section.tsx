import type { GroupFormationMode } from "@/features/plan-creation/lib/plan-creation-contract";

import { PlanDecisionToggle } from "./plan-decision-toggle";

interface FormationMethodSectionProps {
  onChange: (value: GroupFormationMode) => void;
  value: GroupFormationMode;
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
          checkedDescription="Findafew keeps searching until a group can be proposed."
          label="Let Findafew find people"
          onCheckedChange={(checked) => onChange(checked ? "AUTO" : "MANUAL")}
          uncheckedDescription="You’ll choose and invite people yourself."
        />
      </div>
    </div>
  );
}
