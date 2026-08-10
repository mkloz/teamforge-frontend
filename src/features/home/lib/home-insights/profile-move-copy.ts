import type { HomeViewer } from "@/features/home/lib/home-contract";

export function getProfileMoveCopy(
  nextStep: NonNullable<HomeViewer["nextStep"]>,
  profileCompleteness: number,
) {
  const signal = `${profileCompleteness}% ready`;

  switch (nextStep.kind) {
    case "security":
      return {
        eyebrow: "Secure your account",
        title: nextStep.title,
        body: "Review your account security before joining more group plans.",
        primaryLabel: nextStep.label,
        secondaryLabel: "Open profile",
        signal,
      };
    case "account":
      return {
        eyebrow: "Finish your profile",
        title: nextStep.title,
        body: "Complete your profile so people can review it before sharing a plan with you.",
        primaryLabel: nextStep.label,
        secondaryLabel: "Open profile",
        signal,
      };
    case "personality":
      return {
        eyebrow: "Add personality details",
        title: nextStep.title,
        body: "Complete the personality assessment so Findafew can use those details when forming groups.",
        primaryLabel: nextStep.label,
        secondaryLabel: "Open profile",
        signal,
      };
    case "interests":
      return {
        eyebrow: "Add your interests",
        title: nextStep.title,
        body: "Add interests so Findafew can suggest activity plans you may want to join.",
        primaryLabel: nextStep.label,
        secondaryLabel: "Open profile",
        signal,
      };
  }

  throw new Error("Unsupported profile next step.");
}
