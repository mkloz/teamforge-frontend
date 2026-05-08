import type { HomeViewer } from "@/features/home/lib/home-contract";

export type HomeNextMove =
  | {
      kind: "profile";
      eyebrow: string;
      title: string;
      body: string;
      primaryLabel: string;
      secondaryLabel: string;
      signal: string;
      nextStep: NonNullable<HomeViewer["nextStep"]>;
    }
  | {
      kind: "invitation";
      eyebrow: string;
      title: string;
      body: string;
      primaryLabel: string;
      secondaryLabel: string;
      signal: string;
      inviteId: string;
    }
  | {
      kind: "plan";
      eyebrow: string;
      title: string;
      body: string;
      primaryLabel: string;
      secondaryLabel: string;
      signal: string;
      groupId: string;
      planId: string;
    }
  | {
      kind: "recommendation";
      eyebrow: string;
      title: string;
      body: string;
      primaryLabel: string;
      secondaryLabel: string;
      signal: string;
    }
  | {
      kind: "forge";
      eyebrow: string;
      title: string;
      body: string;
      primaryLabel: string;
      secondaryLabel: string;
      signal: string;
    };
