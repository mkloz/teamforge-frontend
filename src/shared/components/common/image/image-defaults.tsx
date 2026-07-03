import { Loader2 } from "lucide-react";

import { ImagePlaceholder } from "../image-placeholder";

export const DEFAULT_LOADING_COMPONENT = (
  <div className="flex size-8 items-center justify-center rounded-full bg-background/80 p-1 shadow-sm">
    <Loader2 className="size-4 animate-spin text-forge-teal" />
  </div>
);

export const DEFAULT_IMAGE_PLACEHOLDER = <ImagePlaceholder />;
