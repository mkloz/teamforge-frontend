import {
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  LockKeyhole,
  type LucideIcon,
  MapPin,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { AvatarWithBadge } from "@/shared/components/common/avatar-with-badge";
import { Button } from "@/shared/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";
import { getInviteMemberLabel } from "./attention-queue-formatters";
import {
  type AttentionQueueCompactModel,
  type AttentionQueueUrgency,
  getAttentionQueueCompactModel,
} from "./attention-queue-item-model";
import type { AttentionQueueRenderItem } from "./attention-queue-render-state";
import { SeeRestButton } from "./see-rest-button";

type VisibleAttentionQueueItem = Exclude<
  AttentionQueueRenderItem,
  { kind: "see-rest" }
>;

interface AttentionQueueGroupedListProps {
  batchAcceptDisabled: boolean;
  batchAcceptLoading: boolean;
  batchDeclineDisabled: boolean;
  batchDeclineLoading: boolean;
  focusedItemKey: string | null;
  items: AttentionQueueRenderItem[];
  onBatchAccept: (items: VisibleAttentionQueueItem[]) => Promise<boolean>;
  onBatchDecline: (items: VisibleAttentionQueueItem[]) => Promise<boolean>;
  renderDetail: (item: VisibleAttentionQueueItem) => ReactNode;
  urgencyCounts: Record<AttentionQueueUrgency, number>;
}

interface UrgencyGroupModel {
  icon: LucideIcon;
  label: string;
  tone: "amber" | "muted" | "teal";
  urgency: AttentionQueueUrgency;
}

const URGENCY_GROUPS: UrgencyGroupModel[] = [
  { icon: Clock3, label: "Now", tone: "teal", urgency: "now" },
  { icon: Clock3, label: "Soon", tone: "amber", urgency: "soon" },
  { icon: Circle, label: "Later", tone: "muted", urgency: "later" },
];

export function AttentionQueueGroupedList({
  batchAcceptDisabled,
  batchAcceptLoading,
  batchDeclineDisabled,
  batchDeclineLoading,
  focusedItemKey,
  items,
  onBatchAccept,
  onBatchDecline,
  renderDetail,
  urgencyCounts,
}: AttentionQueueGroupedListProps) {
  const visibleItems = items.filter(isVisibleQueueItem);
  const seeRestItem = items.find((item) => item.kind === "see-rest");
  const [activeItemKey, setActiveItemKey] = useState<string | null>(
    focusedItemKey,
  );
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [openGroups, setOpenGroups] = useState<
    Record<AttentionQueueUrgency, boolean>
  >(() => ({
    later: urgencyCounts.now === 0 && urgencyCounts.soon === 0,
    now: urgencyCounts.now > 0,
    soon: urgencyCounts.now === 0 && urgencyCounts.soon > 0,
  }));

  const compactItems = useMemo(
    () =>
      visibleItems.map((item) => ({
        item,
        model: getAttentionQueueCompactModel(item),
      })),
    [visibleItems],
  );

  useEffect(() => {
    const visibleKeys = new Set(compactItems.map(({ model }) => model.key));

    setSelectedKeys((current) => {
      const next = new Set([...current].filter((key) => visibleKeys.has(key)));

      return next.size === current.size ? current : next;
    });

    if (activeItemKey && !visibleKeys.has(activeItemKey)) {
      setActiveItemKey(null);
    }
  }, [activeItemKey, compactItems]);

  useEffect(() => {
    if (!focusedItemKey) {
      return;
    }

    const focusedEntry = compactItems.find(
      ({ model }) => model.key === focusedItemKey,
    );

    if (!focusedEntry) {
      return;
    }

    setActiveItemKey(focusedItemKey);
    setOpenGroups((current) =>
      current[focusedEntry.model.urgency]
        ? current
        : {
            ...current,
            [focusedEntry.model.urgency]: true,
          },
    );
  }, [compactItems, focusedItemKey]);

  return (
    <>
      <div className="mt-4 grid min-w-0 gap-2.5">
        {URGENCY_GROUPS.map((group) => {
          const groupItems = compactItems.filter(
            ({ model }) => model.urgency === group.urgency,
          );

          if (urgencyCounts[group.urgency] === 0 || groupItems.length === 0) {
            return null;
          }

          return (
            <UrgencyGroup
              key={group.urgency}
              activeItemKey={activeItemKey}
              batchAcceptDisabled={batchAcceptDisabled}
              batchAcceptLoading={batchAcceptLoading}
              batchDeclineDisabled={batchDeclineDisabled}
              batchDeclineLoading={batchDeclineLoading}
              group={group}
              isOpen={openGroups[group.urgency]}
              items={groupItems}
              onActiveItemChange={setActiveItemKey}
              onBatchAccept={onBatchAccept}
              onBatchDecline={onBatchDecline}
              onOpenChange={(isOpen) =>
                setOpenGroups((current) => ({
                  ...current,
                  [group.urgency]: isOpen,
                }))
              }
              onSelectionChange={(key) =>
                setSelectedKeys((current) => toggleSetValue(current, key))
              }
              renderDetail={renderDetail}
              selectedKeys={selectedKeys}
              totalCount={urgencyCounts[group.urgency]}
            />
          );
        })}
      </div>

      {seeRestItem?.kind === "see-rest" ? (
        <ul className="mt-2 list-none p-0">
          <SeeRestButton hiddenItemCount={seeRestItem.hiddenItemCount} />
        </ul>
      ) : null}
    </>
  );
}

function UrgencyGroup({
  activeItemKey,
  batchAcceptDisabled,
  batchAcceptLoading,
  batchDeclineDisabled,
  batchDeclineLoading,
  group,
  isOpen,
  items,
  onActiveItemChange,
  onBatchAccept,
  onBatchDecline,
  onOpenChange,
  onSelectionChange,
  renderDetail,
  selectedKeys,
  totalCount,
}: {
  activeItemKey: string | null;
  batchAcceptDisabled: boolean;
  batchAcceptLoading: boolean;
  batchDeclineDisabled: boolean;
  batchDeclineLoading: boolean;
  group: UrgencyGroupModel;
  isOpen: boolean;
  items: Array<{
    item: VisibleAttentionQueueItem;
    model: AttentionQueueCompactModel;
  }>;
  onActiveItemChange: (key: string | null) => void;
  onBatchAccept: (items: VisibleAttentionQueueItem[]) => Promise<boolean>;
  onBatchDecline: (items: VisibleAttentionQueueItem[]) => Promise<boolean>;
  onOpenChange: (isOpen: boolean) => void;
  onSelectionChange: (key: string) => void;
  renderDetail: (item: VisibleAttentionQueueItem) => ReactNode;
  selectedKeys: Set<string>;
  totalCount: number;
}) {
  const batchableItems = items.filter(({ model }) => model.batchable);
  const selectedBatchableItems = batchableItems.filter(({ model }) =>
    selectedKeys.has(model.key),
  );

  function selectGroupItems() {
    for (const { model } of batchableItems) {
      if (!selectedKeys.has(model.key)) {
        onSelectionChange(model.key);
      }
    }
  }

  function clearGroupSelection() {
    for (const { model } of selectedBatchableItems) {
      onSelectionChange(model.key);
    }
  }

  async function acceptGroupSelection() {
    const acceptedAll = await onBatchAccept(
      selectedBatchableItems.map(({ item }) => item),
    );

    if (acceptedAll) {
      clearGroupSelection();
    }
  }

  async function declineGroupSelection() {
    const declinedAll = await onBatchDecline(
      selectedBatchableItems.map(({ item }) => item),
    );

    if (declinedAll) {
      clearGroupSelection();
    }
  }

  const isBatchActionLoading = batchAcceptLoading || batchDeclineLoading;

  return (
    <Collapsible asChild open={isOpen} onOpenChange={onOpenChange}>
      <GroupedMenuList>
        <GroupedMenuItem>
          <div className="flex min-w-0 items-center gap-2 px-3 py-2.5 sm:px-4">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-2 font-bold text-sm",
                    group.tone === "teal" && "text-forge-teal",
                    group.tone === "amber" && "text-spark-amber",
                    group.tone === "muted" && "text-muted-foreground",
                  )}
                >
                  <UrgencyIcon group={group} />
                  {group.label}
                </span>
                <span className="font-semibold text-muted-foreground text-xs">
                  {totalCount}
                </span>
                <ChevronDown
                  className={cn(
                    "ml-auto size-4 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>
            </CollapsibleTrigger>

            {selectedBatchableItems.length > 0 ? (
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="xs"
                  disabled={batchAcceptDisabled}
                  loading={batchAcceptLoading}
                  onClick={() => void acceptGroupSelection()}
                  className="size-8 px-0 sm:w-auto sm:px-3"
                  aria-label={`Accept ${selectedBatchableItems.length} selected`}
                >
                  <Check className="size-3.5" />
                  <span className="sr-only sm:not-sr-only">
                    Accept {selectedBatchableItems.length}
                  </span>
                </Button>
                <Button
                  size="xs"
                  variant="destructive"
                  disabled={batchDeclineDisabled}
                  loading={batchDeclineLoading}
                  onClick={() => void declineGroupSelection()}
                  className="size-8 px-0 sm:w-auto sm:px-3"
                  aria-label={`Decline ${selectedBatchableItems.length} selected`}
                >
                  <X className="size-3.5" />
                  <span className="sr-only sm:not-sr-only">
                    Decline {selectedBatchableItems.length}
                  </span>
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  className="h-8 px-2.5"
                  disabled={isBatchActionLoading}
                  onClick={clearGroupSelection}
                >
                  Clear
                </Button>
              </div>
            ) : batchableItems.length > 1 ? (
              <button
                type="button"
                onClick={selectGroupItems}
                className="rounded-full px-2 py-1 font-semibold text-muted-foreground text-xs transition-colors hover:text-forge-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Select
              </button>
            ) : null}
          </div>
        </GroupedMenuItem>

        <CollapsibleContent asChild>
          <li className="overflow-hidden rounded-b-2xl">
            <GroupedMenuList
              aria-label={`${group.label} attention items`}
              className="rounded-none [&>li:first-child]:rounded-t-none"
            >
              {items.map(({ item, model }) => (
                <AttentionQueueCompactRow
                  key={model.key}
                  active={activeItemKey === model.key}
                  item={item}
                  model={model}
                  onActivate={() =>
                    onActiveItemChange(
                      activeItemKey === model.key ? null : model.key,
                    )
                  }
                  onSelectionChange={() => onSelectionChange(model.key)}
                  renderDetail={renderDetail}
                  selected={selectedKeys.has(model.key)}
                />
              ))}
            </GroupedMenuList>
          </li>
        </CollapsibleContent>
      </GroupedMenuList>
    </Collapsible>
  );
}

function AttentionQueueCompactRow({
  active,
  item,
  model,
  onActivate,
  onSelectionChange,
  renderDetail,
  selected,
}: {
  active: boolean;
  item: VisibleAttentionQueueItem;
  model: AttentionQueueCompactModel;
  onActivate: () => void;
  onSelectionChange: () => void;
  renderDetail: (item: VisibleAttentionQueueItem) => ReactNode;
  selected: boolean;
}) {
  const expandedContext = getExpandedContext(item);
  const ExpandedContextIcon = expandedContext.icon;

  return (
    <Collapsible asChild open={active}>
      <GroupedMenuItem
        className={cn(
          "relative min-w-0",
          active && "bg-(--grouped-menu-selected)",
          selected &&
            "before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-forge-teal",
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5 px-3 py-2.5 sm:px-4">
          {model.batchable ? (
            <label
              className={cn(
                "relative inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring",
                selected
                  ? "border-forge-teal bg-forge-teal text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-forge-teal/50 hover:text-forge-teal",
              )}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={onSelectionChange}
                aria-label={`${selected ? "Deselect" : "Select"} ${model.title}`}
                className="sr-only"
              />
              {selected ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <span className="size-2 rounded-full bg-current opacity-45" />
              )}
            </label>
          ) : null}

          <CompactVisual model={model} />

          <button
            type="button"
            onClick={onActivate}
            aria-expanded={active}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold text-foreground text-sm">
                {model.title}
              </span>
              <span className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
                <span className="truncate text-muted-foreground">
                  {model.subtitle}
                </span>
                {model.contextLabel ? (
                  <>
                    <span className="text-border" aria-hidden="true">
                      ·
                    </span>
                    <span
                      className={cn(
                        "shrink-0 font-semibold",
                        model.urgency === "now"
                          ? "text-spark-amber"
                          : "text-muted-foreground",
                      )}
                    >
                      {model.contextLabel}
                    </span>
                  </>
                ) : null}
              </span>
            </span>
            <ChevronRight
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                active && "rotate-90 text-forge-teal",
              )}
              aria-hidden="true"
            />
          </button>
        </div>

        <CollapsibleContent>
          <div className="flex min-w-0 items-center justify-between gap-3 border-border/45 border-t px-4 py-3">
            <span className="flex min-w-0 items-center gap-2 text-muted-foreground text-xs">
              <ExpandedContextIcon
                className="size-4 shrink-0"
                aria-hidden="true"
              />
              <span className="truncate">{expandedContext.label}</span>
            </span>
            <ul
              className={cn(
                "min-w-0 shrink-0 list-none p-0 [&>li]:bg-transparent! [&>li]:p-0!",
                getDetailContentClassName(model.batchable),
              )}
            >
              {renderDetail(item)}
            </ul>
          </div>
        </CollapsibleContent>
      </GroupedMenuItem>
    </Collapsible>
  );
}

