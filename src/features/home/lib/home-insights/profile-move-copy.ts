import type { HomeViewer } from "@/features/home/lib/home-contract";

export function getProfileMoveCopy(
  nextStep: NonNullable<HomeViewer["nextStep"]>,
  profileCompleteness: number,
) {
  const signal = `${profileCompleteness}% ready`;

  switch (nextStep.kind) {
    case "security":
      return {
        eyebrow: "Secure the basics",
        title: nextStep.title,
        body: "Lock this down before you bring more people into your plans.",
        primaryLabel: nextStep.label,
        secondaryLabel: "Open profile",
        signal,
      };
    case "account":
      return {
        eyebrow: "Finish your profile",
        title: nextStep.title,
        body: "A clearer profile gives invites and group suggestions a better first read.",
        primaryLabel: nextStep.label,
        secondaryLabel: "Open profile",
        signal,
      };
    case "personality":
      return {
        eyebrow: "Improve your fit",
        title: nextStep.title,
        body: "Personality signal helps TeamForge place you with groups that feel easier to join.",
        primaryLabel: nextStep.label,
        secondaryLabel: "Open profile",
        signal,
      };
    case "interests":
      return {
        eyebrow: "Tune your suggestions",
        title: nextStep.title,
        body: "Add a few interests so recommendations can lean toward plans you would actually show up for.",
        primaryLabel: nextStep.label,
        secondaryLabel: "Open profile",
        signal,
      };
  }
}
