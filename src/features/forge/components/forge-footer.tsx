import { Check, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import {
  PrimaryButton,
  ManualForgeButton,
  AutoForgeButton,
  ReforgeButton,
} from "./forge-buttons";
import { Button } from "@/shared/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ForgeWizardState } from "../hooks/use-forge-wizard";

interface ForgeFooterProps {
  fw: ForgeWizardState;
  onCancel: () => void;
}

// Helper to render the hint text with animation — readable size, no all-caps, sentence-case
const HintText = ({ children }: { children: React.ReactNode }) => (
  <motion.p
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -5 }}
    className="text-center text-xs text-muted-foreground/70 font-medium px-4"
  >
    {children}
  </motion.p>
);

export function ForgeFooter({ fw, onCancel }: ForgeFooterProps) {
  // Pulse the Continue button once when an activity is first selected
  const [continuePulse, setContinuePulse] = useState(false);
  const prevActivity = useRef<string | null>(null);

  useEffect(() => {
    if (
      fw.step === 1 &&
      fw.selectedActivity &&
      fw.selectedActivity !== prevActivity.current
    ) {
      prevActivity.current = fw.selectedActivity;
      // Wrap in setTimeout to avoid calling setState synchronously during effect execution
      const t1 = setTimeout(() => setContinuePulse(true), 0);
      const t2 = setTimeout(() => setContinuePulse(false), 650);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [fw.selectedActivity, fw.step]);

  // Trigger grid shake when Continue is tapped while disabled
  const handleDisabledContinue = () => {
    const shake = (window as Window & { __forgeShakeGrid?: () => void })
      .__forgeShakeGrid;
    if (shake) shake();
  };

  return (
    <div className="mt-auto -mx-4 md:-mx-12">
      {/* ── Sticky hint strip — informational text only, no buttons ── */}
      {/* bottom-14 on mobile clears the fixed h-14 AppBottomNav; md+ has no nav so bottom-0 */}
      <div className="sticky bottom-14 px-4 md:px-12 py-2 bg-transparent backdrop-blur-sm border-t border-border/40">
        <div className="max-w-2xl mx-auto min-h-5.5 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {fw.step === 1 && !fw.selectedActivity && (
              <HintText key="h1-empty">Select a category to continue</HintText>
            )}
            {fw.step === 1 && fw.selectedActivity && (
              <HintText key="h1-selected">
                Next: define date, time, and location
              </HintText>
            )}
            {fw.step === 2 && (
              <HintText key="h2">
                Almost there — configure your matching algorithm next
              </HintText>
            )}
            {fw.step === 4 && fw.forgeResult === "success" && (
              <HintText key="h4">
                Group matched — give it an identity next
              </HintText>
            )}
            {fw.step === 5 && (
              <HintText key="h5">Final step — send your invitations</HintText>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Non-sticky CTA area — scrolls with content ── */}
      <div className="px-4 md:px-12 pt-5 pb-8 md:pb-12">
        <div className="max-w-2xl mx-auto w-full space-y-4">
          <div className="flex items-center gap-3">
            {/* Secondary Action / Back Button - moved from header to footer for mobile thumb-reach */}
            <AnimatePresence>
              {fw.canGoBack && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -10 }}
                  className="shrink-0"
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={fw.goBack}
                    aria-label="Go back"
                    className="h-14 w-14 rounded-2xl border-border/60 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/30 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1">
              <AnimatePresence mode="wait">
                {fw.step === 1 && (
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
                    // Capture taps on the disabled state to trigger grid shake
                    onPointerDown={
                      !fw.canAdvanceStep1 ? handleDisabledContinue : undefined
                    }
                  >
                    <PrimaryButton
                      label="Continue to plan"
                      icon={<ChevronRight size={16} />}
                      onClick={fw.goNext}
                      disabled={!fw.canAdvanceStep1}
                    />
                  </motion.div>
                )}

                {fw.step === 2 && (
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
                )}

                {fw.step === 3 && (
                  <motion.div
                    key="s3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {fw.forgeMode === "manual" ? (
                      <ManualForgeButton onClick={fw.handleManualForge} />
                    ) : (
                      <AutoForgeButton onClick={fw.handleAutoForge} />
                    )}
                  </motion.div>
                )}

                {fw.step === 4 && fw.forgeResult === "success" && (
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
                )}

                {fw.step === 4 && fw.forgeResult === "failed" && (
                  <motion.div
                    key="s4f"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <ReforgeButton onClick={fw.handleReforge} />
                  </motion.div>
                )}

                {fw.step === 5 && (
                  <motion.div
                    key="s5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <PrimaryButton
                      label={
                        fw.coverImage
                          ? "Continue to invitations"
                          : "I'll set this later"
                      }
                      icon={<ChevronRight size={16} />}
                      onClick={fw.goNext}
                    />
                  </motion.div>
                )}

                {fw.step === 6 && (
                  <motion.div
                    key="s6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full"
                  >
                    {!fw.invitesSent ? (
                      <PrimaryButton
                        label="Send invitations"
                        icon={<UserPlus size={16} />}
                        onClick={() => fw.setInvitesSent(true)}
                      />
                    ) : (
                      <PrimaryButton
                        label="Enter the group hub"
                        icon={<Check size={18} />}
                        onClick={onCancel}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Validation hints — teal left-border accent strip for visibility */}
          <AnimatePresence>
            {fw.step === 2 &&
              !fw.canAdvanceStep2 &&
              fw.planName.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-muted-foreground/80 font-medium pl-3 border-l-2 border-primary/40">
                    Event title needs at least 3 characters to continue
                  </p>
                </motion.div>
              )}
          </AnimatePresence>
        </div>
        {/* end max-w-2xl */}
      </div>
      {/* end non-sticky CTA area */}
    </div>
  );
}
