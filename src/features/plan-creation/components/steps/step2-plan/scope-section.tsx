import { PlanDecisionToggle } from "./plan-decision-toggle";
import type { GroupFormationScope } from "./types";

export function ScopeSection({
  onChange,
  value,
}: {
  onChange: (value: GroupFormationScope) => void;
  value: GroupFormationScope;
}) {
  return (
    <PlanDecisionToggle
      checked={value === "ONLINE"}
      checkedDescription="People will join remotely."
      label="Online activity"
      onCheckedChange={(checked) => onChange(checked ? "ONLINE" : "LOCAL")}
      uncheckedDescription="People will meet around your saved area."
    />
  );
}
