import type { ParsedNotificationLink } from "./notification-destination.types";

export function parseNotificationLink(link: string | null) {
  if (!link) {
    return null;
  }

  return parseRelativeNotificationLink(link);
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

export function extractProposalIdFromLink(link: string | null) {
  const parsedLink = parseNotificationLink(link);

  if (!parsedLink) {
    return undefined;
  }

  const proposalId = parsedLink.searchParams.get("proposal");

  return proposalId ?? undefined;
}

export function findLiteral<T extends readonly string[]>(
  values: T,
  value: string | null,
): T[number] | undefined {
  return values.find((candidate) => candidate === value);
}
