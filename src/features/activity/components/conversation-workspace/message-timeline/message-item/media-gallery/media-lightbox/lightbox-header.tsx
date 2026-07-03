import { domAnimation, LazyMotion, m } from "framer-motion";
import { Download, X } from "lucide-react";
import { useState } from "react";
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
  currentMedia: UnifiedAttachment | null;
  selectedIndex: number | null;
}

export function LightboxHeader({
  count,
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
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-18 items-center justify-between gap-4 bg-linear-to-b from-black/65 to-transparent px-6 sm:h-20 sm:px-8"
      >
        <LightboxHeaderTitle viewState={viewState} />
        <LightboxHeaderActions
          isDownloadDisabled={viewState.isDownloadDisabled}
          isDownloading={isDownloading}
          onDownload={handleDownload}
        />
      </m.div>
    </LazyMotion>
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
  isDownloadDisabled,
  isDownloading,
  onDownload,
}: {
  isDownloadDisabled: boolean;
  isDownloading: boolean;
  onDownload: () => Promise<void>;
}) {
  return (
    <div className="pointer-events-auto flex shrink-0 items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            disabled={isDownloadDisabled}
            loading={isDownloading}
            onClick={() => {
              void onDownload();
            }}
            className="size-10 rounded-full border border-white/10 bg-white/10 text-white/75 shadow-none transition hover:bg-white/16 hover:text-white active:scale-95 disabled:opacity-45"
            aria-label="Download media"
          >
            <Download className="size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Download file</TooltipContent>
      </Tooltip>

      <DialogClose asChild>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="size-10 rounded-full border border-white/10 bg-white/10 text-white/75 shadow-none transition hover:bg-white/16 hover:text-white active:scale-95"
          aria-label="Close gallery"
        >
          <X className="size-5" />
        </Button>
      </DialogClose>
    </div>
  );
}
