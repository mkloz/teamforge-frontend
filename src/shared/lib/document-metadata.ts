import { hasBrowserDocument } from "@/shared/lib/browser-environment";

export type MetaDescriptor =
  | {
      name: string;
      content: string;
      property?: never;
    }
  | {
      property: string;
      content: string;
      name?: never;
    };

export interface PageMetadata {
  title: string;
  meta?: MetaDescriptor[];
}

interface MetadataSnapshot {
  element: HTMLMetaElement;
  previousContent: string | null;
  created: boolean;
}

const DOCUMENT_TITLE_BADGE_PATTERN = /^\((?:\d+|99\+)\)\s+/;
let documentTitleBadgeCount = 0;

function stripDocumentTitleBadge(title: string) {
  return title.replace(DOCUMENT_TITLE_BADGE_PATTERN, "");
}

function formatDocumentTitle(title: string) {
  const baseTitle = stripDocumentTitleBadge(title);

  if (documentTitleBadgeCount <= 0) {
    return baseTitle;
  }

  const badgeLabel =
    documentTitleBadgeCount > 99 ? "99+" : String(documentTitleBadgeCount);

  return `(${badgeLabel}) ${baseTitle}`;
}

function findMetaElement(descriptor: MetaDescriptor) {
  const [attributeName, attributeValue] =
    descriptor.name !== undefined
      ? (["name", descriptor.name] as const)
      : (["property", descriptor.property] as const);

  return Array.from(document.head.querySelectorAll("meta")).find(
    (element) => element.getAttribute(attributeName) === attributeValue,
  );
}

function applyMetaDescriptor(descriptor: MetaDescriptor): MetadataSnapshot {
  const existingElement = findMetaElement(descriptor);
  const element = existingElement ?? document.createElement("meta");
  const [attributeName, attributeValue] =
    descriptor.name !== undefined
      ? (["name", descriptor.name] as const)
      : (["property", descriptor.property] as const);

  if (!existingElement) {
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }

  const snapshot = {
    element,
    previousContent: element.getAttribute("content"),
    created: !existingElement,
  };

  element.setAttribute("content", descriptor.content);

  return snapshot;
}

export function applyDocumentMetadata(metadata: PageMetadata) {
  if (!hasBrowserDocument()) {
    return () => {};
  }

  const previousTitle = stripDocumentTitleBadge(document.title);
  const snapshots = metadata.meta?.map(applyMetaDescriptor) ?? [];

  document.title = formatDocumentTitle(metadata.title);

  return () => {
    document.title = formatDocumentTitle(previousTitle);

    snapshots.forEach(({ element, previousContent, created }) => {
      if (created) {
        element.remove();
        return;
      }

      if (previousContent === null) {
        element.removeAttribute("content");
        return;
      }

      element.setAttribute("content", previousContent);
    });
  };
}

export function setDocumentTitleBadge(unreadCount: number) {
  if (!hasBrowserDocument()) {
    return;
  }

  documentTitleBadgeCount = Math.max(0, Math.trunc(unreadCount));
  document.title = formatDocumentTitle(document.title);
}
