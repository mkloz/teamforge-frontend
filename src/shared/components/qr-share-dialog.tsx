import { Share, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { StyledQrCode } from "@/shared/components/styled-qr-code";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  type BrowserShareData,
  canShareBrowserData,
  shareBrowserData,
} from "@/shared/lib/browser-capabilities";
import { cn } from "@/shared/lib/utils";

interface QrShareDialogProps {
  url: string;
  title?: string;
  description?: string;
  bottomText?: string;
  avatarSrc?: string | null;
  trigger: ReactNode;
}

function getQrShareTitle({
  bottomText,
  title,
}: Pick<QrShareDialogProps, "bottomText" | "title">) {
  return title || bottomText || "Share";
}

function getQrShareData(shareTitle: string, url: string): BrowserShareData {
  return {
    title: shareTitle,
    text: shareTitle,
    url,
  };
}

function hasQrShareHeader({
  description,
  title,
}: Pick<QrShareDialogProps, "description" | "title">) {
  return Boolean(title || description);
}

function getQrShareAvatarSrc(avatarSrc: QrShareDialogProps["avatarSrc"]) {
  return avatarSrc || null;
}

function getQrCodeFrameClassName({
  avatarSrc,
  description,
  title,
}: Pick<QrShareDialogProps, "avatarSrc" | "description" | "title">) {
  return cn(
    "relative mx-auto w-full",
    !title && !description && avatarSrc && "pt-10",
  );
}

function QrShareAvatar({ src }: { src: string | null }) {
  if (!src) {
    return null;
  }

  return (
    <div className="absolute top-10 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
      <div className="size-16 overflow-hidden rounded-full border-4 border-forge-deep-panel bg-forge-deep-panel shadow-sm ring-1 ring-white/15">
        <img src={src} alt="" className="size-full object-cover" />
      </div>
    </div>
  );
}

function QrShareHeader({
  description,
  title,
}: Pick<QrShareDialogProps, "description" | "title">) {
  if (!hasQrShareHeader({ description, title })) {
    return null;
  }

  return (
    <DialogHeader className="mb-4 max-w-[calc(100%-3rem)] gap-1 text-left">
      {title && (
        <DialogTitle className="font-bold text-white text-xl leading-tight tracking-tight">
          {title}
        </DialogTitle>
      )}
      {description && (
        <DialogDescription className="font-medium text-sm text-text-dark-secondary leading-relaxed">
          {description}
        </DialogDescription>
      )}
    </DialogHeader>
  );
}

function QrShareOverlay({ canShare }: { canShare: boolean }) {
  if (!canShare) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 opacity-0 transition-[background-color,opacity] duration-200 group-hover:bg-black/58 group-hover:opacity-100">
      <div className="flex flex-col items-center gap-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="flex size-11 items-center justify-center rounded-full bg-forge-deep-surface text-white shadow-xl ring-1 ring-white/10 transition-transform duration-200 group-active:scale-95">
          <Share className="size-5" aria-hidden="true" />
        </div>
        <span className="font-bold text-white text-xs tracking-wide drop-shadow-md">
          Share Link
        </span>
      </div>
    </div>
  );
}

function QrShareCodeButton({
  canShare,
  onShare,
  url,
}: {
  canShare: boolean;
  onShare: () => Promise<void>;
  url: string;
}) {
  return (
    <button
      type="button"
      onClick={
        canShare
          ? () => {
              void onShare();
            }
          : undefined
      }
      className={cn(
        "group relative flex aspect-square w-full items-center justify-center rounded-2xl bg-transparent p-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal",
        canShare ? "cursor-pointer" : "cursor-default",
      )}
    >
      <StyledQrCode url={url} className="max-w-none rounded-2xl" />

      <QrShareOverlay canShare={canShare} />
    </button>
  );
}

function QrShareBottomText({
  bottomText,
}: Pick<QrShareDialogProps, "bottomText">) {
  if (!bottomText) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="text-center font-bold text-white text-xs uppercase tracking-wide">
        {bottomText}
      </p>
    </div>
  );
}

export function QrShareDialog({
  url,
  title,
  description,
  bottomText,
  avatarSrc,
  trigger,
}: QrShareDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [canShare, setCanShare] = useState(false);
  const shareTitle = getQrShareTitle({ bottomText, title });
  const avatarImageSrc = getQrShareAvatarSrc(avatarSrc);

  useEffect(() => {
    setCanShare(canShareBrowserData(getQrShareData(shareTitle, url)));
  }, [shareTitle, url]);

  const handleShare = async () => {
    await shareBrowserData(getQrShareData(shareTitle, url));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        ref={contentRef}
        tabIndex={-1}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          contentRef.current?.focus({ preventScroll: true });
        }}
        className="w-[calc(100vw-2rem)] border-none bg-transparent p-0 shadow-none outline-none sm:max-w-sm [&>button]:hidden"
      >
        <div className={cn("relative w-full", avatarImageSrc && "pt-10")}>
          <QrShareAvatar src={avatarImageSrc} />

          <div className="relative w-full overflow-hidden rounded-2xl bg-forge-deep-panel p-5 shadow-xl ring-1 ring-white/10">
            <DialogClose className="absolute top-4 right-4 z-50 flex size-10 items-center justify-center rounded-full text-text-dark-secondary transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/60">
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </DialogClose>

            <QrShareHeader description={description} title={title} />

            <div
              className={getQrCodeFrameClassName({
                avatarSrc,
                description,
                title,
              })}
            >
              <QrShareCodeButton
                canShare={canShare}
                onShare={handleShare}
                url={url}
              />
            </div>

            <QrShareBottomText bottomText={bottomText} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
