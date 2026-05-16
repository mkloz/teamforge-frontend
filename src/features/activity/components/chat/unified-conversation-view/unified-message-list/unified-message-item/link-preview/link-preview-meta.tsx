import { ExternalLink, Globe } from "lucide-react";

import { Image } from "@/shared/components/common/image";
import { cn } from "@/shared/lib/utils";
import type { LinkPreview as LinkPreviewData } from "@/shared/schemas";

interface LinkPreviewMetaProps {
  data: LinkPreviewData;
  hasImage: boolean;
  hostname: string;
  isOwn: boolean;
}

export function LinkPreviewMeta({
  data,
  hasImage,
  hostname,
  isOwn,
}: LinkPreviewMetaProps) {
  const sourceLabel = data.siteName?.trim() || hostname;
  const title = data.title?.trim();
  const description = data.description?.trim();

  return (
    <div
      className={cn(
        "flex min-w-0 gap-2.5 px-2.5 py-2",
        hasImage ? "items-start" : "w-full items-center",
      )}
    >
      {!hasImage ? (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-forge-teal/20 bg-forge-teal/10 text-forge-teal">
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
        </span>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={cn(
              "truncate font-bold text-xs leading-tight",
              hasImage && "uppercase tracking-wide",
              isOwn ? "text-ink/80" : "text-slate-muted",
            )}
          >
            {sourceLabel}
          </span>

          {!hasImage ? (
            <ExternalLink
              size={12}
              strokeWidth={1.75}
              className="shrink-0 text-slate-muted transition-colors duration-150 group-hover:text-forge-teal"
              aria-hidden
            />
          ) : null}
        </div>

        {title ? (
          <p
            className={cn(
              "line-clamp-2 font-bold leading-snug",
              hasImage ? "text-xs" : "text-sm",
              isOwn ? "text-foreground" : "text-ink",
            )}
          >
            {title}
          </p>
        ) : null}

        {description ? (
          <p
            className={cn(
              "line-clamp-2 text-xs leading-relaxed",
              isOwn ? "text-ink/75" : "text-slate-muted",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {hasImage ? (
        <ExternalLink
          size={12}
          strokeWidth={1.5}
          className={cn(
            "mt-0.5 shrink-0 self-start opacity-0 transition-opacity duration-150 group-hover:opacity-50",
            isOwn ? "text-foreground" : "text-slate-muted",
          )}
          aria-hidden
        />
      ) : null}
    </div>
  );
}
