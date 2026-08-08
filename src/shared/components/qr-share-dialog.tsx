import { Copy, Share, X } from "lucide-react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { StyledQrCode } from "@/shared/components/styled-qr-code";
import { Button } from "@/shared/components/ui/button";
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
  showAppErrorMessageToast,
  showAppSuccessToast,
} from "@/shared/lib/app-toast";
import {
  type BrowserShareData,
  canShareBrowserData,
  copyTextToClipboard,
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

function getQrCodeLabel(shareTitle: string) {
  return shareTitle === "Share"
    ? "QR code for this link"
    : `QR code for ${shareTitle}`;
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

function QrShareAvatar({ src }: { src: string | null }) {
  if (!src) {
    return null;
  }

  return (
    <div className="absolute top-8 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
      <div className="size-16 overflow-hidden rounded-full border-4 border-popover bg-popover shadow-sm ring-1 ring-border/60">
        <img src={src} alt="" className="size-full object-cover" />
      </div>
    </div>
  );
}

function QrShareHeader({
  description,
  shareTitle,
  title,
}: Pick<QrShareDialogProps, "description" | "title"> & {
  shareTitle: string;
}) {
  if (!hasQrShareHeader({ description, title })) {
    return <DialogTitle className="sr-only">{shareTitle}</DialogTitle>;
  }

  return (
    <DialogHeader className="max-w-[calc(100%-3rem)] gap-1 text-left">
      {title ? (
        <DialogTitle className="font-black text-ink text-xl leading-tight tracking-tight">
          {title}
        </DialogTitle>
      ) : (
        <DialogTitle className="sr-only">{shareTitle}</DialogTitle>
      )}
      {description && (
        <DialogDescription className="font-medium text-slate-muted text-sm leading-relaxed">
          {description}
        </DialogDescription>
      )}
    </DialogHeader>
  );
}

function QrShareCode({ shareTitle, url }: { shareTitle: string; url: string }) {
  return (
    <div
      role="img"
      aria-label={getQrCodeLabel(shareTitle)}
      className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-canvas p-2 ring-1 ring-border/55"
    >
      <StyledQrCode url={url} className="max-w-none rounded-xl" />
    </div>
  );
}

function QrShareBottomText({
  bottomText,
}: Pick<QrShareDialogProps, "bottomText">) {
  if (!bottomText) {
    return null;
  }

  return (
    <div className="text-center">
      <p className="font-semibold text-slate-muted text-xs">{bottomText}</p>
    </div>
  );
}

function getShareDestination(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
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
  const [isCopying, setIsCopying] = useState(false);
  const shareTitle = getQrShareTitle({ bottomText, title });
  const shareData = getQrShareData(shareTitle, url);
  const canShare = canShareBrowserData(shareData);
  const avatarImageSrc = getQrShareAvatarSrc(avatarSrc);

  const handleShare = async () => {
    await shareBrowserData(shareData);
  };

  const handleCopy = async () => {
    setIsCopying(true);
    const copied = await copyTextToClipboard(url);
    setIsCopying(false);

    if (!copied) {
      showAppErrorMessageToast("We couldn't copy that link in this browser.");
      return;
    }

    showAppSuccessToast("Link copied.", { id: "qr-share-link-copied" });
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
        <div className={cn("relative w-full", avatarImageSrc && "pt-8")}>
          <QrShareAvatar src={avatarImageSrc} />

          <div
            className={cn(
              "relative grid w-full gap-4 overflow-hidden rounded-2xl border border-border/50 bg-popover p-5 shadow-black/10 shadow-xl",
              avatarImageSrc && "pt-10",
            )}
          >
            <DialogClose className="absolute top-4 right-4 z-50 flex size-9 items-center justify-center rounded-full text-slate-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground">
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </DialogClose>

            <QrShareHeader
              description={description}
              shareTitle={shareTitle}
              title={title}
            />

            <QrShareCode shareTitle={shareTitle} url={url} />

            <QrShareBottomText bottomText={bottomText} />

            <p className="truncate text-center text-slate-muted text-xs">
              {getShareDestination(url)}
            </p>

            <div
              className={cn(
                "grid gap-2",
                canShare ? "grid-cols-2" : "grid-cols-1",
              )}
            >
              <Button
                type="button"
                variant="outline"
                loading={isCopying}
                onClick={() => {
                  void handleCopy();
                }}
                className="rounded-xl"
              >
                <Copy className="size-4" aria-hidden="true" />
                Copy link
              </Button>
              {canShare ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    void handleShare();
                  }}
                  className="rounded-xl"
                >
                  <Share className="size-4" aria-hidden="true" />
                  Share
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
