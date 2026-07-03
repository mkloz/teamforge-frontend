import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import { ProfileSignal } from "./profile-signal";

export function TrustBadge({
  trustScore,
  trustLabel,
}: {
  trustScore: number;
  trustLabel: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group rounded text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={`Trust score: ${trustScore} ${trustLabel}. Click for more information.`}
        >
          <ProfileSignal
            accent="text-forge-teal"
            label="Trust"
            value={
              <span className="inline-flex items-center">
                {trustScore}
                <span className="hidden whitespace-pre sm:inline">
                  {" "}
                  {trustLabel}
                </span>
              </span>
            }
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={10}
        className="w-64 border-white/8 bg-ink p-4"
      >
        <TrustPopoverContent trustScore={trustScore} trustLabel={trustLabel} />
      </PopoverContent>
    </Popover>
  );
}

function TrustPopoverContent({
  trustScore,
  trustLabel,
}: {
  trustScore: number;
  trustLabel: string;
}) {
  const tiers: Array<{ label: string; range: string; active: boolean }> = [
    { label: "High", range: "80–100", active: trustLabel === "High" },
    { label: "Medium", range: "50–79", active: trustLabel === "Medium" },
    { label: "Low", range: "0–49", active: trustLabel === "Low" },
  ];

  return (
    <div className="space-y-3">
      <div>
        <p className="font-semibold text-sm text-white">Trust score</p>
        <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
          Built from how groups have gone. Each completed activity and honest
          review shapes this number.
        </p>
      </div>

      <div className="space-y-1.5">
        {tiers.map((tier) => (
          <div
            key={tier.label}
            className={cn(
              "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
              tier.active
                ? "bg-forge-teal/12 text-forge-teal"
                : "text-slate-muted",
            )}
          >
            <span className="font-medium">{tier.label}</span>
            <span className="tabular-nums opacity-70">{tier.range}</span>
          </div>
        ))}
      </div>

      <div className="border-white/6 border-t pt-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-muted text-xs">Current</span>
          <span className="font-bold text-forge-teal text-sm tabular-nums">
            {trustScore}
          </span>
        </div>

        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-forge-teal transition-all duration-500"
            style={{ width: `${trustScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}
