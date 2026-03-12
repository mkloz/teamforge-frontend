import { useState } from "react";
import { Check } from "lucide-react";
import type { UserProfile, OceanTraitKey } from "../types/profile.types";
import { TypeHeader } from "./type-header";
import { DimensionSpectrum } from "./dimension-spectrum";
import { OceanChart } from "./ocean-chart";
import { generateDetailedDescription } from "../lib/ocean-traits";

interface PersonalitySectionProps {
  profile: UserProfile;
}

export function PersonalitySection({ profile }: PersonalitySectionProps) {
  const [selectedTrait, setSelectedTrait] = useState<OceanTraitKey | null>(null);
  const personalityProfile = generateDetailedDescription(profile.oceanScores);
  
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
      
      {/* OCEAN Radar Chart - Interactive */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground">
          Personality Traits
        </h4>
        <OceanChart 
          scores={profile.oceanScores} 
          selectedTrait={selectedTrait}
          onTraitSelect={setSelectedTrait}
        />
      </div>
      
      {/* Rich personality description */}
      <div className="pt-4 border-t border-border space-y-4">
        {/* Title badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground">
            {personalityProfile.title}
          </span>
        </div>
        
        {/* Summary */}
        <p className="text-sm text-foreground leading-relaxed">
          {personalityProfile.summary}
        </p>
        
        {/* Strengths */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-muted-foreground">Key Strengths</h5>
          <ul className="space-y-1.5">
            {personalityProfile.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* In Groups */}
        <div className="p-3 rounded-lg bg-muted/50">
          <h5 className="text-xs font-semibold text-foreground mb-1">In Group Activities</h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {personalityProfile.inGroups}
          </p>
        </div>
      </div>
    </div>
  );
}
