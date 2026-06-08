import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import {
  type OnboardingReturnTarget,
  onboardingModeValues,
  onboardingReturnTargets,
} from "@/features/onboarding/lib/onboarding-route";
import {
  normalizeSettingsSection,
  settingsSectionValues,
} from "@/features/settings/lib/settings-route";
import { type PersonalityType, personalityTypeSchema } from "@/shared/schemas";

const onboardingFlowParsers = {
  mode: parseAsStringLiteral(onboardingModeValues),
  returnTo: parseAsString,
  returnSearch: parseAsString,
  returnSection: parseAsStringLiteral(settingsSectionValues),
  mbti: parseAsString,
};

export interface OnboardingReturnSearchParams {
  returnTo: OnboardingReturnTarget | null;
  returnSearch: string | null;
  returnSection: (typeof settingsSectionValues)[number] | null;
}

function isOnboardingReturnTarget(
  value: string,
): value is OnboardingReturnTarget {
  return onboardingReturnTargets.some((target) => target === value);
}

function isPersonalityType(value: string): value is PersonalityType {
  return personalityTypeSchema.safeParse(value).success;
}

function normalizeFlowSearch(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = new URLSearchParams(
    value.startsWith("?") ? value.slice(1) : value,
  ).toString();

  return normalized.length > 0 ? normalized : null;
}

export function resolveOnboardingReturnTo(
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
}: OnboardingReturnSearchParams) {
  return {
    ...(returnTo ? { returnTo } : {}),
    ...(returnSearch ? { returnSearch } : {}),
    ...(returnSection ? { returnSection } : {}),
  };
}

export function toOptionalOnboardingSearch<T extends Record<string, unknown>>(
  search: T,
) {
  return Object.keys(search).length > 0 ? search : undefined;
}

export function parseOnboardingFlowSearch(searchString: string) {
  const params = new URLSearchParams(searchString);
  const mode = params.get("mode");
  const returnTo = resolveOnboardingReturnTo(params.get("returnTo"));
  const returnSearch = normalizeFlowSearch(params.get("returnSearch"));
  const returnSection = normalizeSettingsSection(params.get("returnSection"));
  const mbti = params.get("mbti");

  return {
    isEditMode: mode === "edit",
    returnTo,
    returnSearch,
    returnSection: returnTo === "/settings" ? returnSection : null,
    mbti: mbti && isPersonalityType(mbti) ? mbti : null,
  };
}

export function useOnboardingFlowState() {
  const [{ mode, returnTo, returnSearch, returnSection, mbti }] =
    useQueryStates(onboardingFlowParsers, {
      history: "replace",
    });

  return {
    mode,
    isEditMode: mode === "edit",
    returnTo: resolveOnboardingReturnTo(returnTo),
    returnSearch: normalizeFlowSearch(returnSearch),
    returnSection:
      resolveOnboardingReturnTo(returnTo) === "/settings"
        ? normalizeSettingsSection(returnSection)
        : null,
    mbti: mbti && isPersonalityType(mbti) ? mbti : null,
  };
}
