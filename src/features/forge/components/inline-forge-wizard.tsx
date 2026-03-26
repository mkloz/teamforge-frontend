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

  // Step metadata: title, sub-description, and entity tag
  const STEP_META: Record<number, { title: string; sub: string; entity: string; entityColor: string }> = {
    1: { title: "What are we doing?", sub: "Choose the type of activity for your group.", entity: "Activity", entityColor: "bg-muted text-muted-foreground" },
    2: { title: "When and where?", sub: "Set the date, time, and location for your plan.", entity: "Plan", entityColor: "bg-primary/10 text-primary" },
    3: { title: "Who are we looking for?", sub: "Configure how the algorithm finds your group.", entity: "Group", entityColor: "bg-accent/15 text-accent" },
    4: {
      title: fw.forgeResult === "failed" ? "No matches found" : "Group forged!",
      sub: fw.forgeResult === "failed" ? "Adjust your parameters and try again." : "Your group has been assembled by the algorithm.",
      entity: fw.forgeResult === "failed" ? "Failed" : "Success",
      entityColor: fw.forgeResult === "failed" ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600",
    },
    5: { title: "Give it a look", sub: "Add a cover image to represent your group.", entity: "Identity", entityColor: "bg-muted text-muted-foreground" },
    6: { title: "Ready to go!", sub: "Send invitations to your matched members.", entity: "Invite", entityColor: "bg-muted text-muted-foreground" },
  };
  const meta = STEP_META[fw.step] ?? { title: "", sub: "", entity: "", entityColor: "" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full h-full flex flex-col px-4 md:px-12 max-w-3xl mx-auto"
    >
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 md:top-16 z-30 bg-background/95 backdrop-blur-xl -mx-4 md:-mx-12 px-4 md:px-12 pb-3 border-b border-border/50 mb-2">
        <div className="flex items-start justify-between pt-5 md:pt-6 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Brand icon — always visible, never replaced by back button (back is in footer) */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-accent/10 shrink-0 mt-0.5">
              <Zap size={16} className="text-accent fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[15px] md:text-base font-bold text-foreground leading-tight tracking-tight">
                  {meta.title}
                </h2>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${meta.entityColor}`}>
                  {meta.entity}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                {meta.sub}
              </p>
            </div>
          </div>

          {/* Cancel — only shown pre-forge with confirmation guard */}
          <div className="flex items-center shrink-0 ml-2 mt-0.5">
            {fw.isPreForge && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const hasProgress = fw.step > 1 || fw.selectedActivity !== null;
                  if (!hasProgress || window.confirm("Exit the forge? Your progress will be lost.")) {
                    onCancel();
                  }
                }}
                className="h-8 px-3 text-xs font-semibold text-muted-foreground/60 hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
              >
                Cancel
              </Button>
            )}
            {!fw.isPreForge && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-8 px-3 text-xs font-semibold text-muted-foreground/60 hover:text-foreground rounded-lg transition-colors"
              >
                Close
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
