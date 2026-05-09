import { Image } from "@/shared/components/common/image";
import type { LinkPreview as LinkPreviewData } from "@/shared/schemas";

interface LinkPreviewMediaProps {
  data: LinkPreviewData;
}

export function LinkPreviewMedia({ data }: LinkPreviewMediaProps) {
  if (!data.image) {
    return null;
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-muted/40">
      <Image
        src={data.image}
        alt={data.title ?? ""}
        className="transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );
}
