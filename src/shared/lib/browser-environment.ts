export {
  addBrowserDocumentEventListener,
  getBrowserActiveElement,
  getBrowserDocument,
  getBrowserDocumentBody,
  getBrowserDocumentElement,
  getBrowserElementById,
  getBrowserVisibilityState,
  isBrowserDocumentVisible,
} from "@/shared/lib/browser-environment/document";
export {
  getBrowserLocalStorageItem,
  setBrowserLocalStorageItem,
} from "@/shared/lib/browser-environment/local-storage";
export {
  type BrowserNetworkInformation,
  getBrowserNavigator,
  getBrowserNetworkInformation,
  getBrowserServiceWorker,
  hasBrowserNavigator,
  hasBrowserServiceWorker,
  isBrowserOnline,
} from "@/shared/lib/browser-environment/navigator";
export {
  getBrowserSessionStorageItem,
  setBrowserSessionStorageItem,
} from "@/shared/lib/browser-environment/session-storage";
export {
  addBrowserWindowEventListener,
  decodeBrowserBase64,
  dispatchBrowserWindowEvent,
  getBrowserComputedStyle,
  getBrowserDevicePixelRatio,
  getBrowserLocation,
  getBrowserLocationHash,
  getBrowserLocationHref,
  getBrowserLocationOrigin,
  getBrowserMediaQuery,
  getBrowserScrollY,
  getBrowserViewportSize,
  getBrowserVisualViewport,
  getBrowserWindow,
  hasBrowserWindow,
  hasBrowserWindowFeature,
  isBrowserSecureContext,
  openBrowserWindow,
  reloadBrowserLocation,
  replaceBrowserLocation,
  scrollBrowserTo,
} from "@/shared/lib/browser-environment/window";
