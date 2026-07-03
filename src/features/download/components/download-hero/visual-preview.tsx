import {
  DOWNLOAD_PREVIEW_IMAGES,
  type DownloadPreviewImage,
} from "@/features/download/data/download-preview-images";
import type { SelectedDevice } from "@/features/download/download-page-view-state";
import { cn } from "@/shared/lib/utils";

export function HeroVisual({
  selectedDevice,
}: {
  selectedDevice: SelectedDevice;
}) {
  const isDesktop = selectedDevice === "desktop";
  const isIos = selectedDevice === "ios";

  return (
    <div
      className={cn(
        "relative flex w-full min-w-0 items-center justify-center py-8 sm:py-10 lg:py-0",
        isDesktop
          ? "max-w-120 lg:justify-end"
          : isIos
            ? "max-w-140"
            : "max-w-[20rem]",
      )}
    >
      {selectedDevice === "ios" ? (
        <IpadVisual />
      ) : selectedDevice === "android" ? (
        <AndroidPhoneVisual />
      ) : (
        <DesktopBrowserVisual />
      )}
    </div>
  );
}

function IpadVisual() {
  return (
    <div
      className="relative w-full animate-download-device-drift select-none motion-reduce:animate-none"
      aria-hidden="true"
    >
      <div className="absolute inset-8 -z-10 scale-95 rounded-4xl bg-forge-teal/50 opacity-25 blur-3xl" />
      <div className="relative mx-auto w-full max-w-140 rounded-4xl border-8 border-black/80 bg-forge-deep-panel shadow-teal-glow-lg ring-1 ring-white/10">
        <div className="absolute top-1/2 left-2 z-10 size-2 -translate-y-1/2 rounded-full bg-white/15" />
        <div className="absolute top-14 -right-1 h-14 w-1 rounded-r-full bg-white/10" />
        <div className="absolute bottom-1 left-1/2 z-10 h-1 w-20 -translate-x-1/2 rounded-full bg-white/20" />
        <PreviewScreenImage
          image={DOWNLOAD_PREVIEW_IMAGES.ios}
          className="rounded-[1.65rem]"
        />
      </div>
    </div>
  );
}

function AndroidPhoneVisual() {
  return (
    <div
      className="relative w-full min-w-0 animate-download-device-drift select-none motion-reduce:animate-none"
      aria-hidden="true"
    >
      <div className="absolute inset-6 -z-10 scale-95 rounded-[3rem] bg-forge-teal/50 opacity-30 blur-3xl" />
      <div className="relative mx-auto w-full max-w-64 rounded-[3rem] border-8 border-black/80 bg-black/80 shadow-teal-glow-lg ring-1 ring-white/10 sm:max-w-68">
        <div className="absolute top-24 -right-1 z-10 h-16 w-1 rounded-r-full bg-white/10" />
        <div className="absolute top-3 left-1/2 z-20 size-2 -translate-x-1/2 rounded-full bg-white/15" />
        <PreviewScreenImage
          image={DOWNLOAD_PREVIEW_IMAGES.android}
          className="rounded-[2.4rem]"
        />
        <div className="absolute bottom-1 left-1/2 z-20 h-1 w-20 -translate-x-1/2 rounded-full bg-white/18" />
      </div>
    </div>
  );
}

function DesktopBrowserVisual() {
  return (
    <div className="relative w-full select-none" aria-hidden="true">
      <div className="absolute inset-4 -z-10 scale-105 rounded-3xl bg-forge-teal/50 opacity-25 blur-3xl" />
      <div className="relative mx-auto w-full max-w-120 pb-9">
        <div className="rounded-4xl border-8 border-black/80 bg-black/80 p-2 shadow-teal-glow-lg ring-1 ring-white/10">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-forge-deep-panel">
            <PreviewScreenImage image={DOWNLOAD_PREVIEW_IMAGES.desktop} />
          </div>
        </div>

        <div className="mx-auto h-7 w-24 rounded-b-xl border-white/10 border-x border-b bg-black/70" />
        <div className="mx-auto h-2 w-44 rounded-full border border-white/10 bg-black/70" />
      </div>
    </div>
  );
}

interface PreviewScreenImageProps {
  className?: string;
  image: DownloadPreviewImage;
}

function PreviewScreenImage({ className, image }: PreviewScreenImageProps) {
  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={image.sizes}
      width={image.width}
      height={image.height}
      alt=""
      decoding="async"
      fetchPriority="high"
      loading="eager"
      draggable={false}
      className={cn("block h-auto w-full object-cover", className)}
    />
  );
}
