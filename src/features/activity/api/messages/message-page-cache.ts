import type { ActivityMessagesPageData } from "./message-cache-types";
import { DEFAULT_ACTIVITY_MESSAGE_LIMIT } from "./message-cache-types";

export function emptyMessagesPage(): ActivityMessagesPageData {
  return {
    items: [],
    meta: {
      totalItemsCount: 0,
      itemsPerPage: DEFAULT_ACTIVITY_MESSAGE_LIMIT,
      currentPage: 1,
      totalPages: 1,
    },
  };
}

export function dedupeMessagePages(pages: ActivityMessagesPageData[]) {
  const seen = new Set<string>();

  return pages.map((page) => {
    const dedupedItems = page.items.filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }

      seen.add(item.id);
      return true;
    });
    const removedCount = page.items.length - dedupedItems.length;

    if (removedCount === 0) {
      return page;
    }

    return {
      ...page,
      items: dedupedItems,
      meta: {
        ...page.meta,
        totalItemsCount: Math.max(0, page.meta.totalItemsCount - removedCount),
      },
    };
  });
}
