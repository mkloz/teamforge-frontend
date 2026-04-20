import { ShieldCheck } from "lucide-react";
import { OceanDiagram } from "../../profile/components/ocean-chart";
import type { OceanScores } from "../../profile/types/profile.types";

interface IdentityCardProps {
  mbti: string;
  oceanScores: OceanScores;
  trustScore: number;
}

export function IdentityCard({
  mbti,
  oceanScores,
  trustScore,
}: IdentityCardProps) {
  return (
    <div className="group relative bg-canvas/40 backdrop-blur-sm border-2 border-border p-4 rounded-3xl transition-all duration-300 hover:border-forge-teal/40 hover:bg-canvas hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-forge-teal text-background flex items-center justify-center font-black text-sm shadow-sm ring-1 ring-forge-teal/20">
            {mbti}
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
              Match Identity
            </h4>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-80 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-forge-teal animate-pulse" />
              Verified
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-spark-amber">
            <ShieldCheck className="size-4" strokeWidth={2.5} />
            <span className="text-sm font-black tabular-nums tracking-tighter">
              {trustScore}
            </span>
          </div>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
            Trust Score
          </span>
        </div>
      </div>

      {/* Reusing the official OceanDiagram from Profile feature */}
      <div className="w-full aspect-5/4 max-w-70 mx-auto -my-4 flex items-center justify-center">
        <OceanDiagram scores={oceanScores} interactive={false} />
      </div>
    </div>
  );
}
