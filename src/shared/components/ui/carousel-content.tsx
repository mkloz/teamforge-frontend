import type { ComponentProps } from "react";

import { useCarousel } from "@/shared/components/ui/carousel-context";
import { cn } from "@/shared/lib/utils";

export function CarouselContent({
  className,
  ...props
}: ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
}
