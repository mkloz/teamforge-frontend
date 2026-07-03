import QrCode from "lucide-react/dist/esm/icons/qr-code.js";
import { QrShareDialog } from "@/shared/components/qr-share-dialog";
import { Button } from "@/shared/components/ui/button";

interface DownloadHeroQrTriggerProps {
  downloadQrUrl: string;
}

export function DownloadHeroQrTrigger({
  downloadQrUrl,
}: DownloadHeroQrTriggerProps) {
  return (
    <QrShareDialog
      url={downloadQrUrl}
      title="Install TeamForge"
      description="Scan this on your phone to open the install guide."
      trigger={
        <Button
          variant="outline"
          size="icon"
          className="absolute right-5 bottom-7 z-20 size-11 rounded-full border-white/25 bg-white/8 text-white backdrop-blur-md hover:translate-y-0! hover:border-forge-teal hover:bg-forge-teal/20 hover:shadow-none! focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-hero-bg active:translate-y-0! active:shadow-none! sm:right-8 sm:bottom-10"
          aria-label="Show install QR code"
        >
          <QrCode size={18} strokeWidth={2.25} aria-hidden="true" />
        </Button>
      }
    />
  );
}
