import type { ActivityOption } from "@/features/forge/constants/forge.constants";

export interface ActivityScore {
  option: ActivityOption;
  score: number;
}

export interface ActivityScoreRanking {
  bestScore: ActivityScore | null;
  runnerUpScore: ActivityScore | null;
}
