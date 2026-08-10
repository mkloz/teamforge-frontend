import { redirect } from "@tanstack/react-router";
import type { RouteGuardLocationLike } from "@/app/router/route-guards/types";
import {
  validateGroupPlanDetailSearch,
  validateUserDetailSearch,
} from "@/app/router/route-search-validators";
import { buildRouteLocationHref } from "@/shared/lib/auth-route";
import {
  getSearchRecord,
  validateExploreRouteSearch,
} from "@/shared/navigation";
import { validateActivityRouteSearch } from "@/shared/navigation/activity-navigation";
import { validateHomeRouteSearch } from "@/shared/navigation/home-navigation";
import { validatePlanCreationRouteSearch } from "@/shared/navigation/plan-creation-navigation";
import { validateSettingsRouteSearch } from "@/shared/navigation/settings-navigation";

type CanonicalSearchValidator = (search: Record<string, unknown>) => object;
type SerializableSearchValue = boolean | number | string;

const STATIC_CANONICAL_SEARCH_VALIDATORS: Record<
  string,
  CanonicalSearchValidator
> = {
  "/activity": validateActivityRouteSearch,
  "/explore": validateExploreRouteSearch,
  "/plans/new": validatePlanCreationRouteSearch,
  "/home": validateHomeRouteSearch,
  "/profile": () => ({}),
  "/settings": validateSettingsRouteSearch,
};

const DYNAMIC_CANONICAL_SEARCH_VALIDATORS = [
  {
    prefix: "/groups/",
    validate: validateGroupPlanDetailSearch,
  },
  {
    prefix: "/users/",
    validate: validateUserDetailSearch,
  },
] as const;

export function buildGuardReturnHref(
  location: RouteGuardLocationLike | undefined,
) {
  if (!location) {
    return null;
  }

  return buildCanonicalRouteHref(location) ?? buildRouteLocationHref(location);
}

export function redirectToCanonicalRouteHref(location: RouteGuardLocationLike) {
  const canonicalHref = buildCanonicalRouteHref(location);
  const currentHref = buildRouteLocationHref(location);
  const canonicalSearchStr = canonicalHref?.slice(location.pathname.length);

  if (
    !canonicalHref ||
    canonicalHref === currentHref ||
    hasEquivalentSearchParams(canonicalSearchStr, location.searchStr)
  ) {
    return;
  }

  throw redirect({
    href: canonicalHref,
    replace: true,
  });
}

function parseReturnSearch(searchStr: string | null | undefined) {
  return getSearchRecord(createSearchParams(searchStr));
}

function createSearchParams(searchStr: string | null | undefined) {
  return new URLSearchParams(
    searchStr?.startsWith("?") ? searchStr.slice(1) : (searchStr ?? ""),
  );
}

function isSearchValueOmitted(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === false ||
    value === ""
  ) {
    return true;
  }

  return false;
}

function isSerializableSearchValue(
  value: unknown,
): value is SerializableSearchValue {
  return (
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  );
}

function isSerializableArrayItem(value: unknown): value is number | string {
  return (
    (typeof value === "number" || typeof value === "string") && value !== ""
  );
}

function getCanonicalArraySearchValue(value: unknown[]) {
  const items = value.filter(isSerializableArrayItem);

  if (items.length === 0) {
    return null;
  }

  return items.every((item) => typeof item === "number")
    ? items.join("-")
    : items.join(",");
}

function getCanonicalSearchParamValue(value: unknown) {
  if (isSearchValueOmitted(value)) {
    return null;
  }

  if (Array.isArray(value)) {
    return getCanonicalArraySearchValue(value);
  }

  return isSerializableSearchValue(value) ? String(value) : null;
}

function serializeCanonicalSearchValue(
  params: URLSearchParams,
  key: string,
  value: unknown,
) {
  const serializedValue = getCanonicalSearchParamValue(value);

  if (serializedValue !== null) {
    params.set(key, serializedValue);
  }
}

function serializeCanonicalSearch(search: object) {
  const params = new URLSearchParams();

  Object.entries(search).forEach(([key, value]) => {
    serializeCanonicalSearchValue(params, key, value);
  });

  const serialized = params.toString();

  return serialized.length > 0 ? `?${serialized}` : "";
}

function normalizeSearchEntries(searchStr: string | null | undefined) {
  const params = createSearchParams(searchStr);

  return Array.from(params.entries()).sort(
    ([leftKey, leftValue], [rightKey, rightValue]) =>
      leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue),
  );
}

function hasEquivalentSearchParams(
  leftSearchStr: string | null | undefined,
  rightSearchStr: string | null | undefined,
) {
  const leftEntries = normalizeSearchEntries(leftSearchStr);
  const rightEntries = normalizeSearchEntries(rightSearchStr);

  if (leftEntries.length !== rightEntries.length) {
    return false;
  }

  return leftEntries.every(([leftKey, leftValue], index) => {
    const [rightKey, rightValue] = rightEntries[index] ?? [];

    return leftKey === rightKey && leftValue === rightValue;
  });
}

function parseTrueSearchFlag(value: unknown) {
  return value === true || value === "true" ? true : undefined;
}

function validateGlobalAppRouteSearch(search: Record<string, unknown>) {
  return {
    notifications: parseTrueSearchFlag(search.notifications),
  };
}

function isSingleSegmentRouteParam(pathname: string, prefix: string) {
  if (!pathname.startsWith(prefix)) {
    return false;
  }

  const value = pathname.slice(prefix.length);

  return value.length > 0 && !value.includes("/");
}

function getCanonicalRouteSearch(
  pathname: string,
  search: Record<string, unknown>,
): object | null {
  const staticValidator = STATIC_CANONICAL_SEARCH_VALIDATORS[pathname];

  if (staticValidator) {
    return staticValidator(search);
  }

  const dynamicValidator = DYNAMIC_CANONICAL_SEARCH_VALIDATORS.find((route) =>
    isSingleSegmentRouteParam(pathname, route.prefix),
  );

  return dynamicValidator ? dynamicValidator.validate(search) : null;
}

function buildCanonicalRouteHref(location: RouteGuardLocationLike) {
  const rawSearch = parseReturnSearch(location.searchStr);
  const canonicalSearch = getCanonicalRouteSearch(location.pathname, rawSearch);

  if (canonicalSearch === null) {
    return null;
  }

  return `${location.pathname}${serializeCanonicalSearch({
    ...canonicalSearch,
    ...validateGlobalAppRouteSearch(rawSearch),
  })}`;
}
