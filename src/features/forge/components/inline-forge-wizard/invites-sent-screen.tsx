import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import type { ForgeWizardChildProps } from "./types";

export function InvitesSentScreen({ fw }: ForgeWizardChildProps) {
  return (
    <motion.div
      key="forge-invites-sent-screen"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      className="w-full flex flex-col items-center justify-center min-h-[70vh] gap-8 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.15,
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1],
        }}
        className="w-24 h-24 rounded-4xl bg-forge-teal flex items-center justify-center shadow-2xl shadow-forge-teal/30"
      >
        <Check size={44} className="text-white" strokeWidth={2.5} />
      </motion.div>

      <motion.div
        className="flex flex-col items-center gap-3 max-w-xs"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
      >
        <p className="text-xs font-bold tracking-widest text-forge-teal uppercase">
          {fw.forgeMode === "MANUAL" ? "Invitations sent" : "Group saved"}
        </p>
        <h3 className="text-2xl font-black text-foreground tracking-tight">
          Your group is live!
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {fw.forgeMode === "MANUAL"
            ? `${fw.manualInviteeIds.length} invitation${
                fw.manualInviteeIds.length !== 1 ? "s" : ""
              } sent for `
            : "Everything is ready for "}
          <span className="font-semibold text-foreground">
            &ldquo;{fw.planName}&rdquo;
          </span>
          .{" "}
          {fw.forgeMode === "MANUAL"
            ? "You'll be notified as each member joins."
            : "You can start coordinating with members now."}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="w-full max-w-xs"
      >
        <Button
          variant="primary"
          size="lg"
          onClick={() => void fw.handleEnterGroupHub()}
          className="w-full rounded-2xl text-base font-bold"
        >
          Open group hub
        </Button>
      </motion.div>
    </motion.div>
  );
}
