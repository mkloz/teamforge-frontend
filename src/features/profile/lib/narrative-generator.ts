import type { CognitiveFunction, DimensionScore } from "../types/profile.types";

// Dominant function narrative templates
const DOMINANT_NARRATIVES: Record<string, string> = {
  Ne: "You lead with imaginative exploration, constantly seeking new possibilities and connections in the world around you.",
  Ni: "You navigate life through deep intuition, forming profound insights and envisioning future pathways that others might miss.",
  Se: "You thrive in the present moment, fully engaging with the physical world and responding to life with quick, practical action.",
  Si: "You draw strength from rich inner memories, valuing tradition and bringing careful attention to the details that matter most.",
  Te: "You approach the world with organized efficiency, naturally structuring systems and driving toward tangible results.",
  Ti: "You build precise logical frameworks, analyzing problems with independent thinking and a drive for accuracy.",
  Fe: "You lead with warmth and social awareness, naturally reading group dynamics and fostering harmony in your relationships.",
  Fi: "You're guided by deeply held personal values, making authenticity your compass and staying true to what matters most to you.",
};

// Auxiliary function narrative templates
const AUXILIARY_NARRATIVES: Record<string, string> = {
  Ne: "Your thinking is enhanced by a natural ability to brainstorm and see alternative perspectives.",
  Ni: "Beneath the surface, you hold powerful intuitions that guide your decisions.",
  Se: "You balance this with a grounded awareness of your surroundings and practical realities.",
  Si: "This is supported by a reliable memory for details and appreciation for what has worked before.",
  Te: "Your approach is strengthened by logical organization and goal-oriented thinking.",
  Ti: "You support this with careful internal analysis and logical consistency.",
  Fe: "You naturally complement this with awareness of others' feelings and social harmony.",
  Fi: "Your decisions are anchored by a strong internal compass of personal values.",
};

// Borderline dimension explanations
const BORDERLINE_EXPLANATIONS: Record<string, string> = {
  EI: "With your Mind dimension nearly balanced, you're uniquely adaptable - drawing energy from social connection while also valuing meaningful time for reflection.",
  SN: "Your Information dimension being balanced means you can appreciate both concrete details and abstract patterns depending on the situation.",
  TF: "With a balanced Decision dimension, you can switch between logical analysis and value-based reasoning as needed.",
  JP: "Your Lifestyle dimension being balanced lets you enjoy both structured plans and spontaneous flexibility.",
};

export function generatePersonalityNarrative(
  stack: CognitiveFunction[],
  borderlineScores: DimensionScore[]
): string {
  const dominant = stack[0];
  const auxiliary = stack[1];
  
  let narrative = DOMINANT_NARRATIVES[dominant.code] + " " + AUXILIARY_NARRATIVES[auxiliary.code];
  
  // Add borderline note if applicable
  if (borderlineScores.length > 0) {
    const firstBorderline = borderlineScores[0];
    narrative += " " + BORDERLINE_EXPLANATIONS[firstBorderline.dimension];
  }
  
  return narrative;
}

export function getBorderlineExplanation(dimension: string, score: number): string {
  const side = score <= 50 ? "first" : "second";
  const percentage = Math.abs(50 - score) <= 5 ? "nearly balanced" : "leaning";
  
  const dimensionLabels: Record<string, [string, string]> = {
    EI: ["Extraversion", "Introversion"],
    SN: ["Sensing", "Intuition"],
    TF: ["Thinking", "Feeling"],
    JP: ["Judging", "Perceiving"],
  };
  
  const [first, second] = dimensionLabels[dimension] || ["", ""];
  const leaning = side === "first" ? first : second;
  
  return `Your ${first}/${second} preference is ${percentage} (${score}% toward ${leaning}). You likely relate to both descriptions depending on the context.`;
}
