import { ExternalLink } from "lucide-react";

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
  return (
    <div className={cn("flex gap-2.5 px-2.5 py-2", !hasImage && "py-2.5")}>
      {data.favicon && !hasImage && (
        <Image
          src={data.favicon}
          alt=""
          wrapperClassName="mt-0.5 size-5 shrink-0 rounded"
          className="object-contain opacity-80"
          loadingComponent={null}
          fallbackComponent={null}
          showNoImage={false}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "truncate text-xs font-semibold tracking-wider uppercase",
            isOwn
              ? "text-primary dark:text-primary-foreground/50"
              : "text-forge-teal/80",
          )}
        >
          {hostname}
        </span>

        {data.title && (
          <p
            className={cn(
              "line-clamp-2 text-xs leading-snug font-semibold",
              isOwn ? "text-foreground" : "text-ink",
            )}
          >
            {data.title}
          </p>
        )}

        {data.description && (
          <p
            className={cn(
              "line-clamp-2 text-xs leading-relaxed",
              isOwn ? "text-foreground/70" : "text-slate-muted",
            )}
          >
            {data.description}
          </p>
        )}
      </div>

      <ExternalLink
        size={12}
        strokeWidth={1.5}
        className={cn(
          "mt-0.5 shrink-0 self-start opacity-0 transition-opacity duration-150 group-hover:opacity-50",
          isOwn ? "text-foreground" : "text-slate-muted",
        )}
        aria-hidden
      />
    </div>
  );
}
