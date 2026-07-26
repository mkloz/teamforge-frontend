import { AnimatePresence, m } from "framer-motion";

interface PageTitleProps {
  isSearching: boolean;
}

export function PageTitle({ isSearching }: PageTitleProps) {
  return (
    <AnimatePresence initial={false}>
      {!isSearching && (
        <m.div
          initial={{ height: 0, opacity: 0, marginTop: 0 }}
          animate={{ height: "auto", opacity: 1, marginTop: 16 }}
          exit={{ height: 0, opacity: 0, marginTop: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="mb-6 overflow-hidden pt-4"
        >
          <h1 className="font-extrabold font-sans text-3xl text-ink tracking-tight">
            What do you love doing?
          </h1>
        </m.div>
      )}
    </AnimatePresence>
  );
}
