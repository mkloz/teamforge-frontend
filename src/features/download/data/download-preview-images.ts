import type { SelectedDevice } from "@/features/download/download-page-view-state";

export interface DownloadPreviewImage {
  height: number;
  sizes: string;
  src: string;
  srcSet: string;
  width: number;
}

export const DOWNLOAD_PREVIEW_IMAGES = {
  android: {
    height: 900,
    sizes: "(min-width: 640px) 17rem, min(20rem, calc(100vw - 3rem))",
    src: "/download/install-preview-android.png",
    srcSet:
      "/download/install-preview-android-256w.png 256w, /download/install-preview-android-360w.png 360w, /download/install-preview-android.png 465w",
    width: 465,
  },
  desktop: {
    height: 510,
    sizes: "(min-width: 1024px) 30rem, min(30rem, calc(100vw - 3rem))",
    src: "/download/install-preview-desktop.png",
    srcSet:
      "/download/install-preview-desktop-480w.png 480w, /download/install-preview-desktop.png 815w",
    width: 815,
  },
  ios: {
    height: 647,
    sizes: "(min-width: 1024px) 35rem, min(35rem, calc(100vw - 3rem))",
    src: "/download/install-preview-ios.png",
    srcSet:
      "/download/install-preview-ios-480w.png 480w, /download/install-preview-ios-720w.png 720w, /download/install-preview-ios.png 984w",
    width: 984,
  },
} as const satisfies Record<SelectedDevice, DownloadPreviewImage>;
