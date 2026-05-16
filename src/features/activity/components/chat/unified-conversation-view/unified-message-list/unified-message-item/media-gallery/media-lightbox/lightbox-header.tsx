import { motion } from "framer-motion";
import ky from "ky";
import { Download, X } from "lucide-react";
import { memo, useState } from "react";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";
import { DialogClose } from "@/shared/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface LightboxHeaderProps {
  count: number;
  currentMedia: UnifiedAttachment | null;
  selectedIndex: number | null;
}

export const LightboxHeader = memo(function LightboxHeader({
  count,
  currentMedia,
  selectedIndex,
}: LightboxHeaderProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    if (!currentMedia || isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      await downloadMedia(currentMedia);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-18 items-center justify-between gap-4 bg-linear-to-b from-black/65 to-transparent px-6 sm:h-20 sm:px-8"
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-white/10 bg-white/10 px-2 py-0.5 font-black text-white text-xs tracking-wide">
            {selectedIndex !== null ? selectedIndex + 1 : 0} / {count}
          </span>
          <span className="max-w-40 truncate font-bold text-sm text-white/80 tracking-tight sm:max-w-80">
            {currentMedia?.name || "Shared memory"}
          </span>
        </div>
      </div>
      <div className="pointer-events-auto flex shrink-0 items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              disabled={!currentMedia || isDownloading}
              loading={isDownloading}
              onClick={() => {
                void handleDownload();
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
    </motion.div>
  );
});

async function downloadMedia(media: UnifiedAttachment) {
  const fileName = getDownloadFileName(media);

  try {
    const blob = await ky.get(media.url, { timeout: 30_000 }).blob();
    const objectUrl = URL.createObjectURL(blob);

    triggerDownload(objectUrl, fileName);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    triggerDownload(media.url, fileName, { openInNewTab: true });
  }
}

function triggerDownload(
  url: string,
  fileName: string,
  options: { openInNewTab?: boolean } = {},
) {
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.rel = "noopener noreferrer";

  if (options.openInNewTab) {
    link.target = "_blank";
  }

  document.body.append(link);
  link.click();
  link.remove();
}

function getDownloadFileName(media: UnifiedAttachment) {
  const name = media.name?.trim();

  if (name) {
    return name;
  }

  const extension = getExtensionFromMimeType(media.mimeType);

  return `teamforge-media-${media.id}${extension}`;
}

function getExtensionFromMimeType(mimeType: string | null) {
  if (!mimeType) {
    return "";
  }

  const subtype = mimeType.split("/")[1]?.split(";")[0]?.trim();

  if (!subtype) {
    return "";
  }

  return `.${subtype === "jpeg" ? "jpg" : subtype}`;
}
