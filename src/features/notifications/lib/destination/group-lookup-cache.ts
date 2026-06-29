import { apiClient } from "@/shared/api/api";
import {
  createPaginatedSchema,
  type GroupApi,
  groupApiSchema,
} from "@/shared/schemas";

const paginatedGroupsSchema = createPaginatedSchema(groupApiSchema);
const GROUP_LOOKUP_PAGE_LIMIT = 100;
const MAX_GROUP_LOOKUP_PAGES = 10;
const planGroupCache = new Map<string, string>();
const chatGroupCache = new Map<string, string>();

export async function resolveGroupIdByPlanId(planId: string) {
  const cachedGroupId = planGroupCache.get(planId);

  if (cachedGroupId) {
    return cachedGroupId;
  }

  const groupId = await findGroupIdByPredicate(
    (group) => group.plan?.id === planId,
  );

  if (groupId) {
    planGroupCache.set(planId, groupId);
  }

  return groupId;
}

export async function resolveGroupIdByChatId(chatId: string) {
  const cachedGroupId = chatGroupCache.get(chatId);

  if (cachedGroupId) {
    return cachedGroupId;
  }

  const groupId = await findGroupIdByPredicate(
    (group) => group.chat?.id === chatId,
  );

  if (groupId) {
    chatGroupCache.set(chatId, groupId);
  }

  return groupId;
}

async function findGroupIdByPredicate(predicate: (group: GroupApi) => boolean) {
  try {
    return await findGroupIdAcrossLookupPages(predicate);
  } catch {
    return null;
  }
}

async function findGroupIdAcrossLookupPages(
  predicate: (group: GroupApi) => boolean,
) {
  const firstPage = await getGroupLookupPage(1);
  const firstPageGroupId = findGroupIdInLookupPage(firstPage.items, predicate);

  if (firstPageGroupId) {
    return firstPageGroupId;
  }

  return findGroupIdInRemainingLookupPages(firstPage, predicate);
}

async function findGroupIdInRemainingLookupPages(
  firstPage: Awaited<ReturnType<typeof getGroupLookupPage>>,
  predicate: (group: GroupApi) => boolean,
) {
  const totalPages = Math.min(
    MAX_GROUP_LOOKUP_PAGES,
    firstPage.meta.totalPages,
  );

  if (!shouldReadRemainingGroupLookupPages(firstPage, totalPages)) {
    return null;
  }

  const remainingPages = getRemainingGroupLookupPages(totalPages);
  const remainingResults = await Promise.all(
    remainingPages.map((page) => getGroupLookupPage(page)),
  );

  return findGroupIdInLookupResults(remainingResults, predicate);
}

function shouldReadRemainingGroupLookupPages(
  firstPage: Awaited<ReturnType<typeof getGroupLookupPage>>,
  totalPages: number,
) {
  return firstPage.items.length > 0 && totalPages > 1;
}

function findGroupIdInLookupResults(
  results: Awaited<ReturnType<typeof getGroupLookupPage>>[],
  predicate: (group: GroupApi) => boolean,
) {
  for (const result of results) {
    const groupId = findGroupIdInLookupPage(result.items, predicate);

    if (groupId) {
      return groupId;
    }
  }

  return null;
}

function findGroupIdInLookupPage(
  groups: GroupApi[],
  predicate: (group: GroupApi) => boolean,
) {
  return groups.find(predicate)?.id;
}

function getRemainingGroupLookupPages(totalPages: number) {
  return Array.from({ length: totalPages - 1 }, (_, index) => index + 2);
}

async function getGroupLookupPage(page: number) {
  const response = await apiClient
    .get("groups", {
      searchParams: {
        limit: GROUP_LOOKUP_PAGE_LIMIT,
        page,
      },
    })
    .json<unknown>();

  return paginatedGroupsSchema.parse(response);
}
