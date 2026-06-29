import useEmblaCarousel from "embla-carousel-react";
import {
  type ComponentProps,
  type KeyboardEvent,
  useEffect,
  useEffectEvent,
  useSyncExternalStore,
} from "react";

import { CarouselContent } from "@/shared/components/ui/carousel-content";
import {
  type CarouselApi,
  CarouselContext,
  type CarouselContextProps,
  type CarouselProps,
} from "@/shared/components/ui/carousel-context";
import { CarouselItem } from "@/shared/components/ui/carousel-item";
import { cn } from "@/shared/lib/utils";

type CarouselScrollSnapshot = "00" | "01" | "10" | "11";

const EMPTY_CAROUSEL_SCROLL_SNAPSHOT = "00";

function getCarouselScrollSnapshot(api: CarouselApi): CarouselScrollSnapshot {
  if (!api) {
    return EMPTY_CAROUSEL_SCROLL_SNAPSHOT;
  }

  return `${api.canScrollPrev() ? "1" : "0"}${
    api.canScrollNext() ? "1" : "0"
  }` as CarouselScrollSnapshot;
}

function getEmptyCarouselScrollSnapshot() {
  return EMPTY_CAROUSEL_SCROLL_SNAPSHOT;
}

function subscribeToCarousel(api: CarouselApi, onStoreChange: () => void) {
  if (!api) {
    return () => {};
  }

  api.on("reInit", onStoreChange);
  api.on("select", onStoreChange);

  return () => {
    api.off("reInit", onStoreChange);
    api.off("select", onStoreChange);
  };
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );
  const scrollSnapshot = useSyncExternalStore(
    (onStoreChange) => subscribeToCarousel(api, onStoreChange),
    () => getCarouselScrollSnapshot(api),
    getEmptyCarouselScrollSnapshot,
  );
  const canScrollPrev = scrollSnapshot[0] === "1";
  const canScrollNext = scrollSnapshot[1] === "1";

  const reportApi = useEffectEvent((nextApi: CarouselApi) => {
    setApi?.(nextApi);
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      api?.scrollPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      api?.scrollNext();
    }
  };

  useEffect(() => {
    if (!api) {
      return undefined;
    }

    // setApi is the public Embla escape hatch; consumers cannot derive it
    // before the carousel ref initializes.
    // react-doctor-disable-next-line react-doctor/no-pass-data-to-parent -- Embla creates api only after useEmblaCarousel initializes; preserving setApi keeps the shared primitive API stable for consumers that need the imperative carousel handle.
    reportApi(api);

    return undefined;
  }, [api]);

  const contextValue: CarouselContextProps = {
    carouselRef,
    api,
    opts,
    orientation:
      orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
    scrollPrev: () => {
      api?.scrollPrev();
    },
    scrollNext: () => {
      api?.scrollNext();
    },
    canScrollPrev,
    canScrollNext,
  };

  return (
    // oxlint-disable-next-line react/jsx-no-constructed-context-values -- React Doctor flags this context useMemo as redundant under React Compiler.
    <CarouselContext value={contextValue}>
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: The carousel root follows the WAI carousel roledescription pattern. */}
      <section
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </section>
    </CarouselContext>
  );
}

export { Carousel, CarouselContent, CarouselItem };
