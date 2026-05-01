import { LANDING_SEO } from "@/features/landing/constants/landing-seo";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";

export function useLandingSEO() {
  usePageMetadata(LANDING_SEO);
}
