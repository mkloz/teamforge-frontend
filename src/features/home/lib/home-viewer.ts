import type { HomeViewer } from "@/features/home/lib/home-contract";
import type { User } from "@/shared/schemas";

function hasCompleteOceanProfile(user: User) {
  return (
    user.oceanO !== null &&
    user.oceanC !== null &&
    user.oceanE !== null &&
    user.oceanA !== null &&
    user.oceanN !== null
  );
}

export function getHomeViewer(user?: User | null): HomeViewer {
  const nextStep = user
    ? !user.emailVerified
      ? {
          kind: "security" as const,
          title: "Secure your account",
          body: "Check your verification and recovery settings before you start building new groups.",
          label: "Open security",
        }
      : !user.bio || !user.city || user.age === null
        ? {
            kind: "account" as const,
            title: "Finish your public profile",
            body: "Add the missing basics people rely on when they open your profile.",
            label: "Complete profile",
          }
        : !user.personalityType || !hasCompleteOceanProfile(user)
          ? {
              kind: "personality" as const,
              title: "Complete your personality profile",
              body: "Your forge results get sharper once your personality data is fully calibrated.",
              label: "Update personality",
            }
          : !(user.interests?.length ?? 0)
            ? {
                kind: "interests" as const,
                title: "Add your interests",
                body: "Interests help TeamForge connect you with groups that actually fit your energy.",
                label: "Choose interests",
              }
            : null
    : null;

  return {
    firstName: user?.name.trim().split(/\s+/)[0] ?? "there",
    mbti: user?.personalityType ?? null,
    nextStep,
  };
}
