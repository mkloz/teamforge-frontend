import { memo } from "react";
import { ExternalLink, Globe } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useLinkPreview } from "@/features/activity/hooks/use-link-preview";

interface LinkPreviewProps {
  url: string;
  isOwn?: boolean;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function LinkPreviewSkeleton({ isOwn }: { isOwn: boolean }) {
  const pulse = isOwn
    ? "bg-white/15 animate-pulse"
    : "bg-muted/80 animate-pulse";
  return (
    <div
      className={cn(
        "flex gap-3 p-2.5 rounded-xl",
        isOwn ? "bg-black/10" : "bg-muted/40 border border-border/40",
      )}
    >
      {/* Thumbnail placeholder */}
      <div className={cn("w-14 h-14 rounded-lg shrink-0", pulse)} />
      <div className="flex flex-col gap-1.5 flex-1 justify-center min-w-0">
        <div className={cn("h-2.5 rounded-full w-3/4", pulse)} />
        <div className={cn("h-2 rounded-full w-full", pulse)} />
        <div className={cn("h-2 rounded-full w-1/2", pulse)} />
      </div>
    </div>
  );
}

// ─── Error / minimal fallback ─────────────────────────────────────────────────

function LinkPreviewMinimal({ url, isOwn }: { url: string; isOwn: boolean }) {
  let hostname = url;
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    /* noop */
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium",
        "border border-border/40 hover:bg-muted/50 transition-colors duration-150 group",
        isOwn
          ? "bg-white/20 text-foreground border-primary/20 hover:bg-white/30"
          : "bg-muted/30 text-slate-muted",
      )}
    >
      <Globe size={12} strokeWidth={1.5} className="shrink-0 opacity-60" />
      <span className="truncate">{hostname}</span>
      <ExternalLink
        size={10}
        className="shrink-0 opacity-0 group-hover:opacity-60 transition-opacity ml-auto"
      />
    </a>
  );
}

// ─── Rich card ────────────────────────────────────────────────────────────────

/**
 * LinkPreview — renders Open Graph metadata for a URL inside a chat bubble.
 *
 * States:
 *  - Loading  → animated skeleton
 *  - Error    → minimal hostname pill with external link
 *  - Success  → rich card (thumbnail + title + description + domain)
 */
export const LinkPreview = memo(function LinkPreview({
  url,
  isOwn = false,
}: LinkPreviewProps) {
  const { data, isLoading, isError } = useLinkPreview(url);

  if (isLoading) return <LinkPreviewSkeleton isOwn={isOwn} />;
  if (isError || !data) return <LinkPreviewMinimal url={url} isOwn={isOwn} />;

  let hostname = url;
  try {
    hostname = new URL(data.url).hostname.replace(/^www\./, "");
  } catch {
    /* noop */
  }

  const hasImage = !!data.image;

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
      {/* ── Thumbnail ── */}
      {hasImage && (
        <div className="relative w-full aspect-[2.4/1] overflow-hidden bg-muted/40">
          <img
            src={data.image}
            alt={data.title ?? ""}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            onError={(e) => {
              // Hide the whole image container if it fails
              (e.currentTarget.parentElement as HTMLElement).style.display =
                "none";
            }}
          />
        </div>
      )}

      {/* ── Meta ── */}
      <div className={cn("flex gap-2.5 px-2.5 py-2", !hasImage && "py-2.5")}>
        {/* Favicon */}
        {data.favicon && !hasImage && (
          <img
            src={data.favicon}
            alt=""
            className="w-5 h-5 rounded object-contain shrink-0 mt-0.5 opacity-80"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          {/* Domain */}
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-widest truncate",
              isOwn
                ? "text-primary dark:text-primary-foreground/50"
                : "text-forge-teal/80",
            )}
          >
            {hostname}
          </span>

          {/* Title */}
          {data.title && (
            <p
              className={cn(
                "text-xs font-semibold leading-snug line-clamp-2",
                isOwn ? "text-foreground" : "text-ink",
              )}
            >
              {data.title}
            </p>
          )}

          {/* Description */}
          {data.description && (
            <p
              className={cn(
                "text-[10px] leading-relaxed line-clamp-2",
                isOwn ? "text-foreground/70" : "text-slate-muted",
              )}
            >
              {data.description}
            </p>
          )}
        </div>

        {/* Open icon */}
        <ExternalLink
          size={12}
          strokeWidth={1.5}
          className={cn(
            "shrink-0 self-start mt-0.5 opacity-0 group-hover:opacity-50 transition-opacity duration-150",
            isOwn ? "text-foreground" : "text-slate-muted",
          )}
          aria-hidden
        />
      </div>
    </a>
  );
});
