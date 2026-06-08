import { memo } from "react";
import { useLinkPreview } from "@/features/activity/hooks/use-link-preview";
import { cn } from "@/shared/lib/utils";

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

  const { hasImage, hasMetadata, hostname } = getLinkPreviewState(url, data);

  if (!hasImage && !hasMetadata) {
    return <LinkPreviewMinimal url={url} isOwn={isOwn} />;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "group min-w-0 max-w-full overflow-hidden border transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        hasImage
          ? "flex flex-col rounded-xl hover:shadow-sm"
          : "flex rounded-lg",
        hasImage
          ? isOwn
            ? "border-primary/10 bg-white/25 hover:bg-white/40 dark:bg-black/25 dark:hover:bg-black/40"
            : "border-border/50 bg-card hover:border-border"
          : isOwn
            ? "border-primary/20 bg-canvas/80 hover:border-primary/30 hover:bg-canvas dark:bg-card/60 dark:hover:bg-card/80"
            : "border-border/55 bg-muted/35 hover:border-primary/25 hover:bg-muted/50",
      )}
    >
      {hasImage ? <LinkPreviewMedia data={data} /> : null}
      <LinkPreviewMeta
        data={data}
        hasImage={hasImage}
        hostname={hostname}
        isOwn={isOwn}
      />
    </a>
  );
});
