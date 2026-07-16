import { getParticipantOceanScores } from "./show-up-profile/ocean-scoring";
import { buildOceanSignals } from "./show-up-profile/signal-builders";
import type { ShowUpSignal } from "./show-up-profile/types";
import type { UserProfilePanelParticipant } from "./types";

export type { ShowUpSignal } from "./show-up-profile/types";

export function buildShowUpSignals(
  participant: UserProfilePanelParticipant,
): ShowUpSignal[] {
  const oceanScores = getParticipantOceanScores(participant);

  if (oceanScores) {
    return buildOceanSignals(oceanScores);
  }

  return [];
}
