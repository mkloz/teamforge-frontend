import { DeferredPwaSections } from "@/features/download/components/deferred-pwa-sections";
import { DownloadHeroSection } from "@/features/download/components/download-hero";
import { InstallBenefitsSection } from "@/features/download/components/install-benefits";
import { InstallStepsSection } from "@/features/download/components/install-steps";
import { getSelectedDeviceStepConfig } from "@/features/download/data/download-install-steps";
import { DOWNLOAD_PAGE_METADATA } from "@/features/download/download-page.metadata";
import { useDownloadPage } from "@/features/download/hooks/use-download-page";
import {
  Footer,
  Navbar,
} from "@/shared/components/public-site/public-site-shell";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";

export function DownloadPage() {
  usePageMetadata(DOWNLOAD_PAGE_METADATA);

  const {
    desktopBrowser,
    detected,
    downloadQrUrl,
    handleInstallClick,
    installState,
    isStandalone,
    selectedDevice,
    setSelectedDevice,
    viewState,
  } = useDownloadPage();
  const stepConfig = getSelectedDeviceStepConfig(
    selectedDevice,
    desktopBrowser,
  );

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Navbar
        actionSet="download"
        forceSolid
        staticPublicTheme
        installAction={
          viewState.canUseNativePrompt
            ? {
                isLoading: installState === "prompting",
                onInstallClick: handleInstallClick,
              }
            : undefined
        }
      />

      <main>
        <DownloadHeroSection
          desktopBrowser={desktopBrowser}
          detected={detected}
          downloadQrUrl={downloadQrUrl}
          installState={installState}
          isStandalone={isStandalone}
          onInstallClick={handleInstallClick}
          onSelectedDeviceChange={setSelectedDevice}
          selectedDevice={selectedDevice}
          viewState={viewState}
        />

        <InstallStepsSection
          installState={installState}
          onInstallClick={handleInstallClick}
          onSelectedDeviceChange={setSelectedDevice}
          selectedDevice={selectedDevice}
          stepConfig={stepConfig}
          viewState={viewState}
        />

        <DeferredPwaSections />

        <InstallBenefitsSection />
      </main>
      <Footer />
    </div>
  );
}
