import type { HomeGroup } from "@/features/home/schemas/home-group.schema";
import type { User } from "@/shared/schemas";

export interface UserStats {
  groupsJoined: number;
  activitiesDone: number;
  connections: number;
  profileCompleteness: number;
}

export type HomeSetupStepKind =
  | "security"
  | "account"
  | "personality"
  | "interests";

export type HomeSetupStepId =
  | "email"
  | "basics"
  | "bio"
  | "avatar"
  | "assessment"
  | "interests";

export interface HomeSetupStep {
  id: HomeSetupStepId;
  kind: HomeSetupStepKind;
  title: string;
  body: string;
  label: string;
}

export interface HomeViewer {
  firstName: string;
  mbti: User["personalityType"] | null;
  nextStep: HomeSetupStep | null;
  setupCompletedCount: number;
  setupSteps: HomeSetupStep[];
  setupTotalCount: number;
}

export type PlannedGroup = HomeGroup & {
  plan: NonNullable<HomeGroup["plan"]>;
};
