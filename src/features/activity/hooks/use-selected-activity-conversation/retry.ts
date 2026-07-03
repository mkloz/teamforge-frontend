import type { ActivitySelectionKind } from "@/features/activity/store/activity-store/activity-store.types";

export async function retrySelectedConversationQuery({
  directRefetch,
  groupRefetch,
  selectedKind,
}: {
  directRefetch: () => Promise<unknown>;
  groupRefetch: () => Promise<unknown>;
  selectedKind: ActivitySelectionKind | null;
}) {
  if (selectedKind === "group") {
    await groupRefetch();
    return;
  }

  if (selectedKind === "dm") {
    await directRefetch();
  }
}
