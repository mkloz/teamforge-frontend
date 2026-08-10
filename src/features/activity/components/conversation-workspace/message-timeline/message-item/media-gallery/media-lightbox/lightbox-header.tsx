import { Download, X } from "lucide-react";
import { type Ref, useState } from "react";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";
import { DialogClose } from "@/shared/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  downloadMedia,
  getDownloadCandidate,
} from "./lightbox-header-download";
import { getLightboxHeaderViewState } from "./lightbox-header-view-state";

interface LightboxHeaderProps {
  count: number;
  closeButtonRef: Ref<HTMLButtonElement>;
  currentMedia: UnifiedAttachment | null;
  selectedIndex: number | null;
}

export function LightboxHeader({
  count,
  closeButtonRef,
  currentMedia,
  selectedIndex,
}: LightboxHeaderProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const viewState = getLightboxHeaderViewState({
    count,
    currentMedia,
    isDownloading,
    selectedIndex,
  });

  async function handleDownload() {
    const mediaToDownload = getDownloadCandidate(currentMedia, isDownloading);

    if (!mediaToDownload) {
      return;
    }

    setIsDownloading(true);
    await downloadMedia(mediaToDownload).finally(() => {
      setIsDownloading(false);
    });
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-[calc(env(safe-area-inset-top)+5rem)] items-center justify-between gap-4 bg-linear-to-b from-black/65 to-transparent pt-[env(safe-area-inset-top)] pr-[max(env(safe-area-inset-right),1.5rem)] pl-[max(env(safe-area-inset-left),1.5rem)] sm:pr-[max(env(safe-area-inset-right),2rem)] sm:pl-[max(env(safe-area-inset-left),2rem)]">
      <LightboxHeaderTitle viewState={viewState} />
      <LightboxHeaderActions
        closeButtonRef={closeButtonRef}
        downloadLabel={`Download ${viewState.mediaTitle}`}
        isDownloadDisabled={viewState.isDownloadDisabled}
        isDownloading={isDownloading}
        onDownload={handleDownload}
      />
    </div>
  );
}

function LightboxHeaderTitle({
  viewState,
}: {
  viewState: ReturnType<typeof getLightboxHeaderViewState>;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className="rounded-md border border-white/10 bg-white/10 px-2 py-0.5 font-black text-white text-xs tracking-wide">
          {viewState.positionLabel}
        </span>
        <span className="max-w-40 truncate font-bold text-sm text-white/80 tracking-tight sm:max-w-80">
          {viewState.mediaTitle}
        </span>
      </div>
    </div>
  );
}

function LightboxHeaderActions({
  closeButtonRef,
  downloadLabel,
  isDownloadDisabled,
  isDownloading,
  onDownload,
}: {
  closeButtonRef: Ref<HTMLButtonElement>;
  downloadLabel: string;
  isDownloadDisabled: boolean;
  isDownloading: boolean;
  onDownload: () => Promise<void>;
}) {
  return (
    <div className="pointer-events-auto flex shrink-0 items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="accentGhost"
            size="icon"
            type="button"
            disabled={isDownloadDisabled}
            loading={isDownloading}
            onClick={() => {
              void onDownload();
            }}
            contentClassName="size-10 shrink-0 rounded-full border border-white/10 bg-white/10 group-hover:bg-white/16"
            className="group size-11 rounded-full border-0 bg-transparent p-0 text-white/75 shadow-none hover:text-white active:scale-95 disabled:opacity-45"
            aria-label={downloadLabel}
          >
            <Download className="size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Download file</TooltipContent>
      </Tooltip>

      <DialogClose asChild>
        <Button
          ref={closeButtonRef}
          variant="accentGhost"
          size="icon"
          type="button"
          contentClassName="size-10 shrink-0 rounded-full border border-white/10 bg-white/10 group-hover:bg-white/16"
          className="group size-11 rounded-full border-0 bg-transparent p-0 text-white/75 shadow-none hover:text-white active:scale-95"
          aria-label="Close gallery"
        >
          <X className="size-5" />
        </Button>
      </DialogClose>
    </div>
  );
}
