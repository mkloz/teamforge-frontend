import { z } from "zod";

import type { RouteGuardLocationLike } from "@/app/router/route-guards/types";
import {
  getBrowserSessionStorageItem,
  removeBrowserSessionStorageItem,
  setBrowserSessionStorageItem,
} from "@/shared/lib/browser-environment/session-storage";
import {
  buildInterestsContinuationNavigation,
  buildPersonalityContinuationNavigation,
  buildPersonalityEditNavigation,
  buildProfileBasicsContinuationNavigation,
  type OnboardingEditOptions,
} from "@/shared/navigation";
import type {
  ProductCapability,
  ProductCapabilityReason,
} from "@/shared/schemas/onboarding-product-state";
import {
  capabilityReasonValues,
  productCapabilityValues,
} from "@/shared/schemas/onboarding-product-state";

const CAPABILITY_DENIAL_SESSION_KEY = "teamforge:capability-denial:v1";

export interface CapabilityDenialNotice {
  capability: ProductCapability;
  reasonCode: ProductCapabilityReason;
}

const capabilityDenialNoticeSchema = z.object({
  capability: z.enum(productCapabilityValues),
  reasonCode: z.enum(capabilityReasonValues),
});

export function writeCapabilityDenialNotice(notice: CapabilityDenialNotice) {
  setBrowserSessionStorageItem(
    CAPABILITY_DENIAL_SESSION_KEY,
    JSON.stringify(notice),
  );
}

export function consumeCapabilityDenialNotice() {
  const raw = getBrowserSessionStorageItem(CAPABILITY_DENIAL_SESSION_KEY);
  removeBrowserSessionStorageItem(CAPABILITY_DENIAL_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = capabilityDenialNoticeSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    // Malformed one-time notices are discarded instead of interrupting routing.
    return null;
  }
}

export function getCapabilityDenialNavigation({
  location,
  reasonCode,
  safeDestination,
}: {
  location: RouteGuardLocationLike;
  reasonCode: ProductCapabilityReason;
  safeDestination: string;
}) {
  const returnOptions = getReturnOptions(location);

  if (reasonCode === "PROFILE_BASICS_REQUIRED" && returnOptions) {
    return buildProfileBasicsContinuationNavigation(returnOptions);
  }
  if (reasonCode === "INTERESTS_REQUIRED" && returnOptions) {
    return buildInterestsContinuationNavigation(returnOptions);
  }
  if (reasonCode === "STARTER_REQUIRED" && returnOptions) {
    return buildPersonalityContinuationNavigation(returnOptions);
  }
  if (
    returnOptions &&
    [
      "FULL_ASSESSMENT_REQUIRED",
      "ASSESSMENT_OUTDATED",
      "COMPATIBILITY_NOT_ELIGIBLE",
    ].includes(reasonCode)
  ) {
    return buildPersonalityEditNavigation(returnOptions);
  }

  return { to: safeDestination };
}

export function getCapabilityDenialHref(
  input: Parameters<typeof getCapabilityDenialNavigation>[0],
) {
  const navigation = getCapabilityDenialNavigation(input);
  if (!("search" in navigation)) return navigation.to;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(navigation.search)) {
    if (value !== undefined) search.set(key, value);
  }
  const serialized = search.toString();
  return serialized ? `${navigation.to}?${serialized}` : navigation.to;
}

export function getCapabilityDenialCopy(notice: CapabilityDenialNotice) {
  const action = capabilityActionLabels[notice.capability];
  const reason = denialReasonCopy[notice.reasonCode];
  return {
    title: `${reason.title} before you ${action}`,
    description: `${reason.description} We’ll bring you back to what you were doing when it is ready.`,
  };
}

function getReturnOptions(
  location: RouteGuardLocationLike,
): Omit<OnboardingEditOptions, "mbti"> | null {
  const returnSearch = location.searchStr.replace(/^\?/u, "") || null;

  if (location.pathname === "/forge") {
    return { returnTo: "/forge", returnSearch };
  }
  switch (location.pathname) {
    case "/home":
    case "/explore":
    case "/activity":
    case "/profile":
    case "/settings":
    case "/invite":
      return { returnTo: location.pathname, returnSearch };
  }
  const groupId = location.pathname.match(/^\/groups\/([^/]+)$/u)?.[1];
  return groupId
    ? { returnTo: "/groups/$groupId", returnGroupId: groupId, returnSearch }
    : null;
}

const capabilityActionLabels: Record<ProductCapability, string> = {
  BROWSE_PUBLIC_CONTENT: "browse",
  VIEW_PUBLIC_GROUP_PLAN: "view this group",
  VIEW_PUBLIC_PROFILE: "view this profile",
  EDIT_OWN_PROFILE: "edit your profile",
  USE_ONBOARDING_PRACTICE: "open practice",
  CREATE_ACTIVITY: "create an activity",
  CREATE_PLAN: "create a plan",
  REQUEST_PLACE: "request a place",
  ACCEPT_GROUP_INVITE: "accept this invitation",
  ACCEPT_PLAN_SEAT: "accept this place",
  START_FRIENDSHIP: "connect with someone",
  ACCEPT_FRIEND_REQUEST: "accept this request",
  SEND_DIRECT_INVITATION: "send an invitation",
  RECEIVE_DIRECT_INVITATION: "receive invitations",
  CREATE_GROUP: "create a group",
  START_FORGE: "use Forge",
  START_INTRODUCTORY_FORGE: "create an introductory plan",
  RECEIVE_PROPOSAL: "receive proposals",
  START_DIRECT_CHAT: "start a chat",
  START_GROUP_CHAT: "open group chat",
  PUBLISH_PERSONALITY: "publish your result",
};

const denialReasonCopy: Record<
  ProductCapabilityReason,
  { title: string; description: string }
> = {
  PROFILE_BASICS_REQUIRED: {
    title: "Add your profile basics",
    description: "TeamForge needs the minimum identity details first.",
  },
  INTERESTS_REQUIRED: {
    title: "Choose a few interests",
    description: "This gives TeamForge enough context for relevant activities.",
  },
  STARTER_REQUIRED: {
    title: "Complete the starting questions",
    description: "Your assigned onboarding path needs this short step first.",
  },
  FULL_ASSESSMENT_REQUIRED: {
    title: "Finish your matching assessment",
    description: "This action depends on a current compatibility profile.",
  },
  ASSESSMENT_OUTDATED: {
    title: "Refresh your matching assessment",
    description:
      "Your previous result is no longer current enough for matching.",
  },
  COMPATIBILITY_NOT_ELIGIBLE: {
    title: "Complete an eligible assessment",
    description: "The existing result cannot authorize compatibility matching.",
  },
  FEATURE_NOT_AVAILABLE: {
    title: "This feature is not available yet",
    description:
      "Your current onboarding treatment does not include this action.",
  },
  RELATIONSHIP_REQUIRED: {
    title: "An existing relationship is required",
    description:
      "This action is available only for an existing group, plan or connection.",
  },
};
