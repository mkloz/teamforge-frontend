import { useLinkPreview } from "@/features/activity/hooks/use-link-preview";
import { cn } from "@/shared/lib/utils";
import { memo } from "react";

import { LinkPreviewMedia } from "./link-preview-media";
import { LinkPreviewMeta } from "./link-preview-meta";
import { LinkPreviewMinimal } from "./link-preview-minimal";
import { LinkPreviewSkeleton } from "./link-preview-skeleton";
import { getLinkPreviewState } from "./link-preview-state";

interface LinkPreviewProps {
  url: string;
  isOwn?: boolean;
}

export const LinkPreview = memo(function LinkPreview({
  url,
  isOwn = false,
}: LinkPreviewProps) {
  const { data, isLoading, isError } = useLinkPreview(url);

  if (isLoading) return <LinkPreviewSkeleton isOwn={isOwn} />;
  if (isError || !data) return <LinkPreviewMinimal url={url} isOwn={isOwn} />;

  const { hasImage, hostname } = getLinkPreviewState(url, data);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "flex flex-col rounded-xl overflow-hidden group",
        "border transition-colors duration-150",
        "hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/40",
        isOwn
          ? "bg-white/25 dark:bg-black/25 border-primary/10 hover:bg-white/40 dark:hover:bg-black/40"
          : "bg-card border-border/50 hover:border-border",
      )}
    >
      <LinkPreviewMedia data={data} />
      <LinkPreviewMeta
        data={data}
        hasImage={hasImage}
        hostname={hostname}
        isOwn={isOwn}
      />
    </a>
  );
});
