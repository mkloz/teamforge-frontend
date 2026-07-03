import { DOWNLOAD_PREVIEW_IMAGES } from "@/features/download/data/download-preview-images";
import {
  getBrowserDocument,
  getBrowserNavigator,
} from "@/shared/lib/browser-environment";

type DownloadPreviewDevice = keyof typeof DOWNLOAD_PREVIEW_IMAGES;

export function preloadDownloadPreviewImage() {
  const browserDocument = getBrowserDocument();

  if (!browserDocument) {
    return;
  }

  const image = getDownloadPreviewImageForDevice();
  const existingPreload = browserDocument.head.querySelector(
    `link[rel="preload"][as="image"][href="${image.src}"]`,
  );

  if (existingPreload) {
    return;
  }

  const link = browserDocument.createElement("link");
  link.rel = "preload";
  link.setAttribute("as", "image");
  link.setAttribute("href", image.src);
  link.setAttribute("imagesrcset", image.srcSet);
  link.setAttribute("imagesizes", image.sizes);
  link.setAttribute("fetchpriority", "high");
  browserDocument.head.appendChild(link);
}

function getDownloadPreviewImageForDevice() {
  if (!getBrowserNavigator()) {
    return DOWNLOAD_PREVIEW_IMAGES.desktop;
  }

  return DOWNLOAD_PREVIEW_IMAGES[getDownloadPreviewDevice()];
}

function getDownloadPreviewDevice(): DownloadPreviewDevice {
  if (isIosLikeDevice()) {
    return "ios";
  }

  if (isAndroidDevice()) {
    return "android";
  }

  return "desktop";
}

function getNavigatorUserAgent() {
  return getBrowserNavigator()?.userAgent ?? "";
}

function isIosLikeDevice() {
  const userAgent = getNavigatorUserAgent();

  return isIosUserAgent(userAgent.toLowerCase()) || isTouchMac(userAgent);
}

function isIosUserAgent(userAgent: string) {
  return /iphone|ipad|ipod/.test(userAgent);
}

function isTouchMac(userAgent: string) {
  return (
    userAgent.includes("Macintosh") &&
    (getBrowserNavigator()?.maxTouchPoints ?? 0) > 1
  );
}

function isAndroidDevice() {
  return getNavigatorUserAgent().toLowerCase().includes("android");
}
