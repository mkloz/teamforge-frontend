import type { UserProfile } from "../types/profile.types";
import { getCognitiveStack } from "../lib/cognitive-functions";
import { TypeHeader } from "./type-header";
import { DimensionSpectrum } from "./dimension-spectrum";
import { CognitiveStack } from "./cognitive-stack";
import { PersonalityNarrative } from "./personality-narrative";

interface PersonalitySectionProps {
  profile: UserProfile;
}

export function PersonalitySection({ profile }: PersonalitySectionProps) {
  const cognitiveStack = getCognitiveStack(profile.mbtiType);
  
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-6 shadow-sm animate-fade-up">
      {/* Section title */}
      <h3 className="text-sm font-semibold text-foreground">
        Personality
      </h3>
      
      {/* Type header with borderline highlighting */}
      <TypeHeader 
        type={profile.mbtiType} 
        dimensionScores={profile.dimensionScores} 
      />
      
      {/* Dimension spectrums */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground">
          Dimensions
        </h4>
        <div className="space-y-3">
          {profile.dimensionScores.map((score) => (
            <DimensionSpectrum key={score.dimension} score={score} />
          ))}
        </div>
      </div>
      
      {/* Cognitive function stack */}
      <CognitiveStack stack={cognitiveStack} />
      
      {/* Auto-generated narrative */}
      <PersonalityNarrative 
        stack={cognitiveStack}
        dimensionScores={profile.dimensionScores}
      />
    </div>
  );
}
