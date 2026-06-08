import { ForgeOrbEyebrow, ForgeOrbPanel } from "./forge-orb-panel";

export function MbtiCard() {
  return (
    <ForgeOrbPanel className="w-45 animate-forge-card-float-a motion-reduce:animate-none">
      <ForgeOrbEyebrow className="mb-1.5">Personality</ForgeOrbEyebrow>
      <p className="mb-2.5 font-extrabold font-sans text-2xl text-white tracking-tight">
        ENTJ
      </p>
      <div className="flex flex-col gap-1.5">
        {[
          { label: "E", fill: 80, peer: "I" },
          { label: "N", fill: 55, peer: "S" },
          { label: "T", fill: 70, peer: "F" },
          { label: "J", fill: 65, peer: "P" },
        ].map(({ label, fill, peer }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 font-bold font-sans text-forge-teal text-nano">
              {label}
            </span>
            <div className="h-0.75 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-forge-teal"
                style={{ width: `${fill}%` }}
              />
            </div>
            <span className="w-2.5 text-right font-sans text-nano text-text-dark-muted">
              {peer}
            </span>
          </div>
        ))}
      </div>
    </ForgeOrbPanel>
  );
}
