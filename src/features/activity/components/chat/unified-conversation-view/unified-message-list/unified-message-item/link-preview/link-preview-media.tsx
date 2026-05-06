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
    <div className="relative w-full aspect-[2.4/1] overflow-hidden bg-muted/40">
      <Image
        src={data.image}
        alt={data.title ?? ""}
        className="transition-[scale,transform] duration-500 group-hover:scale-[1.03]"
      />
    </div>
  );
}
