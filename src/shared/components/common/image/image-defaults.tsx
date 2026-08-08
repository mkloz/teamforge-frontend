import { Spinner } from "@/shared/components/ui/spinner";
import { ImagePlaceholder } from "../image-placeholder";

export const DEFAULT_LOADING_COMPONENT = (
  <div className="flex size-8 items-center justify-center rounded-full bg-background/80 p-1 shadow-sm">
    <Spinner className="size-4 text-foreground" />
  </div>
);

export const DEFAULT_IMAGE_PLACEHOLDER = <ImagePlaceholder />;
