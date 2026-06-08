import type { LaneBucket, LaneKey } from "../types";
import { lanePriority } from "./lane-config";

export function rankLaneBuckets(grouped: Map<LaneKey, LaneBucket>) {
  return [...grouped.entries()].sort((left, right) => {
    const scoreDelta = right[1].score - left[1].score;

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    const countDelta = right[1].evidence.length - left[1].evidence.length;

    if (countDelta !== 0) {
      return countDelta;
    }

    return lanePriority.indexOf(left[0]) - lanePriority.indexOf(right[0]);
  });
}
