import { motion } from "framer-motion";
import { InvitesSentHero } from "./invites-sent-hero";
import { getInvitesSentSummary, getStatusFacts } from "./invites-sent-summary";
import { NextActions } from "./next-actions";
import { OpenGroupHubButton } from "./open-group-hub-button";
import type { InvitesSentScreenProps } from "./types";

export function InvitesSentScreen({ fw }: InvitesSentScreenProps) {
  const summary = getInvitesSentSummary(fw);
  const facts = getStatusFacts(summary);

  return (
    <motion.div
      key="forge-invites-sent-screen"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="mx-auto flex min-h-[78vh] w-full max-w-3xl flex-col justify-center px-4 py-8 md:px-12"
    >
      <div className="flex flex-col gap-8">
        <InvitesSentHero facts={facts} summary={summary} />
        <NextActions isManual={summary.isManual} />
        <OpenGroupHubButton onEnterGroupHub={fw.handleEnterGroupHub} />
      </div>
    </motion.div>
  );
}
