import { AnimatePresence, motion } from "framer-motion";

interface PageTitleProps {
  hideContextLabel?: boolean;
  isSearching: boolean;
}

export function PageTitle({
  hideContextLabel = false,
  isSearching,
}: PageTitleProps) {
  return (
    <AnimatePresence initial={false}>
      {!isSearching && (
        <motion.div
          initial={{ height: 0, opacity: 0, marginTop: 0 }}
          animate={{ height: "auto", opacity: 1, marginTop: 16 }}
          exit={{ height: 0, opacity: 0, marginTop: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="mb-6 overflow-hidden pt-4"
        >
          {!hideContextLabel && (
            <p className="mb-2 font-bold font-sans text-forge-teal text-xs">
              Step 2 of 2 · Interests
            </p>
          )}
          <h1 className="font-extrabold font-sans text-3xl text-ink tracking-tight">
            What do you love doing?
          </h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
