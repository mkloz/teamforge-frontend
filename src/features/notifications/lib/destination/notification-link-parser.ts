import { extractProposalId } from "@/features/notifications/lib/notification-intent";
import type { ParsedNotificationLink } from "./notification-destination.types";

export function parseNotificationLink(link: string | null) {
  if (!link) {
    return null;
  }

  return (
    parseAbsoluteNotificationLink(link) ?? parseRelativeNotificationLink(link)
  );
}

function parseAbsoluteNotificationLink(
  link: string,
): ParsedNotificationLink | null {
  try {
    const parsedUrl = new URL(link);

    return {
      pathname: parsedUrl.pathname,
      searchParams: parsedUrl.searchParams,
    } satisfies ParsedNotificationLink;
  } catch {
    return null;
  }
}

function parseRelativeNotificationLink(
  link: string,
): ParsedNotificationLink | null {
  if (!isRelativeAppLink(link)) {
    return null;
  }

  const { pathname, search } = splitRelativeNotificationLink(link);

  return {
    pathname,
    searchParams: new URLSearchParams(search),
  } satisfies ParsedNotificationLink;
}

function isRelativeAppLink(link: string) {
  return link.startsWith("/") && !link.startsWith("//");
}

function splitRelativeNotificationLink(link: string) {
  const linkWithoutHash = stripNotificationLinkHash(link);
  const { pathname, search } = splitNotificationPathAndSearch(linkWithoutHash);

  return {
    pathname: pathname || "/",
    search,
  };
}

function stripNotificationLinkHash(link: string) {
  const hashIndex = link.indexOf("#");

  return hashIndex >= 0 ? link.slice(0, hashIndex) : link;
}

function splitNotificationPathAndSearch(link: string) {
  const searchIndex = link.indexOf("?");

  return {
    pathname: searchIndex >= 0 ? link.slice(0, searchIndex) : link,
    search: searchIndex >= 0 ? link.slice(searchIndex + 1) : "",
  };
}

export function normalizeNotificationPathname(pathname: string) {
  return pathname.replace(/^\/api(?:\/v\d+)?(?=\/)/, "");
}

export function extractProposalIdFromLink(link: string | null) {
  const parsedLink = parseNotificationLink(link);

  if (!parsedLink) {
    return undefined;
  }

  const proposalId = extractProposalId(parsedLink.searchParams);

  return proposalId ?? undefined;
}

export function extractPlanId(searchParams: URLSearchParams) {
  return getFirstSearchParam(searchParams, ["plan", "planId", "currentPlanId"]);
}

export function extractMessageId(searchParams: URLSearchParams) {
  return getFirstSearchParam(searchParams, ["message", "messageId"]);
}

export function extractChatId(searchParams: URLSearchParams) {
  return getFirstSearchParam(searchParams, ["chat", "chatId"]);
}

export function extractGroupId(searchParams: URLSearchParams) {
  return getFirstSearchParam(searchParams, ["group", "groupId"]);
}

export function findLiteral<T extends readonly string[]>(
  values: T,
  value: string | null,
): T[number] | undefined {
  return values.find((candidate) => candidate === value);
}

export function getFirstSearchParam(
  searchParams: URLSearchParams,
  keys: readonly string[],
) {
  for (const key of keys) {
    const value = searchParams.get(key);

    if (value) {
      return value;
    }
  }

  return undefined;
}
