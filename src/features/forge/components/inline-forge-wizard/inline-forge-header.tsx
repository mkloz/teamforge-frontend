import { ChevronLeft, Network, X } from "lucide-react";
import type { RefObject } from "react";
import { ForgeProgressBar } from "@/features/forge/components/forge-progress-bar";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";

import { getForgeStepMetadata } from "./forge-step-metadata";
import type { ForgeWizardChildProps } from "./types";

interface InlineForgeHeaderProps extends ForgeWizardChildProps {
  hasProgress: boolean;
  headingId: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onCancelDialogChange: (open: boolean) => void;
  showCancelDialog: boolean;
}

export function InlineForgeHeader({
  fw,
  hasProgress,
  headingId,
  headingRef,
  onCancelDialogChange,
  showCancelDialog,
}: InlineForgeHeaderProps) {
  const currentMetadata = getForgeStepMetadata(fw);

  return (
    <div className="sticky top-0 z-30 -mx-6 mb-2 border-border/40 border-b bg-transparent px-6 pb-3 shadow-black/5 shadow-sm backdrop-blur-xl md:-mx-12 md:px-12">
      <div className="mb-2 flex items-center justify-between pt-4 md:mb-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {fw.canGoBack ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={fw.goBack}
              className="size-11 shrink-0 rounded-full p-0 text-slate-muted hover:text-ink md:size-8"
              aria-label="Go back"
            >
              <ChevronLeft size={18} />
            </Button>
          ) : (
            <IconTile
              icon={Network}
              tone="teal"
              size="md"
              shape="square"
              iconClassName="size-3.5"
            />
          )}
          <div className="flex min-w-0 items-baseline">
            <div>
              <h2
                id={headingId}
                ref={headingRef}
                tabIndex={-1}
                className="whitespace-nowrap rounded-sm font-black text-base text-foreground tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 md:text-lg"
              >
                {currentMetadata.title}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {fw.isPreForge && (
            <ActionDialog
              cancelLabel="Keep editing"
              confirmLabel="Discard and exit"
              description="Your progress will be lost. You can start a new forge at any time."
              onConfirm={fw.close}
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
                      fw.close();
                    } else {
                      onCancelDialogChange(true);
                    }
                  }}
                  className="size-10 rounded-full p-0 font-bold text-xs md:h-8 md:w-auto md:rounded-lg md:px-3"
                  aria-label="Cancel"
                >
                  <X className="size-3.5" aria-hidden="true" />
                  <span className="sr-only md:not-sr-only">Cancel</span>
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
