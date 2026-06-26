import { AnimatePresence, motion } from "framer-motion";
import { Tags, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import type { Interest } from "@/shared/schemas";
import { InterestTagPillList } from "./interest-tag-pill-list";

interface SelectionShelfProps {
  isSearching: boolean;
  leafById: Record<string, Interest>;
  selectedIds: Set<string>;
  youMightAlsoLike: Interest[];
  isAtMax: boolean;
  onToggle: (id: string) => void;
  onReject: (id: string) => void;
}

interface SelectionShelfState {
  key: "shelf-suggestions" | "shelf-selections";
  showShelf: boolean;
}

export function SelectionShelf({
  isSearching,
  leafById,
  selectedIds,
  youMightAlsoLike,
  isAtMax,
  onToggle,
  onReject,
}: SelectionShelfProps) {
  const shelfState = getSelectionShelfState({
    isSearching,
    selectedIds,
    youMightAlsoLike,
  });

  return (
    <AnimatePresence mode="wait">
      {shelfState.showShelf && (
        <motion.div
          key={shelfState.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="-mx-4 mt-8 border-slate-muted/10 border-t bg-canvas/30 px-4 pt-6 sm:mx-0 sm:mt-12 sm:px-0 sm:pt-8"
        >
          <SelectionShelfHeader
            isSearching={isSearching}
            selectedCount={selectedIds.size}
            suggestionCount={youMightAlsoLike.length}
          />
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            <SelectionShelfContent
              isAtMax={isAtMax}
              isSearching={isSearching}
              leafById={leafById}
              onReject={onReject}
              onToggle={onToggle}
              selectedIds={selectedIds}
              youMightAlsoLike={youMightAlsoLike}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getSelectionShelfState({
  isSearching,
  selectedIds,
  youMightAlsoLike,
}: Pick<
  SelectionShelfProps,
  "isSearching" | "selectedIds" | "youMightAlsoLike"
>): SelectionShelfState {
  return {
    key: isSearching ? "shelf-suggestions" : "shelf-selections",
    showShelf: isSearching ? youMightAlsoLike.length > 0 : selectedIds.size > 0,
  };
}

function SelectionShelfHeader({
  isSearching,
  selectedCount,
  suggestionCount,
}: {
  isSearching: boolean;
  selectedCount: number;
  suggestionCount: number;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {isSearching ? (
        <>
          <IconTile
            icon={Tags}
            tone="teal"
            size="xs"
            shape="square"
            iconClassName="size-3"
          />
          <p className="font-bold font-sans text-forge-teal text-xs">
            Related to your picks ({suggestionCount})
          </p>
        </>
      ) : (
        <p className="font-bold font-sans text-slate-muted/50 text-xs">
          Your picks ({selectedCount})
        </p>
      )}
    </div>
  );
}

function SelectionShelfContent({
  isAtMax,
  isSearching,
  leafById,
  onReject,
  onToggle,
  selectedIds,
  youMightAlsoLike,
}: SelectionShelfProps) {
  if (isSearching) {
    return (
      <InterestTagPillList
        animated
        disabled={isAtMax}
        keyPrefix="search-suggestion"
        onReject={onReject}
        onToggle={onToggle}
        selectedIds={selectedIds}
        tags={youMightAlsoLike}
      />
    );
  }

  return (
    <SelectedInterestButtons
      leafById={leafById}
      onToggle={onToggle}
      selectedIds={selectedIds}
    />
  );
}

function SelectedInterestButtons({
  leafById,
  onToggle,
  selectedIds,
}: Pick<SelectionShelfProps, "leafById" | "onToggle" | "selectedIds">) {
  return [...selectedIds].map((id) => {
    const tag = leafById[id];
    if (!tag) return null;
    return (
      <Button
        key={`shelf-${id}`}
        size="xs"
        onClick={() => onToggle(id)}
        className="h-auto max-w-full rounded-full px-1.5 py-0.75 text-micro sm:px-2 sm:py-1"
      >
        <span className="min-w-0 max-w-33 truncate leading-none sm:max-w-none">
          {tag.name}
        </span>
        <X
          className="size-3 shrink-0 opacity-60 transition-opacity group-hover:opacity-100 sm:size-3.5"
          strokeWidth={3}
        />
      </Button>
    );
  });
}
