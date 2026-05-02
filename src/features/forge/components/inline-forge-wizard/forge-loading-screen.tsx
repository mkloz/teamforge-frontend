import { motion } from "framer-motion";

import { ForgeLoadingAnvil } from "@/features/forge/components/loading/forge-loading-anvil";

export function ForgeLoadingScreen() {
  return (
    <motion.div
      key="forge-loading-screen"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      className="w-full flex flex-col items-center justify-center min-h-[70vh] gap-10 px-4"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <ForgeLoadingAnvil
        label="Forging your group..."
        size={320}
        className="relative z-10"
      />
    </motion.div>
  );
}