function getExpandedContext(item: VisibleAttentionQueueItem): {
  icon: LucideIcon;
  label: string;
} {
  if (item.kind === "invitation") {
    return {
      icon: UsersRound,
      label: getInviteMemberLabel(item.invite),
    };
  }

  if (item.kind === "request") {
    return {
      icon: MapPin,
      label: item.request.counterpart.city || "View profile before deciding",
    };
  }

  if (item.kind === "plan") {
    return {
      icon: UsersRound,
      label: `For ${item.group.name}`,
    };
  }

  if (item.kind === "participation" || item.kind === "continuation") {
    return {
      icon: LockKeyhole,
      label: "Your response stays private",
    };
  }

  return {
    icon: ShieldCheck,
    label: "Improves your matching profile",
  };
}

function getDetailContentClassName(batchable: boolean) {
  return cn(
    "[&>li>div>a]:hidden",
    "[&>li>a>div:first-child]:hidden [&>li>a]:justify-end",
    "[&>li>div>div:first-child]:hidden [&>li>div]:justify-end",
    batchable && "[&>li>div]:items-center",
  );
}

function CompactVisual({ model }: { model: AttentionQueueCompactModel }) {
  if (model.avatar) {
    return (
      <AvatarWithBadge
        src={model.avatar.src}
        name={model.avatar.name}
        imageSize={80}
        avatarShape={model.avatar.shape === "rounded" ? "rounded" : undefined}
        avatarClassName="size-9 border-border/60"
        fallbackClassName="text-xs"
        icon={model.badgeIcon ?? model.icon}
        badgeTone="teal"
      />
    );
  }

  return (
    <IconTile
      icon={model.icon}
      size="md"
      shape="circle"
      tone={model.iconTone}
      className="size-9"
    />
  );
}

function UrgencyIcon({ group }: { group: UrgencyGroupModel }) {
  const Icon = group.icon;

  return <Icon className="size-4" aria-hidden="true" />;
}

function toggleSetValue(current: Set<string>, key: string) {
  const next = new Set(current);

  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }

  return next;
}

function isVisibleQueueItem(
  item: AttentionQueueRenderItem,
): item is VisibleAttentionQueueItem {
  return item.kind !== "see-rest";
}
