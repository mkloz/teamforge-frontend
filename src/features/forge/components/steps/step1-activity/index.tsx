import { ActivityCategoryGrid } from "./activity-category-grid";
import { RecentActivityRow } from "./recent-activity-row";
import type { Step1ActivityProps } from "./types";
import { useActivityGridShake } from "./use-activity-grid-shake";

export function Step1Activity({
  appliedTemplateId,
  selectedActivity,
  onSelect,
  onTemplateToggle,
  shakeRequestId = 0,
}: Step1ActivityProps) {
  const shaking = useActivityGridShake(shakeRequestId);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <RecentActivityRow
        appliedTemplateId={appliedTemplateId}
        selectedActivity={selectedActivity}
        onTemplateToggle={onTemplateToggle}
      />
      <ActivityCategoryGrid
        selectedActivity={selectedActivity}
        shaking={shaking}
        onSelect={onSelect}
      />
    </div>
  );
}

export type { Step1ActivityProps } from "./types";
