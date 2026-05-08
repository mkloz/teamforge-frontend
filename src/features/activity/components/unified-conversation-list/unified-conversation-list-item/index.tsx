import { motion } from "framer-motion";
import { memo } from "react";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";
import { AvatarSection } from "./avatar-section";
import { ContentSection } from "./content-section";

interface UnifiedConversationListItemProps {
  item: UnifiedConversation;
  isSelected: boolean;
  density?: "default" | "compact";
  onSelect: () => void;
}

/**
 * UnifiedConversationListItem - Renders a single conversation in the sidebar list.
 */
export const UnifiedConversationListItem = memo(
  function UnifiedConversationListItem({
    item,
    isSelected,
    density = "default",
    onSelect,
  }: UnifiedConversationListItemProps) {
    const isGroup = item.kind === "group";
    const isCompact = density === "compact";

    return (
      <motion.button
        type="button"
        onClick={onSelect}
        role="option"
        aria-selected={isSelected}
        tabIndex={0}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "group/item relative flex w-full select-none items-center text-left outline-none transition duration-200",
          isCompact ? "gap-2.5 px-3 py-2" : "gap-3.5 px-4 py-3.5",
          "before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:bg-forge-teal before:transition before:duration-300 before:content-['']",
          isSelected
            ? "bg-muted/60 before:opacity-100"
            : "before:opacity-0 hover:bg-muted/30 hover:before:opacity-40",
        )}
      >
        <AvatarSection item={item} isGroup={isGroup} isCompact={isCompact} />
        <ContentSection
          item={item}
          isGroup={isGroup}
          isSelected={isSelected}
          isCompact={isCompact}
        />
      </motion.button>
    );
  },
);
