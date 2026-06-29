import { useState } from "react";
import { buildAppUrl } from "@/shared/lib/app-url";

const DOWNLOAD_PAGE_LINK_COPY_RESET_MS = 2500;

export function useDownloadPageLinkCopy() {
  const [copied, setCopied] = useState(false);

  async function copyCurrentPageUrl() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, DOWNLOAD_PAGE_LINK_COPY_RESET_MS);
  }

  return { copied, copyCurrentPageUrl };
}

export function getDownloadPageLink() {
  return typeof window !== "undefined"
    ? window.location.href
    : buildAppUrl("/download");
}
