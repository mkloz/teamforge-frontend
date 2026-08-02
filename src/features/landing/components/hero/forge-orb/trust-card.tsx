import { ShieldCheck } from "lucide-react";
import { ForgeOrbEyebrow, ForgeOrbPanel } from "./forge-orb-panel";

export function TrustCard() {
  return (
    <ForgeOrbPanel className="w-37.5 animate-forge-card-float-c motion-reduce:animate-none">
      <ForgeOrbEyebrow className="mb-2.5">
        Participation history
      </ForgeOrbEyebrow>
      <div className="flex items-center gap-2.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-forge-teal/75 bg-forge-teal/10">
          <ShieldCheck
            aria-hidden="true"
            className="size-5 text-forge-teal"
            strokeWidth={2}
          />
        </div>
        <div>
          <p className="font-sans text-text-dark-muted text-xs leading-snug">
            Eligible plans
          </p>
          <p className="font-sans font-semibold text-forge-teal text-xs leading-snug">
            Build reputation
          </p>
        </div>
      </div>
    </ForgeOrbPanel>
  );
}
