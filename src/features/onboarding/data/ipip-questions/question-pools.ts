import { AGREEABLENESS_QUESTIONS } from "@/features/onboarding/data/ipip-questions/agreeableness";
import { CONSCIENTIOUSNESS_QUESTIONS } from "@/features/onboarding/data/ipip-questions/conscientiousness";
import { EXTRAVERSION_QUESTIONS } from "@/features/onboarding/data/ipip-questions/extraversion";
import { NEUROTICISM_QUESTIONS } from "@/features/onboarding/data/ipip-questions/neuroticism";
import { OPENNESS_QUESTIONS } from "@/features/onboarding/data/ipip-questions/openness";
import type { IpipQuestion } from "@/features/onboarding/data/ipip-questions.types";

/**
 * 150-item pool: 30 per dimension.
 * Items are drawn in interleaved order per the test-length configs below.
 * All items re-worded from IPIP public domain constructs in plain English,
 * avoiding clinical terminology per brand guidelines.
 */
export const IPIP_QUESTIONS: IpipQuestion[] = [
  ...OPENNESS_QUESTIONS,
  ...CONSCIENTIOUSNESS_QUESTIONS,
  ...EXTRAVERSION_QUESTIONS,
  ...AGREEABLENESS_QUESTIONS,
  ...NEUROTICISM_QUESTIONS,
];
