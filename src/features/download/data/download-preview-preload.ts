import { DOWNLOAD_PREVIEW_IMAGES } from "@/features/download/data/download-preview-images";

type DownloadPreviewDevice = keyof typeof DOWNLOAD_PREVIEW_IMAGES;

export function preloadDownloadPreviewImage() {
  if (typeof document === "undefined") {
    return;
  }

  const image = getDownloadPreviewImageForDevice();
  const existingPreload = document.head.querySelector(
    `link[rel="preload"][as="image"][href="${image.src}"]`,
  );

  if (existingPreload) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "preload";
  link.setAttribute("as", "image");
  link.setAttribute("href", image.src);
  link.setAttribute("imagesrcset", image.srcSet);
  link.setAttribute("imagesizes", image.sizes);
  link.setAttribute("fetchpriority", "high");
  document.head.appendChild(link);
}

function getDownloadPreviewImageForDevice() {
  if (typeof navigator === "undefined") {
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
  return navigator.userAgent;
}

function isIosLikeDevice() {
  const userAgent = getNavigatorUserAgent();

  return isIosUserAgent(userAgent.toLowerCase()) || isTouchMac(userAgent);
}

function isIosUserAgent(userAgent: string) {
  return /iphone|ipad|ipod/.test(userAgent);
}

function isTouchMac(userAgent: string) {
  return userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1;
}

function isAndroidDevice() {
  return getNavigatorUserAgent().toLowerCase().includes("android");
}
