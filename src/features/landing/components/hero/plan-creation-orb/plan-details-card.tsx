import { CalendarClock, MapPin } from "lucide-react";

import {
  GroupConvergenceVisualEyebrow,
  GroupConvergenceVisualPanel,
} from "./plan-creation-orb-panel";

export function PlanDetailsCard() {
  return (
    <GroupConvergenceVisualPanel className="w-45 animate-plan-creation-card-float-a motion-reduce:animate-none">
      <GroupConvergenceVisualEyebrow className="mb-1.5">
        Shared activity
      </GroupConvergenceVisualEyebrow>
      <p className="mb-2.5 font-extrabold font-sans text-lg text-white tracking-tight">
        Board games
      </p>
      <div className="flex flex-col gap-2 text-text-dark-muted text-xs">
        <p className="flex items-center gap-1.5">
          <CalendarClock className="size-3.5 text-foreground" aria-hidden />
          Thursday evening
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin className="size-3.5 text-foreground" aria-hidden />
          City centre
        </p>
      </div>
    </GroupConvergenceVisualPanel>
  );
}
