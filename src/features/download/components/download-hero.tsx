import { DownloadDeviceTabs } from "@/features/download/components/download-hero/device-tabs";
import { HeroCTAButtons } from "@/features/download/components/download-hero/hero-cta";
import { DownloadHeroGrid } from "@/features/download/components/download-hero/hero-grid";
import { HeroInstallFeedback } from "@/features/download/components/download-hero/install-feedback";
import { DownloadHeroQrTrigger } from "@/features/download/components/download-hero/qr-trigger";
import { HeroVisual } from "@/features/download/components/download-hero/visual-preview";
import type {
  DesktopBrowser,
  DetectedPlatform,
  DownloadPageViewState,
  InstallState,
  SelectedDevice,
} from "@/features/download/download-page-view-state";

interface DownloadHeroSectionProps {
  desktopBrowser: DesktopBrowser;
  detected: DetectedPlatform;
  downloadQrUrl: string;
  installState: InstallState;
  isStandalone: boolean;
  onInstallClick: () => void;
  onSelectedDeviceChange: (value: SelectedDevice) => void;
  selectedDevice: SelectedDevice;
  viewState: DownloadPageViewState;
}

export function DownloadHeroSection({
  desktopBrowser,
  detected,
  downloadQrUrl,
  installState,
  isStandalone,
  onInstallClick,
  onSelectedDeviceChange,
  selectedDevice,
  viewState,
}: DownloadHeroSectionProps) {
  return (
    <section
      className="dark public-forge-theme relative min-h-svh overflow-hidden border-canvas border-b bg-hero-bg pt-16"
      aria-label="Install TeamForge"
    >
      <DownloadHeroGrid />

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl grid-cols-1 gap-10 px-6 py-10 sm:py-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex min-h-0 flex-col items-center justify-center text-center lg:items-start lg:text-left">
          <h1 className="mb-4 text-balance font-extrabold text-4xl text-white leading-none sm:text-5xl lg:text-6xl">
            Your groups, <span className="text-foreground">one tap away.</span>
          </h1>

          <p className="mb-8 max-w-md text-pretty text-base text-text-dark-secondary leading-relaxed">
            Install TeamForge from your browser. No app store is needed. Select
            your device for step-by-step instructions.
          </p>

          <DownloadDeviceTabs
            ariaLabel="Select your device"
            value={selectedDevice}
            onChange={onSelectedDeviceChange}
          />

          <p className="mt-5 mb-7 min-h-12 w-full max-w-md text-pretty text-sm text-text-dark-secondary leading-relaxed">
            {viewState.heroSubtitle}
          </p>

          <HeroCTAButtons
            selectedDevice={selectedDevice}
            detected={detected}
            isStandalone={isStandalone}
            canUseNativePrompt={viewState.canUseNativePrompt}
            installState={installState}
            desktopBrowser={desktopBrowser}
            onInstallClick={onInstallClick}
          />

          <HeroInstallFeedback
            feedback={viewState.feedback}
            isStandalone={isStandalone}
          />
        </div>

        <div className="hidden items-center justify-center lg:flex lg:justify-end">
          <HeroVisual selectedDevice={selectedDevice} />
        </div>
      </div>

      <DownloadHeroQrTrigger downloadQrUrl={downloadQrUrl} />
    </section>
  );
}
