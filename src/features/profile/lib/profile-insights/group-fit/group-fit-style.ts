import type { PortraitKey } from "../types";

export type GroupFitPosture =
  | "adapter"
  | "builder"
  | "connector"
  | "coordinator"
  | "curator"
  | "host"
  | "observer"
  | "specialist"
  | "starter";

export interface GroupFitStyle {
  posture: GroupFitPosture;
  title: string;
}

export function getGroupFitStyle(key: PortraitKey): GroupFitStyle {
  const styles: Record<PortraitKey, GroupFitStyle> = {
    activeCatalyst: {
      posture: "starter",
      title: "Activity-first catalyst",
    },
    cafeConnector: {
      posture: "connector",
      title: "Easy-start connector",
    },
    calmAnchor: {
      posture: "observer",
      title: "Calm group anchor",
    },
    creativeInstigator: {
      posture: "starter",
      title: "Creative spark",
    },
    curiousSpecialist: {
      posture: "specialist",
      title: "Curious specialist",
    },
    focusedBuilder: {
      posture: "builder",
      title: "Builder-minded fit",
    },
    flexibleParticipant: {
      posture: "adapter",
      title: "Flexible group fit",
    },
    ideaFirstExplorer: {
      posture: "starter",
      title: "Idea-first explorer",
    },
    playfulScout: {
      posture: "connector",
      title: "Low-pressure scout",
    },
    practicalOrganizer: {
      posture: "coordinator",
      title: "Plan shaper",
    },
    quietSpecialist: {
      posture: "specialist",
      title: "Focused specialist",
    },
    restlessInstigator: {
      posture: "starter",
      title: "First-move energy",
    },
    socialGameHost: {
      posture: "host",
      title: "Activity host",
    },
    steadyHost: {
      posture: "coordinator",
      title: "Steady host",
    },
    tasteMaker: {
      posture: "curator",
      title: "Taste-led fit",
    },
    warmConnector: {
      posture: "connector",
      title: "Warm connector",
    },
  };

  return styles[key];
}
