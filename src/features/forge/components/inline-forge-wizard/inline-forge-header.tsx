import { ChevronLeft, Network } from "lucide-react";

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
    <div className="sticky top-0 z-30 -mx-6 mb-2 border-b border-border/40 bg-transparent px-6 pb-3 shadow-sm shadow-black/5 backdrop-blur-xl md:top-0 md:-mx-12 md:px-12">
      <div className="mb-2 flex items-center justify-between pt-4 md:mb-3">
        <div className="flex items-center gap-3">
          {fw.canGoBack ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={fw.goBack}
              className="size-8 shrink-0 rounded-full p-0 text-slate-muted hover:text-ink"
              aria-label="Go back"
            >
              <ChevronLeft size={18} />
            </Button>
          ) : (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <Network size={14} className="text-accent" />
            </div>
          )}
          <div className="flex items-baseline overflow-hidden">
            <h2 className="text-base font-black tracking-tight text-foreground md:text-lg">
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
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (!hasProgress) {
                      onCancel();
                    } else {
                      onCancelDialogChange(true);
                    }
                  }}
                  className="h-8 px-3 text-[10px] font-black tracking-widest uppercase"
                >
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-xl">
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
                    variant="destructive"
                    onClick={onCancel}
                    className="rounded-xl"
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
        forgeMode={fw.forgeMode}
      />
    </div>
  );
}
