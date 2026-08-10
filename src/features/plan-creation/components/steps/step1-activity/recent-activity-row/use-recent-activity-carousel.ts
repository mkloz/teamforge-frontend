import { useEffect, useEffectEvent, useState } from "react";

import type {
  CarouselApi,
  CarouselOptions,
} from "@/shared/components/ui/carousel-context";
import { useMediaQuery } from "@/shared/hooks/use-media-query";

import {
  RECENT_ACTIVITIES_DESKTOP_PAGE_SIZE,
  RECENT_ACTIVITIES_MOBILE_PAGE_SIZE,
} from "./types";

interface RecentActivityCarouselState {
  page: number;
  pageCount: number;
}

type ReadyCarouselApi = NonNullable<CarouselApi>;

export function useRecentActivityCarousel({
  itemCount,
}: {
  itemCount: number;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const isDesktopPage = useMediaQuery("(min-width: 640px)");
  const pageSize = isDesktopPage
    ? RECENT_ACTIVITIES_DESKTOP_PAGE_SIZE
    : RECENT_ACTIVITIES_MOBILE_PAGE_SIZE;
  const defaultPageCount = Math.max(1, Math.ceil(itemCount / pageSize));
  const [state, setState] = useState<RecentActivityCarouselState>({
    page: 0,
    pageCount: defaultPageCount,
  });

  const syncCarouselState = useEffectEvent((carouselApi: ReadyCarouselApi) => {
    const nextState = {
      page: carouselApi.selectedScrollSnap(),
      pageCount: Math.max(1, carouselApi.scrollSnapList().length),
    };

    setState((current) =>
      current.page === nextState.page &&
      current.pageCount === nextState.pageCount
        ? current
        : nextState,
    );
  });

  useEffect(() => {
    if (!api) return undefined;

    const sync = () => syncCarouselState(api);
    sync();
    api.on("select", sync);
    api.on("reInit", sync);

    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  useEffect(() => {
    if (!api) {
      setState({ page: 0, pageCount: defaultPageCount });
      return;
    }

    api.scrollTo(0, true);
    syncCarouselState(api);
  }, [api, defaultPageCount]);

  const options: CarouselOptions = {
    align: "start",
    containScroll: "trimSnaps",
    loop: itemCount > pageSize,
    slidesToScroll: pageSize,
  };

  return {
    api,
    options,
    page: state.page,
    pageCount: state.pageCount,
    setApi,
  };
}
