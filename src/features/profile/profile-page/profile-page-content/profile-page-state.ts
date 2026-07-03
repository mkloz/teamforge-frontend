import {
  getUserArchetype,
  getUserDimensionScores,
} from "@/features/profile/lib/profile-utils";
import { getCurrentBrowserOrigin } from "@/shared/lib/browser-capabilities";
import { getUserOceanScores } from "@/shared/lib/user-psychometrics";
import { buildPublicProfilePath } from "@/shared/navigation/profile-navigation";
import type { User } from "@/shared/schemas";

export function buildProfileCoreModel(profile: User) {
  return {
    archetype: getUserArchetype(profile),
    dimensionScores: getUserDimensionScores(profile),
    oceanScores: getUserOceanScores(profile),
  };
}

export function getShouldShowUserMenu(
  showUserMenu: boolean | undefined,
  mode: "self" | "public",
) {
  return showUserMenu ?? mode === "self";
}

export function getProfileQrUrl(profileId: User["id"]) {
  return `${getCurrentBrowserOrigin()}${buildPublicProfilePath(profileId, {
    intent: "connect",
  })}`;
}

export function getProfileQrHandle(name: User["name"]) {
  return `@${name.replace(/\s/g, "").toLowerCase()}`;
}

export function getCompactSocialRead(value: string) {
  const [sentence] = value.match(/[^.!?]+[.!?]+/g) ?? [value];

  return sentence.trim();
}
