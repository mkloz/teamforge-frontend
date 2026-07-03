import type { LazyRouteModule } from "@/app/router/lazy-route-module";
import { preloadDownloadPreviewImage } from "@/features/download/data/download-preview-preload";

export function createRouteModuleLoader(module: LazyRouteModule) {
  return async () => {
    await module.preload();
  };
}

export function createDownloadRouteModuleLoader(module: LazyRouteModule) {
  return async () => {
    preloadDownloadPreviewImage();
    await module.preload();
  };
}
