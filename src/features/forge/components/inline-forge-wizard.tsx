"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { ForgeLoadingAnvil } from "./loading/forge-loading-anvil";
import { useForgeWizard } from "../hooks/use-forge-wizard";

import { Step1Activity } from "./steps/step1-activity";
import { Step2Plan } from "./steps/step2-plan";
import { Step3Group } from "./steps/step3-group";
import { Step4Failed } from "./steps/step4-failed";
import { Step4Success } from "./steps/step4-success";
import { Step5Identity } from "./steps/step5-identity";
import { Step6Invite } from "./steps/step6-invite";

import { Button } from "@/shared/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { ForgeFooter } from "./forge-footer";
import { ForgeProgressBar } from "./forge-progress-bar";

interface InlineForgeWizardProps {
  onCancel: () => void;
}

export function InlineForgeWizard({ onCancel }: InlineForgeWizardProps) {
  const fw = useForgeWizard(onCancel);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const hasProgress = fw.step > 1 || fw.selectedActivity !== null;

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fw.step, fw.isForging]);

  // Header metadata per step
  const currentMetadata = {
    1: { title: "What are we doing?", sub: "Activity Selection" },
    2: { title: "When and Where?", sub: "Planning Details" },
    3: { title: "Who are we looking for?", sub: "Group Preferences" },
    4: {
      title:
        fw.forgeResult === "FAILED" ? "No matches found" : "We found a group!",
      sub: fw.forgeResult === "FAILED" ? "Let's try adjusting" : "Success",
    },
    5: { title: "Give it a look", sub: "Group Identity" },
    6: { title: "Ready to go!", sub: "Invitations" },
  }[fw.step] || { title: "", sub: "" };

  // ── Invitations sent screen — full-area replacement ──────────────────────
  if (fw.invitesSent) {
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
            Invitations sent
          </p>
          <h3 className="text-2xl font-black text-foreground tracking-tight">
            Your group is live!
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {fw.activeParticipants.length} invitation
            {fw.activeParticipants.length !== 1 ? "s" : ""} sent for{" "}
            <span className="font-semibold text-foreground">
              &ldquo;{fw.planName}&rdquo;
            </span>
            . You&apos;ll be notified as each member joins.
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
            onClick={fw.close}
            className="w-full rounded-2xl text-base font-bold"
          >
            Done
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  // ── Loading screen — full-area replacement, not an overlay ──────────────
  if (fw.isForging) {
    return (
      <motion.div
        key="forge-loading-screen"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
        className="w-full flex flex-col items-center justify-center min-h-[70vh] gap-10 px-4"
      >
        {/* Ambient glow behind animation */}
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

  return (
    <motion.div
      key="forge-wizard-form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="w-full h-full flex flex-col px-4 md:px-12 max-w-3xl mx-auto"
    >
      {/* ── Responsive Sticky Header ── */}
      <div className="sticky top-0 md:top-0 z-30 bg-transparent backdrop-blur-xl -mx-6 md:-mx-12 px-6 md:px-12 pb-3 border-b border-border/40 mb-2 shadow-sm shadow-black/5">
        <div className="flex items-center justify-between pt-4 mb-2 md:mb-3">
          <div className="flex items-center gap-3">
            {fw.canGoBack ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={fw.goBack}
                className="size-8 p-0 rounded-full shrink-0 text-slate-muted hover:text-ink"
                aria-label="Go back"
              >
                <ChevronLeft size={18} />
              </Button>
            ) : (
              <div className="size-8 rounded-full flex items-center justify-center bg-accent/10 shrink-0">
                <Zap size={14} className="text-accent fill-current" />
              </div>
            )}
            <div className="flex items-baseline overflow-hidden">
              <h2 className="text-base md:text-lg font-black text-foreground tracking-tight">
                {currentMetadata.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {fw.isPreForge && (
              <AlertDialog
                open={showCancelDialog}
                onOpenChange={setShowCancelDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (!hasProgress) {
                        onCancel();
                      } else {
                        setShowCancelDialog(true);
                      }
                    }}
                    className="h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                  >
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Exit the forge?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your progress will be lost. You can start a new forge at
                      any time.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">
                      Keep editing
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onCancel}
                      className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Discard &amp; exit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <ForgeProgressBar
          step={fw.step}
          isPreForge={fw.isPreForge}
          forgeResult={fw.forgeResult}
        />
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 relative mt-2">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={fw.step}
            initial={{
              opacity: 0,
              x: fw.navDirection === "forward" ? 24 : -24,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: fw.navDirection === "forward" ? -24 : 24 }}
            transition={{
              duration: 0.35,
              ease: [0.32, 0.72, 0, 1],
            }}
            className="w-full py-4 flex flex-col"
          >
            {fw.step === 1 && (
              <Step1Activity
                selectedActivity={fw.selectedActivity}
                onSelect={(a) => fw.setSelectedActivity(a)}
              />
            )}
            {fw.step === 2 && (
              <Step2Plan
                planName={fw.planName}
                onPlanNameChange={fw.setPlanName}
                planDate={fw.planDate}
                onPlanDateChange={fw.setPlanDate}
                planTime={fw.planTime}
                onPlanTimeChange={fw.setPlanTime}
                planLocation={fw.planLocation}
                onPlanLocationChange={fw.setPlanLocation}
                locationType={fw.locationType}
                onLocationTypeChange={fw.setLocationType}
              />
            )}
            {fw.step === 3 && (
              <Step3Group
                forgeMode={fw.forgeMode}
                onForgeModeChange={fw.setForgeMode}
                fixedSize={fw.fixedSize}
                onFixedSizeChange={fw.setFixedSize}
                groupSizeMode={fw.groupSizeMode}
                onGroupSizeModeChange={fw.setGroupSizeMode}
                autoMinSize={fw.autoMinSize}
                onAutoMinSizeChange={fw.setAutoMinSize}
                autoMaxSize={fw.autoMaxSize}
                onAutoMaxSizeChange={fw.setAutoMaxSize}
                compatibilityWeight={fw.compatibilityWeight}
                onCompatibilityWeightChange={fw.setCompatibilityWeight}
                diversityWeight={fw.diversityWeight}
                onDiversityWeightChange={fw.setDiversityWeight}
                visibility={fw.visibility}
                onVisibilityChange={fw.setVisibility}
                groupName={fw.groupName}
                onGroupNameChange={fw.setGroupName}
                groupDescription={fw.groupDescription}
                onGroupDescriptionChange={fw.setGroupDescription}
                selectedActivity={fw.selectedActivity}
              />
            )}
            {fw.step === 4 && fw.forgeResult === "SUCCESS" && (
              <Step4Success
                planTitle={fw.planName}
                participants={fw.participants}
                removedIds={fw.removedIds}
                onRemoveParticipant={fw.handleRemoveParticipant}
                onRestoreParticipant={fw.handleRestoreParticipant}
                onReforge={fw.handleReforge}
              />
            )}
            {fw.step === 4 && fw.forgeResult === "FAILED" && (
              <Step4Failed forgeMode={fw.forgeMode} />
            )}
            {fw.step === 5 && (
              <Step5Identity
                planTitle={fw.planName}
                activityTitle={fw.selectedActivity || ""}
                coverImage={fw.coverImage}
                onCoverImageChange={fw.setCoverImage}
                avatarImage={fw.avatarImage}
                onAvatarImageChange={fw.setAvatarImage}
                groupName={fw.groupName}
                onGroupNameChange={fw.setGroupName}
                groupDescription={fw.groupDescription}
                onGroupDescriptionChange={fw.setGroupDescription}
              />
            )}
            {fw.step === 6 && (
              <Step6Invite
                planTitle={fw.planName}
                planDate={fw.planDate}
                planLocation={fw.planLocation}
                activityTitle={fw.selectedActivity || ""}
                participantCount={fw.activeParticipants.length + 1}
                coverImage={fw.coverImage}
                inviteCopied={fw.inviteCopied}
                onCopyLink={fw.handleCopyLink}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Unified Footer Component ── */}
      <ForgeFooter fw={fw} onCancel={onCancel} />
    </motion.div>
  );
}
