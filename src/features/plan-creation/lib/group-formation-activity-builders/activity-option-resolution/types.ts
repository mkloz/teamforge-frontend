import type { ActivityOption } from "@/features/plan-creation/constants/plan-creation.constants";

export interface ActivityScore {
  option: ActivityOption;
  score: number;
}

export interface ActivityScoreRanking {
  bestScore: ActivityScore | null;
  runnerUpScore: ActivityScore | null;
}
