import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";
import { UnifiedTypingIndicator } from "../unified-typing-indicator";

export const TypingPresence = memo(
  ({ typingUsers }: { typingUsers: { name: string; avatar: string }[] }) => (
    <AnimatePresence>
      {typingUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 4 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="flex items-baseline gap-2 px-1 pt-6 pb-0 text-slate-muted"
          style={{ originX: 0 }}
        >
          <div className="flex -space-x-1.5 shrink-0 self-center">
            {typingUsers.slice(0, 3).map((user) => (
              <img
                key={user.name}
                src={user.avatar}
                alt={user.name}
                className="w-5 h-5 rounded-full ring-2 ring-canvas object-cover shadow-sm bg-muted"
              />
            ))}
          </div>
          <span className="text-micro font-bold tracking-tight text-slate-muted/80 truncate">
            {typingUsers.length === 1
              ? `${typingUsers[0].name} is typing`
              : typingUsers.length === 2
                ? `${typingUsers[0].name} & ${typingUsers[1].name} typing`
                : `${typingUsers[0].name} & others typing`}
          </span>
          <UnifiedTypingIndicator variant="minimal" className="h-2.5" />
        </motion.div>
      )}
    </AnimatePresence>
  ),
);
