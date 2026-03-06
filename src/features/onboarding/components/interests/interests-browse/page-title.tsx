import { AnimatePresence, motion } from "framer-motion";

interface PageTitleProps {
  isSearching: boolean;
}

export function PageTitle({ isSearching }: PageTitleProps) {
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
          <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-forge-teal mb-1">
            Step 2 of 2 · Interests
          </p>
          <h1 className="font-sans text-3xl font-black tracking-tight text-slate-900">
            What do you love doing?
          </h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
