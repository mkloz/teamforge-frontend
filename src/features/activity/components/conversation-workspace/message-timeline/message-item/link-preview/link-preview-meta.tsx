import { ExternalLink, Globe } from "lucide-react";

import { Image } from "@/shared/components/common/image";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";
import type { LinkPreview as LinkPreviewData } from "@/shared/schemas";

interface LinkPreviewMetaProps {
  data: LinkPreviewData;
  hasImage: boolean;
  hostname: string;
  isOwn: boolean;
}

interface LinkPreviewMetaState {
  description: string | undefined;
  sourceLabel: string;
  title: string | undefined;
}

export function LinkPreviewMeta({
  data,
  hasImage,
  hostname,
  isOwn,
}: LinkPreviewMetaProps) {
  const meta = getLinkPreviewMetaState(data, hostname);

  return (
    <div
      className={cn(
        "flex min-w-0 gap-2.5 px-2.5 py-2",
        hasImage ? "items-start" : "w-full items-center",
      )}
    >
      <LinkPreviewFavicon data={data} hasImage={hasImage} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <LinkPreviewSourceRow
          hasImage={hasImage}
          isOwn={isOwn}
          sourceLabel={meta.sourceLabel}
        />
        <LinkPreviewTitle
          hasImage={hasImage}
          isOwn={isOwn}
          title={meta.title}
        />
        <LinkPreviewDescription description={meta.description} isOwn={isOwn} />
      </div>

      <LinkPreviewTrailingIcon hasImage={hasImage} isOwn={isOwn} />
    </div>
  );
}

function LinkPreviewFavicon({
  data,
  hasImage,
}: Pick<LinkPreviewMetaProps, "data" | "hasImage">) {
  if (hasImage) {
    return null;
  }

  return (
    <IconTile
      size="md"
      shape="circle"
      tone="teal"
      bordered
      className="border-primary/20"
    >
      {data.favicon ? (
        <Image
          src={data.favicon}
          alt=""
          wrapperClassName="size-4 rounded-sm"
          className="object-contain"
          loadingComponent={null}
          fallbackComponent={<Globe className="size-4" />}
          showNoImage={false}
        />
      ) : (
        <Globe className="size-4" />
      )}
    </IconTile>
  );
}

function LinkPreviewSourceRow({
  hasImage,
  isOwn,
  sourceLabel,
}: {
  hasImage: boolean;
  isOwn: boolean;
  sourceLabel: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span
        className={cn(
          "truncate font-bold text-xs leading-tight",
          hasImage && "tracking-tight",
          isOwn ? "text-ink/80" : "text-slate-muted",
        )}
      >
        {sourceLabel}
      </span>

      {!hasImage ? (
        <ExternalLink
          size={12}
          strokeWidth={1.75}
          className="shrink-0 text-slate-muted transition-colors duration-150 group-hover:text-foreground"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

function LinkPreviewTitle({
  hasImage,
  isOwn,
  title,
}: {
  hasImage: boolean;
  isOwn: boolean;
  title: string | undefined;
}) {
  if (!title) {
    return null;
  }

  return (
    <p
      className={cn(
        "line-clamp-2 font-bold leading-snug",
        hasImage ? "text-xs" : "text-sm",
        isOwn ? "text-foreground" : "text-ink",
      )}
    >
      {title}
    </p>
  );
}

function LinkPreviewDescription({
  description,
  isOwn,
}: {
  description: string | undefined;
  isOwn: boolean;
}) {
  if (!description) {
    return null;
  }

  return (
    <p
      className={cn(
        "line-clamp-2 text-xs leading-relaxed",
        isOwn ? "text-ink/75" : "text-slate-muted",
      )}
    >
      {description}
    </p>
  );
}

function LinkPreviewTrailingIcon({
  hasImage,
  isOwn,
}: Pick<LinkPreviewMetaProps, "hasImage" | "isOwn">) {
  if (!hasImage) {
    return null;
  }

  return (
    <ExternalLink
      size={12}
      strokeWidth={1.5}
      className={cn(
        "mt-0.5 shrink-0 self-start opacity-0 transition-opacity duration-150 group-hover:opacity-50",
        isOwn ? "text-foreground" : "text-slate-muted",
      )}
      aria-hidden
    />
  );
}

function getLinkPreviewMetaState(
  data: LinkPreviewData,
  hostname: string,
): LinkPreviewMetaState {
  return {
    description: data.description?.trim(),
    sourceLabel: data.siteName?.trim() || hostname,
    title: data.title?.trim(),
  };
}
