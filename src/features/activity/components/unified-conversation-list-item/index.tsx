import { cn } from "@/shared/lib/utils";
import { memo } from "react";
import { motion } from "framer-motion";
import type { UnifiedConversation } from "../../types/unified-conversation.types";
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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "relative group flex items-center select-none transition duration-200 outline-none w-full text-left",
          isCompact ? "gap-2.5 px-3 py-2" : "gap-3.5 px-4 py-3.5",
          "before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-0.75 before:bg-forge-teal before:transition before:duration-300",
          isSelected
            ? "bg-muted/60 before:opacity-100"
            : "hover:bg-muted/30 before:opacity-0 hover:before:opacity-40",
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
