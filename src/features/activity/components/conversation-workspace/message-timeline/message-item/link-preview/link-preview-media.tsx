import { ErrorLinkPreviewUnavailableVisual } from "@/features/activity/assets/error-link-preview-unavailable";
import { Image } from "@/shared/components/common/image";
import type { LinkPreview as LinkPreviewData } from "@/shared/schemas";

interface LinkPreviewMediaProps {
  data: LinkPreviewData;
}

export function LinkPreviewMedia({ data }: LinkPreviewMediaProps) {
  if (!data.image) {
    return <LinkPreviewUnavailable />;
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-muted/40">
      <Image
        src={data.image}
        alt={data.title ?? ""}
        className="transition-transform duration-500 group-hover:scale-105"
        fallbackComponent={<LinkPreviewUnavailable />}
        noImageComponent={<LinkPreviewUnavailable />}
      />
    </div>
  );
}

function LinkPreviewUnavailable() {
  return (
    <div className="flex size-full min-h-32 flex-col items-center justify-center gap-2 bg-muted/40 text-center">
      <ErrorLinkPreviewUnavailableVisual className="h-16 w-auto text-foreground" />
      <span className="font-medium text-muted-foreground text-xs">
        Preview unavailable
      </span>
    </div>
  );
}
