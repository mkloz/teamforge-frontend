"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useEffect } from "react";
import { useForgeWizard } from "../hooks/use-forge-wizard";

import { Step1Activity } from "./steps/step1-activity";
import { Step2Plan } from "./steps/step2-plan";
import { Step3Group } from "./steps/step3-group";
import { Step4Failed } from "./steps/step4-failed";
import { Step4Success } from "./steps/step4-success";
import { Step5Identity } from "./steps/step5-identity";
import { Step6Invite } from "./steps/step6-invite";

import { Button } from "@/shared/components/ui/button";
import { ForgeFooter } from "./forge-footer";
import { ForgeProgressBar } from "./forge-progress-bar";

interface InlineForgeWizardProps {
  onCancel: () => void;
}

export function InlineForgeWizard({ onCancel }: InlineForgeWizardProps) {
  const fw = useForgeWizard(onCancel);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fw.step]);

  // Header metadata mapping for the statement/title
  const currentMetadata = {
    1: { title: "What are we doing?", sub: "Activity Selection" },
    2: { title: "When and Where?", sub: "Planning Details" },
    3: { title: "Who are we looking for?", sub: "Group Preferences" },
    4: {
      title:
        fw.forgeResult === "failed" ? "No matches found" : "We found a group!",
      sub: fw.forgeResult === "failed" ? "Let's try adjusting" : "Success",
    },
    5: { title: "Give it a look", sub: "Group Identity" },
    6: { title: "Ready to go!", sub: "Invitations" },
  }[fw.step] || { title: "", sub: "" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full h-full flex flex-col px-4 md:px-12 max-w-3xl mx-auto"
    >
      {/* ── Responsive Sticky Header ── */}
      <div className="sticky top-0 md:top-16 z-30 bg-transparent backdrop-blur-xl -mx-6 md:-mx-12 px-6 md:px-12 pb-3 border-b border-border/40 mb-2 shadow-sm shadow-black/5">
        <div className="flex items-center justify-between pt-4 mb-2 md:mb-3">
          <div className="flex items-center gap-3">
            {/* Zap icon on step 1 only; no duplicate back button — navigation is in the footer */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/10 shrink-0">
              <Zap size={14} className="text-accent fill-current" />
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline gap-0 md:gap-4 overflow-hidden">
              <h2 className="text-base md:text-lg font-black text-foreground tracking-tight">
                {currentMetadata.title}
              </h2>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[10px] font-bold text-muted-foreground/50 tracking-widest truncate max-w-30">
                  {currentMetadata.sub}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {fw.isPreForge && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Only confirm if user has made progress past step 1
                  const hasProgress =
                    fw.step > 1 ||
                    fw.selectedActivity !== null;
                  if (
                    !hasProgress ||
                    window.confirm(
                      "Exit the forge? Your progress will be lost.",
                    )
                  ) {
                    onCancel();
                  }
                }}
                className="text-[10px] font-bold tracking-widest text-destructive/50 hover:text-destructive px-2.5 py-1.5 rounded-lg shrink-0 transition-colors"
              >
                Cancel
              </Button>
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
              />
            )}
            {fw.step === 4 && fw.forgeResult === "success" && (
              <Step4Success
                planName={fw.planName}
                activity={fw.selectedActivity ?? ""}
                participants={fw.participants}
                removedIds={fw.removedIds}
                onRemoveParticipant={fw.handleRemoveParticipant}
                onReforge={fw.handleReforge}
              />
            )}
            {fw.step === 4 && fw.forgeResult === "failed" && (
              <Step4Failed forgeMode={fw.forgeMode} />
            )}
            {fw.step === 5 && (
              <Step5Identity
                planName={fw.planName}
                activity={fw.selectedActivity}
                coverImage={fw.coverImage}
                onCoverImageChange={fw.setCoverImage}
              />
            )}
            {fw.step === 6 && (
              <Step6Invite
                planName={fw.planName || "Your Group"}
                participantCount={fw.activeParticipants.length + 1}
                inviteCopied={fw.inviteCopied}
                onCopyLink={fw.handleCopyLink}
                invitesSent={fw.invitesSent}
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
