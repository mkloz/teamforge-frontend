import { ChevronLeft, Zap } from "lucide-react";

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
import { Button } from "@/shared/components/ui/button";
import { ForgeProgressBar } from "@/features/forge/components/forge-progress-bar";

import { getForgeStepMetadata } from "./forge-step-metadata";
import type { ForgeWizardChildProps } from "./types";

interface InlineForgeHeaderProps extends ForgeWizardChildProps {
  hasProgress: boolean;
  onCancel: () => void;
  onCancelDialogChange: (open: boolean) => void;
  showCancelDialog: boolean;
}

export function InlineForgeHeader({
  fw,
  hasProgress,
  onCancel,
  onCancelDialogChange,
  showCancelDialog,
}: InlineForgeHeaderProps) {
  const currentMetadata = getForgeStepMetadata(fw);

  return (
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
              onOpenChange={onCancelDialogChange}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (!hasProgress) {
                      onCancel();
                    } else {
                      onCancelDialogChange(true);
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
                    Your progress will be lost. You can start a new forge at any
                    time.
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

      <ForgeProgressBar
        step={fw.step}
        isPreForge={fw.isPreForge}
        forgeResult={fw.forgeResult}
      />
    </div>
  );
}
