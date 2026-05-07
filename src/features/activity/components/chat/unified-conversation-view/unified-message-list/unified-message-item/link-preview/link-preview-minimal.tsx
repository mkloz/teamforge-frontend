import { ExternalLink, Globe } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import { getLinkPreviewHostname } from "./link-preview-state";

interface LinkPreviewMinimalProps {
  isOwn: boolean;
  url: string;
}

export function LinkPreviewMinimal({ isOwn, url }: LinkPreviewMinimalProps) {
  const hostname = getLinkPreviewHostname(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium",
        "group border border-border/40 transition-colors duration-150 hover:bg-muted/50",
        isOwn
          ? "border-primary/20 bg-white/20 text-foreground hover:bg-white/30"
          : "bg-muted/30 text-slate-muted",
      )}
    >
      <Globe size={12} strokeWidth={1.5} className="shrink-0 opacity-60" />
      <span className="truncate">{hostname}</span>
      <ExternalLink
        size={10}
        className="ml-auto shrink-0 opacity-0 transition-opacity group-hover:opacity-60"
      />
    </a>
  );
}
