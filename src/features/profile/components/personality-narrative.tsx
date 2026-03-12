import { Info } from "lucide-react";
import type { CognitiveFunction, DimensionScore } from "../types/profile.types";
import { generatePersonalityNarrative } from "../lib/narrative-generator";

interface PersonalityNarrativeProps {
  stack: CognitiveFunction[];
  dimensionScores: DimensionScore[];
}

export function PersonalityNarrative({ stack, dimensionScores }: PersonalityNarrativeProps) {
  const borderlineScores = dimensionScores.filter(d => d.isBorderline);
  const narrative = generatePersonalityNarrative(stack, borderlineScores);
  
  return (
    <div className="space-y-4">
      {/* Divider */}
      <div className="border-t border-border" />
      
      {/* Narrative */}
      <p className="text-sm text-foreground/80 leading-relaxed">
        {narrative}
      </p>
      
      {/* Borderline insight box - only shown if there are borderline dimensions */}
      {borderlineScores.length > 0 && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border-l-2 border-blue-500">
          <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Note:</span>{" "}
            {borderlineScores.length === 1 ? (
              <>
                Your {getDimensionName(borderlineScores[0].dimension)} dimension is borderline ({borderlineScores[0].score}%).
                You likely relate to both sides depending on context.
              </>
            ) : (
              <>
                {borderlineScores.length} of your dimensions are borderline, giving you unusual flexibility
                to adapt your approach based on the situation.
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getDimensionName(dimension: string): string {
  const names: Record<string, string> = {
    EI: "Mind (E/I)",
    SN: "Energy (S/N)",
    TF: "Nature (T/F)",
    JP: "Tactics (J/P)",
  };
  return names[dimension] || dimension;
}
