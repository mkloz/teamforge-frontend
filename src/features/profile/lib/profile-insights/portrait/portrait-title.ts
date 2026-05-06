import type { PortraitContext, PortraitKey } from "../types";
import { getLanePortraitSubject } from "./lane-portrait-language";

export function buildPortraitTitle(
  key: PortraitKey,
  context: PortraitContext,
): string {
  const laneSubject = getLanePortraitSubject(context.lanes[0]?.key);

  if (key === "restlessInstigator" && laneSubject) {
    return `The person who turns ${laneSubject} into momentum`;
  }

  const titles: Record<PortraitKey, string> = {
    activeCatalyst: "The person who turns a loose plan into a real outing",
    cafeConnector: "The person who makes the easy plan feel personal",
    calmAnchor: "The person who keeps the pace human",
    creativeInstigator: "The person who gives the plan a point of view",
    curiousSpecialist: "The person who brings the good tangent",
    focusedBuilder: "The person who turns talk into a prototype",
    flexibleParticipant: "The person who finds the thread",
    ideaFirstExplorer: "The person who arrives with a better angle",
    playfulScout: "The person who makes joining feel easier",
    practicalOrganizer: "The person who gets the plan to hold",
    quietSpecialist: "The person with the interesting side route",
    restlessInstigator: "The person who gets people moving",
    socialGameHost: "The person who gives everyone something to do",
    steadyHost: "The person who makes the room settle",
    tasteMaker: "The person who makes the plan feel chosen",
    warmConnector: "The person who makes the room easier",
  };

  return titles[key];
}
