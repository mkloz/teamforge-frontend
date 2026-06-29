import { useLinkPreview } from "@/features/activity/hooks/use-link-preview";
import { cn } from "@/shared/lib/utils";
import type { LinkPreview as LinkPreviewData } from "@/shared/schemas";

import { LinkPreviewMedia } from "./link-preview-media";
import { LinkPreviewMeta } from "./link-preview-meta";
import { LinkPreviewMinimal } from "./link-preview-minimal";
import { LinkPreviewSkeleton } from "./link-preview-skeleton";
import { getLinkPreviewState } from "./link-preview-state";

interface LinkPreviewProps {
  url: string;
  isOwn?: boolean;
}

type LinkPreviewRenderState =
  | { kind: "loading" }
  | { kind: "minimal" }
  | {
      className: string;
      data: LinkPreviewData;
      hasImage: boolean;
      hostname: string;
      kind: "preview";
    };

const LINK_PREVIEW_BASE_CLASS =
  "group min-w-0 max-w-full overflow-hidden border transition-colors duration-150";
const LINK_PREVIEW_FOCUS_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

const LINK_PREVIEW_LAYOUT_CLASS = {
  image: "flex flex-col rounded-xl hover:shadow-sm",
  text: "flex rounded-lg",
} as const;

const LINK_PREVIEW_SURFACE_CLASS = {
  image: {
    own: "border-primary/10 bg-white/25 hover:bg-white/40 dark:bg-black/25 hover:dark:bg-black/40",
    other: "border-border/50 bg-card hover:border-border",
  },
  text: {
    own: "border-primary/20 bg-canvas/80 hover:border-primary/30 hover:bg-canvas dark:bg-card/60 hover:dark:bg-card/80",
    other:
      "border-border/55 bg-muted/35 hover:border-primary/25 hover:bg-muted/50",
  },
} as const;

type LinkPreviewLayoutKey = keyof typeof LINK_PREVIEW_LAYOUT_CLASS;
type LinkPreviewOwnerKey = keyof (typeof LINK_PREVIEW_SURFACE_CLASS)["image"];

function getLinkPreviewClassName({
  hasImage,
  isOwn,
}: {
  hasImage: boolean;
  isOwn: boolean;
}) {
  const layoutKey = getLinkPreviewLayoutKey(hasImage);
  const ownerKey = getLinkPreviewOwnerKey(isOwn);

  return cn(
    LINK_PREVIEW_BASE_CLASS,
    LINK_PREVIEW_FOCUS_CLASS,
    LINK_PREVIEW_LAYOUT_CLASS[layoutKey],
    LINK_PREVIEW_SURFACE_CLASS[layoutKey][ownerKey],
  );
}

function getLinkPreviewLayoutKey(hasImage: boolean): LinkPreviewLayoutKey {
  return hasImage ? "image" : "text";
}

function getLinkPreviewOwnerKey(isOwn: boolean): LinkPreviewOwnerKey {
  return isOwn ? "own" : "other";
}

export function LinkPreview({ url, isOwn = false }: LinkPreviewProps) {
  const { data, isLoading, isError } = useLinkPreview(url);
  const renderState = getLinkPreviewRenderState({
    data,
    isError,
    isLoading,
    isOwn,
    url,
  });

  if (renderState.kind === "loading") {
    return <LinkPreviewSkeleton isOwn={isOwn} />;
  }

  if (renderState.kind === "minimal") {
    return <LinkPreviewMinimal url={url} isOwn={isOwn} />;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={renderState.className}
    >
      {renderState.hasImage ? (
        <LinkPreviewMedia data={renderState.data} />
      ) : null}
      <LinkPreviewMeta
        data={renderState.data}
        hasImage={renderState.hasImage}
        hostname={renderState.hostname}
        isOwn={isOwn}
      />
    </a>
  );
}

function getLinkPreviewRenderState({
  data,
  isError,
  isLoading,
  isOwn,
  url,
}: {
  data: LinkPreviewData | null | undefined;
  isError: boolean;
  isLoading: boolean;
  isOwn: boolean;
  url: string;
}): LinkPreviewRenderState {
  if (isLoading) {
    return { kind: "loading" };
  }

  return getLoadedLinkPreviewRenderState({
    data,
    isError,
    isOwn,
    url,
  });
}

function getLoadedLinkPreviewRenderState({
  data,
  isError,
  isOwn,
  url,
}: {
  data: LinkPreviewData | null | undefined;
  isError: boolean;
  isOwn: boolean;
  url: string;
}): LinkPreviewRenderState {
  if (isError || !data) {
    return { kind: "minimal" };
  }

  return getResolvedLinkPreviewRenderState({ data, isOwn, url });
}

function getResolvedLinkPreviewRenderState({
  data,
  isOwn,
  url,
}: {
  data: LinkPreviewData;
  isOwn: boolean;
  url: string;
}): LinkPreviewRenderState {
  const previewState = getLinkPreviewState(url, data);

  if (!hasRenderableLinkPreview(previewState)) {
    return { kind: "minimal" };
  }

  return {
    kind: "preview",
    className: getLinkPreviewClassName({
      hasImage: previewState.hasImage,
      isOwn,
    }),
    data,
    hasImage: previewState.hasImage,
    hostname: previewState.hostname,
  };
}

function hasRenderableLinkPreview({
  hasImage,
  hasMetadata,
}: {
  hasImage: boolean;
  hasMetadata: boolean;
}) {
  return hasImage || hasMetadata;
}
