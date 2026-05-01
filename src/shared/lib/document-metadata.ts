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
  const previousTitle = document.title;
  const snapshots = metadata.meta?.map(applyMetaDescriptor) ?? [];

  document.title = metadata.title;

  return () => {
    document.title = previousTitle;

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
