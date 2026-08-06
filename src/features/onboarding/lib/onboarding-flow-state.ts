import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { normalizeRouteSearch } from "@/shared/lib/route-search";
import {
  type OnboardingReturnTarget,
  onboardingModeValues,
  onboardingReturnTargets,
} from "@/shared/navigation";
import {
  normalizeSettingsSection,
  settingsSectionValues,
} from "@/shared/navigation/settings-navigation";
import { type PersonalityType, personalityTypeSchema } from "@/shared/schemas";

const onboardingFlowParsers = {
  mode: parseAsStringLiteral(onboardingModeValues),
  returnTo: parseAsString,
  returnSearch: parseAsString,
  returnSection: parseAsStringLiteral(settingsSectionValues),
  returnGroupId: parseAsString,
  mbti: parseAsString,
};

export interface OnboardingReturnSearchParams {
  returnTo: OnboardingReturnTarget | null;
  returnSearch: string | null;
  returnSection: (typeof settingsSectionValues)[number] | null;
  returnGroupId?: string | null;
}

function isOnboardingReturnTarget(
  value: string,
): value is OnboardingReturnTarget {
  return onboardingReturnTargets.some((target) => target === value);
}

function isPersonalityType(value: string): value is PersonalityType {
  return personalityTypeSchema.safeParse(value).success;
}

function resolveOnboardingReturnTo(
  value: string | null | undefined,
): OnboardingReturnTarget | null {
  if (!value) {
    return null;
  }

  return isOnboardingReturnTarget(value) ? value : null;
}

export function buildOnboardingReturnSearch({
  returnTo,
  returnSearch,
  returnSection,
  returnGroupId,
}: OnboardingReturnSearchParams) {
  return {
    ...(returnTo ? { returnTo } : {}),
    ...(returnSearch ? { returnSearch } : {}),
    ...(returnSection ? { returnSection } : {}),
    ...(returnTo === "/groups/$groupId" && returnGroupId
      ? { returnGroupId }
      : {}),
  };
}

export function toOptionalOnboardingSearch<T extends Record<string, unknown>>(
  search: T,
) {
  return Object.keys(search).length > 0 ? search : undefined;
}

export function useOnboardingFlowState() {
  const [{ mode, returnTo, returnSearch, returnSection, returnGroupId, mbti }] =
    useQueryStates(onboardingFlowParsers, {
      history: "replace",
    });
  const resolvedReturnTo = resolveOnboardingReturnTo(returnTo);

  return {
    mode,
    isEditMode: mode === "edit",
    returnTo: resolvedReturnTo,
    returnSearch: normalizeRouteSearch(returnSearch),
    returnSection:
      resolvedReturnTo === "/settings"
        ? normalizeSettingsSection(returnSection)
        : null,
    returnGroupId:
      resolvedReturnTo === "/groups/$groupId" && returnGroupId?.trim()
        ? returnGroupId.trim()
        : null,
    mbti: mbti && isPersonalityType(mbti) ? mbti : null,
  };
}
