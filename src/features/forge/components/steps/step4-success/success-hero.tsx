import { Check } from "lucide-react";

interface SuccessHeroProps {
  planTitle: string;
}

export function SuccessHero({ planTitle }: SuccessHeroProps) {
  return (
    <div className="rounded-2xl bg-forge-teal/8 border border-forge-teal/20 p-5 flex items-center gap-4">
      <div className="shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-forge-teal flex items-center justify-center shadow-lg shadow-forge-teal/25">
          <Check size={22} className="text-white" strokeWidth={2.5} />
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-forge-teal">Group forged</p>
        <h3 className="text-base font-bold text-foreground leading-tight mt-0.5 truncate">
          Ready for &ldquo;{planTitle}&rdquo;
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review your group below before continuing.
        </p>
      </div>
    </div>
  );
}
