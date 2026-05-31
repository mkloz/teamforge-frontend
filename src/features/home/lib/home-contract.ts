import type { HomeGroup } from "@/features/home/schemas/home-group.schema";
import type { User } from "@/shared/schemas";

export interface UserStats {
  trustScore: number;
  groupsJoined: number;
  activitiesDone: number;
  connections: number;
  profileCompleteness: number;
}

export interface HomeViewer {
  firstName: string;
  mbti: User["personalityType"] | null;
  nextStep:
    | {
        kind: "security";
        title: string;
        body: string;
        label: string;
      }
    | {
        kind: "account";
        title: string;
        body: string;
        label: string;
      }
    | {
        kind: "personality";
        title: string;
        body: string;
        label: string;
      }
    | {
        kind: "interests";
        title: string;
        body: string;
        label: string;
      }
    | null;
}

export type PlannedGroup = HomeGroup & {
  plan: NonNullable<HomeGroup["plan"]>;
};
