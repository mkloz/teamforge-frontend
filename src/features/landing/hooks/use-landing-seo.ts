import { useEffect } from "react";

export function useLandingSEO() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "TeamForge | Find your people, intelligently.";

    const metaDescription = document.querySelector('meta[name="description"]');
    const previousDescription = metaDescription?.getAttribute("content");

    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "TeamForge forms small, compatible groups for shared real-world activities using advanced personality and interest matching.",
      );
    }

    return () => {
      document.title = previousTitle;
      if (metaDescription && previousDescription) {
        metaDescription.setAttribute("content", previousDescription);
      }
    };
  }, []);
}
