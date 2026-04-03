import { cn } from "@/shared/lib/utils";
import { memo } from "react";
import type { UnifiedConversation } from "../../types/unified-conversation.types";
import { AvatarSection } from "./avatar-section";
import { ContentSection } from "./content-section";

interface UnifiedConversationListItemProps {
  item: UnifiedConversation;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * UnifiedConversationListItem - Renders a single conversation in the sidebar list.
 */
export const UnifiedConversationListItem = memo(
  function UnifiedConversationListItem({
    item,
    isSelected,
    onSelect,
  }: UnifiedConversationListItemProps) {
    const isGroup = item.kind === "group";

    return (
      <button
        type="button"
        onClick={onSelect}
        role="option"
        aria-selected={isSelected}
        className={cn(
          "relative group flex items-center gap-3.5 px-4 py-3.5 select-none transition duration-200 outline-none",
          "before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-0.75 before:bg-forge-teal before:transition before:duration-300",
          isSelected
            ? "bg-muted/60 before:opacity-100"
            : "hover:bg-muted/30 before:opacity-0 hover:before:opacity-40",
        )}
      >
        <AvatarSection item={item} isGroup={isGroup} />
        <ContentSection item={item} isGroup={isGroup} isSelected={isSelected} />
      </button>
    );
  },
);
