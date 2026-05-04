import { motion } from "framer-motion";

import { ForgeLoadingAnvil } from "@/features/forge/components/loading/forge-loading-anvil";

interface ForgeLoadingScreenProps {
  strikeCount: number;
}

export function ForgeLoadingScreen({ strikeCount }: ForgeLoadingScreenProps) {
  return (
    <motion.div
      key="forge-loading-screen"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      className="relative flex min-h-[70vh] w-full flex-col items-center justify-center gap-8 px-4"
    >
      <ForgeLoadingAnvil
        strikeCount={strikeCount}
        size={240}
        className="relative"
      />
    </motion.div>
  );
}
