import type { ComponentProps } from "react";

import { useCarousel } from "@/shared/components/ui/carousel-context";
import { cn } from "@/shared/lib/utils";

export function CarouselItem({ className, ...props }: ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    // biome-ignore lint/a11y/useSemanticElements: WAI-ARIA APG carousel slides use role=group with aria-roledescription=slide.
    <div
      // react-doctor-disable-next-line react-doctor/prefer-tag-over-role -- WAI-ARIA APG carousel slides use role="group" with aria-roledescription="slide"; address would mean contact information.
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
}
