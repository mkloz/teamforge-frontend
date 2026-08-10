import { getBrowserDocument } from "@/shared/lib/browser-environment";

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
  links?: LinkDescriptor[];
  jsonLd?: JsonLdDescriptor[];
}

export interface LinkDescriptor {
  rel: "canonical";
  href: string | null;
}

export interface JsonLdDescriptor {
  id: string;
  value: unknown;
}

interface MetadataSnapshot {
  element: HTMLMetaElement;
  previousContent: string | null;
  created: boolean;
}

interface LinkSnapshot {
  element: HTMLLinkElement;
  previousHref: string | null;
  created: boolean;
  removed: boolean;
}

interface JsonLdSnapshot {
  element: HTMLScriptElement;
  previousText: string;
  created: boolean;
  removed: boolean;
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

function findMetaElement(
  browserDocument: Document,
  descriptor: MetaDescriptor,
) {
  const [attributeName, attributeValue] =
    descriptor.name !== undefined
      ? (["name", descriptor.name] as const)
      : (["property", descriptor.property] as const);

  return Array.from(browserDocument.head.querySelectorAll("meta")).find(
    (element) => element.getAttribute(attributeName) === attributeValue,
  );
}

function applyMetaDescriptor(
  browserDocument: Document,
  descriptor: MetaDescriptor,
): MetadataSnapshot {
  const existingElement = findMetaElement(browserDocument, descriptor);
  const element = existingElement ?? browserDocument.createElement("meta");
  const [attributeName, attributeValue] =
    descriptor.name !== undefined
      ? (["name", descriptor.name] as const)
      : (["property", descriptor.property] as const);

  if (!existingElement) {
    element.setAttribute(attributeName, attributeValue);
    browserDocument.head.appendChild(element);
  }

  const snapshot = {
    element,
    previousContent: element.getAttribute("content"),
    created: !existingElement,
  };

  element.setAttribute("content", descriptor.content);

  return snapshot;
}

function applyLinkDescriptor(
  browserDocument: Document,
  descriptor: LinkDescriptor,
): LinkSnapshot | null {
  const existingElement = Array.from(
    browserDocument.head.querySelectorAll<HTMLLinkElement>("link[rel]"),
  ).find((element) => element.rel === descriptor.rel);

  if (descriptor.href === null) {
    if (!existingElement) return null;

    const snapshot = {
      element: existingElement,
      previousHref: existingElement.getAttribute("href"),
      created: false,
      removed: true,
    };
    existingElement.remove();
    return snapshot;
  }

  const element = existingElement ?? browserDocument.createElement("link");
  if (!existingElement) {
    element.rel = descriptor.rel;
    browserDocument.head.appendChild(element);
  }

  const snapshot = {
    element,
    previousHref: element.getAttribute("href"),
    created: !existingElement,
    removed: false,
  };
  element.href = descriptor.href;
  return snapshot;
}

function applyJsonLdDescriptor(
  browserDocument: Document,
  descriptor: JsonLdDescriptor,
): JsonLdSnapshot | null {
  const selector = `script[type="application/ld+json"][data-app-json-ld="${descriptor.id}"]`;
  const existingElement =
    browserDocument.head.querySelector<HTMLScriptElement>(selector);

  if (descriptor.value === null) {
    if (!existingElement) return null;

    const snapshot = {
      element: existingElement,
      previousText: existingElement.textContent ?? "",
      created: false,
      removed: true,
    };
    existingElement.remove();
    return snapshot;
  }

  const element = existingElement ?? browserDocument.createElement("script");
  if (!existingElement) {
    element.type = "application/ld+json";
    element.dataset.findafewJsonLd = descriptor.id;
    browserDocument.head.appendChild(element);
  }

  const snapshot = {
    element,
    previousText: element.textContent ?? "",
    created: !existingElement,
    removed: false,
  };
  element.textContent = JSON.stringify(descriptor.value).replaceAll(
    "<",
    "\\u003c",
  );
  return snapshot;
}

export function applyDocumentMetadata(metadata: PageMetadata) {
  const browserDocument = getBrowserDocument();

  if (!browserDocument) {
    return () => {};
  }

  const previousTitle = stripDocumentTitleBadge(browserDocument.title);
  const snapshots =
    metadata.meta?.map((descriptor) =>
      applyMetaDescriptor(browserDocument, descriptor),
    ) ?? [];
  const linkSnapshots =
    metadata.links
      ?.map((descriptor) => applyLinkDescriptor(browserDocument, descriptor))
      .filter((snapshot): snapshot is LinkSnapshot => snapshot !== null) ?? [];
  const jsonLdSnapshots =
    metadata.jsonLd
      ?.map((descriptor) => applyJsonLdDescriptor(browserDocument, descriptor))
      .filter((snapshot): snapshot is JsonLdSnapshot => snapshot !== null) ??
    [];

  browserDocument.title = formatDocumentTitle(metadata.title);

  return () => {
    browserDocument.title = formatDocumentTitle(previousTitle);

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

    linkSnapshots.forEach(({ element, previousHref, created, removed }) => {
      if (created) {
        element.remove();
        return;
      }

      if (removed) browserDocument.head.appendChild(element);

      if (previousHref === null) {
        element.removeAttribute("href");
        return;
      }

      element.setAttribute("href", previousHref);
    });

    jsonLdSnapshots.forEach(({ element, previousText, created, removed }) => {
      if (created) {
        element.remove();
        return;
      }

      if (removed) browserDocument.head.appendChild(element);
      element.textContent = previousText;
    });
  };
}

export function setDocumentTitleBadge(unreadCount: number) {
  const browserDocument = getBrowserDocument();

  if (!browserDocument) {
    return;
  }

  documentTitleBadgeCount = Math.max(0, Math.trunc(unreadCount));
  browserDocument.title = formatDocumentTitle(browserDocument.title);
}
