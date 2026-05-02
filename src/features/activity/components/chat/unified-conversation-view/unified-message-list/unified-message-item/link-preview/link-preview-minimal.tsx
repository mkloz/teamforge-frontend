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
