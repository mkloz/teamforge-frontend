import { motion } from "framer-motion";
import { Check, ChevronRight, UserPlus } from "lucide-react";

import {
  AutoForgeButton,
  ManualForgeButton,
  PrimaryButton,
  ReforgeButton,
} from "@/features/forge/components/forge-buttons";

import type { ForgeFooterChildProps } from "./types";

interface FooterActionProps extends ForgeFooterChildProps {
  continuePulse: boolean;
  onDisabledStep1Continue: () => void;
}

export function FooterAction({
  continuePulse,
  fw,
  onDisabledStep1Continue,
}: FooterActionProps) {
  if (fw.step === 1) {
    return (
      <motion.div
        key="s1"
        initial={{ opacity: 0, y: 10 }}
        animate={
          continuePulse
            ? { opacity: 1, y: 0, scale: [1, 1.025, 1] }
            : { opacity: 1, y: 0, scale: 1 }
        }
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.55 }}
        onPointerDown={
          !fw.canAdvanceStep1 ? onDisabledStep1Continue : undefined
        }
      >
        <PrimaryButton
          label="Continue to plan"
          icon={<ChevronRight size={16} />}
          onClick={fw.goNext}
          disabled={!fw.canAdvanceStep1}
        />
      </motion.div>
    );
  }

  if (fw.step === 2) {
    return (
      <motion.div
        key="s2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <PrimaryButton
          label="Continue to matching"
          icon={<ChevronRight size={16} />}
          onClick={fw.goNext}
          disabled={!fw.canAdvanceStep2}
        />
      </motion.div>
    );
  }

  if (fw.step === 3) {
    return (
      <motion.div
        key="s3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        {fw.forgeMode === "MANUAL" ? (
          <ManualForgeButton onClick={fw.handleManualForge} />
        ) : (
          <AutoForgeButton onClick={fw.handleAutoForge} />
        )}
      </motion.div>
    );
  }

  if (fw.step === 4 && fw.forgeResult === "SUCCESS") {
    return (
      <motion.div
        key="s4s"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <PrimaryButton
          label="Continue to group identity"
          icon={<ChevronRight size={16} />}
          onClick={fw.goNext}
        />
      </motion.div>
    );
  }

  if (fw.step === 4 && fw.forgeResult === "FAILED") {
    return (
      <motion.div
        key="s4f"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <ReforgeButton onClick={fw.handleReforge} />
      </motion.div>
    );
  }

  if (fw.step === 5) {
    return (
      <motion.div
        key="s5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <PrimaryButton
          label={
            fw.coverImage ? "Continue to invitations" : "I'll set this later"
          }
          icon={<ChevronRight size={16} />}
          onClick={() => void fw.handleSaveIdentityAndContinue()}
          disabled={fw.isSavingIdentity}
        />
      </motion.div>
    );
  }

  if (fw.step === 6) {
    return (
      <motion.div
        key="s6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full"
      >
        {!fw.invitesSent ? (
          <PrimaryButton
            label={
              fw.isSendingInvites
                ? "Sending..."
                : fw.forgeMode === "AUTO" || fw.manualInviteeIds.length === 0
                  ? "Finish group"
                  : "Send invitations"
            }
            icon={<UserPlus size={16} />}
            onClick={() => void fw.handleSendInvites()}
            disabled={fw.isSendingInvites}
          />
        ) : (
          <PrimaryButton
            label="Enter the group hub"
            icon={<Check size={18} />}
            onClick={() => void fw.handleEnterGroupHub()}
          />
        )}
      </motion.div>
    );
  }

  return null;
}
