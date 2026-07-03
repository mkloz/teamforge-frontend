import { useEffect } from "react";

import {
  getBrowserDocumentBody,
  getBrowserElementById,
  getBrowserWindow,
} from "@/shared/lib/browser-environment";

interface LandingSectionItem<TId extends string> {
  id: TId;
}

interface ObservedLandingSectionOptions<TId extends string> {
  enabled?: boolean;
  isSectionId: (id: string) => id is TId;
  onActiveSectionChange: (id: TId) => void;
  sections: readonly LandingSectionItem<TId>[];
}

export function useObservedLandingSection<TId extends string>({
  enabled = true,
  isSectionId,
  onActiveSectionChange,
  sections,
}: ObservedLandingSectionOptions<TId>) {
  useEffect(() => {
    const browserWindow = getBrowserWindow();

    if (!enabled || !browserWindow?.IntersectionObserver) {
      return undefined;
    }

    const observer = new browserWindow.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && isSectionId(entry.target.id)) {
            onActiveSectionChange(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      },
    );

    const observedSectionIds = new Set<TId>();

    function observeLandingSections() {
      sections.forEach((section) => {
        if (observedSectionIds.has(section.id)) {
          return;
        }

        const element = getBrowserElementById(section.id);

        if (!element) {
          return;
        }

        observer.observe(element);
        observedSectionIds.add(section.id);
      });
    }

    observeLandingSections();

    const mutationObserver = browserWindow.MutationObserver
      ? new browserWindow.MutationObserver(observeLandingSections)
      : null;
    const body = getBrowserDocumentBody();

    if (body) {
      mutationObserver?.observe(body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      mutationObserver?.disconnect();
      observer.disconnect();
    };
  }, [enabled, isSectionId, onActiveSectionChange, sections]);
}
