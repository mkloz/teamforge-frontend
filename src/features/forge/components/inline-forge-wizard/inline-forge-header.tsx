import { ChevronLeft, Network, X } from "lucide-react";
import { ForgeProgressBar } from "@/features/forge/components/forge-progress-bar";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";

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
    <div className="sticky top-0 z-30 -mx-6 mb-2 border-border/40 border-b bg-transparent px-6 pb-3 shadow-black/5 shadow-sm backdrop-blur-xl md:-mx-12 md:px-12">
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
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent/10">
              <Network size={14} className="text-accent" />
            </div>
          )}
          <div className="flex items-baseline overflow-hidden">
            <div>
              <h2 className="font-black text-base text-foreground tracking-tight md:text-lg">
                {currentMetadata.title}
              </h2>
              {currentMetadata.hint && (
                <p className="mt-0.5 font-medium text-muted-foreground text-xs">
                  {currentMetadata.hint}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {fw.isPreForge && (
            <ActionDialog
              cancelLabel="Keep editing"
              confirmLabel="Discard and exit"
              description="Your progress will be lost. You can start a new forge at any time."
              onConfirm={onCancel}
              open={showCancelDialog}
              onOpenChange={onCancelDialogChange}
              title="Exit the forge?"
              tone="danger"
              trigger={
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(event) => {
                    if (!hasProgress) {
                      event.preventDefault();
                      onCancel();
                    } else {
                      onCancelDialogChange(true);
                    }
                  }}
                  className="h-8 px-3 font-black text-xs uppercase tracking-widest"
                >
                  <X className="size-3.5" aria-hidden="true" />
                  Cancel
                </Button>
              }
            />
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
