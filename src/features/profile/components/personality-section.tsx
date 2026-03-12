import type { UserProfile } from "../types/profile.types";
import { TypeHeader } from "./type-header";
import { DimensionSpectrum } from "./dimension-spectrum";
import { OceanChart } from "./ocean-chart";
import { generateDetailedDescription, getTopTraits, getTraitLevel } from "../lib/ocean-traits";

interface PersonalitySectionProps {
  profile: UserProfile;
}

export function PersonalitySection({ profile }: PersonalitySectionProps) {
  const detailedDescription = generateDetailedDescription(profile.oceanScores);
  const topTraits = getTopTraits(profile.oceanScores, 3);
  
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
      
      {/* MBTI Dimension spectrums */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground">
          Type Dimensions
        </h4>
        <div className="space-y-3">
          {profile.dimensionScores.map((score) => (
            <DimensionSpectrum key={score.dimension} score={score} />
          ))}
        </div>
      </div>
      
      {/* OCEAN Radar Chart */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground">
          Personality Traits
        </h4>
        <OceanChart scores={profile.oceanScores} />
        
        {/* Top traits summary */}
        <div className="flex flex-wrap gap-2 justify-center pt-2">
          {topTraits.map((trait) => (
            <span 
              key={trait.key}
              className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              {trait.label}: {getTraitLevel(profile.oceanScores[trait.key])}
            </span>
          ))}
        </div>
      </div>
      
      {/* Rich personality description */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
          About This Personality
        </h4>
        <p className="text-sm text-foreground leading-relaxed">
          {detailedDescription}
        </p>
      </div>
    </div>
  );
}
