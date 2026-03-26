import { Check, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import {
  PrimaryButton,
  ManualForgeButton,
  AutoForgeButton,
  ReforgeButton,
} from "./forge-buttons";
import { Button } from "@/shared/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { ForgeWizardState } from "../hooks/use-forge-wizard";

interface ForgeFooterProps {
  fw: ForgeWizardState;
  onCancel: () => void;
}

// Helper to render the hint text with animation
const HintText = ({ children }: { children: React.ReactNode }) => (
  <motion.p
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -5 }}
    className="text-center text-[10px] md:text-xs text-muted-foreground/60 font-semibold tracking-wide px-4 uppercase"
  >
    {children}
  </motion.p>
);

export function ForgeFooter({ fw, onCancel }: ForgeFooterProps) {
  return (
    <div className="sticky bottom-0 md:relative pt-4 mt-auto -mx-4 md:-mx-12 px-4 md:px-12 pb-6 md:pb-10 transition-all duration-500">
      {/* Background decoration for the sticky footer */}
      <div className="absolute inset-x-0 bottom-0 top-0 bg-linear-to-t from-background via-background/95 to-transparent md:hidden pointer-events-none" />

      <div className="relative max-w-2xl mx-auto w-full space-y-4">
        {/* Progress Hint Line - subtle indicator of where we are going */}
        <div className="flex items-center justify-center gap-2 overflow-hidden py-1">
          <AnimatePresence mode="wait">
            {fw.step === 1 && (
              <HintText key="h1">Next: Define date, time & location</HintText>
            )}
            {fw.step === 2 && (
              <HintText key="h2">Almost there: Configure algorithm</HintText>
            )}
            {fw.step === 4 && fw.forgeResult === "success" && (
              <HintText key="h4">Matched! Next: Group Identity</HintText>
            )}
            {fw.step === 5 && (
              <HintText key="h5">Final Step: Send Invitations</HintText>
            )}
          </AnimatePresence>
        </div>

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
                  variant="secondary"
                  size="icon"
                  onClick={fw.goBack}
                  className="h-14 w-14 rounded-2xl bg-muted/30 border border-border/40 text-muted-foreground hover:text-foreground"
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
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
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

        {/* Error/Validation hints — readable contrast, no all-caps */}
        <AnimatePresence>
          {fw.step === 1 && !fw.canAdvanceStep1 && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-center text-xs text-muted-foreground/70 font-medium"
            >
              Select a category above to continue
            </motion.p>
          )}
          {fw.step === 2 &&
            !fw.canAdvanceStep2 &&
            fw.planName.trim().length > 0 && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center text-xs text-muted-foreground/70 font-medium"
              >
                Plan name needs at least 3 characters
              </motion.p>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
