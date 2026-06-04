import QRCodeStyling from "qr-code-styling";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/utils";

interface StyledQrCodeProps {
  className?: string;
  imageSrc?: string | null;
  url: string;
}

function getQrCodeImageOptions(imageSrc: string | null) {
  return imageSrc
    ? {
        image: imageSrc,
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 24,
          imageSize: 0.25,
          hideBackgroundDots: true,
        },
      }
    : {};
}

export function StyledQrCode({
  className,
  imageSrc = "/icons/pwa-512x512.png",
  url,
}: StyledQrCodeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [qrCode] = useState(
    () =>
      new QRCodeStyling({
        width: 960,
        height: 960,
        type: "canvas",
        data: url,
        ...getQrCodeImageOptions(imageSrc),
        qrOptions: {
          errorCorrectionLevel: "H",
        },
        dotsOptions: {
          color: "#0D9488",
          type: "extra-rounded",
        },
        backgroundOptions: {
          color: "transparent",
        },
        cornersSquareOptions: {
          color: "#0D9488",
          type: "rounded",
        },
        cornersDotOptions: {
          color: "#0D9488",
          type: "dot",
        },
      }),
  );

  useEffect(() => {
    const container = ref.current;

    if (!container) {
      return undefined;
    }

    container.innerHTML = "";
    qrCode.append(container);

    return () => {
      container.innerHTML = "";
    };
  }, [qrCode]);

  useEffect(() => {
    qrCode.update({ data: url, ...getQrCodeImageOptions(imageSrc) });
  }, [imageSrc, qrCode, url]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative mx-auto block aspect-square w-full max-w-64 overflow-hidden rounded-xl [&_canvas]:h-full! [&_canvas]:w-full!",
        className,
      )}
    />
  );
}
