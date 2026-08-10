import { useEffect, useEffectEvent, useState } from "react";

import type {
  CarouselApi,
  CarouselOptions,
} from "@/shared/components/ui/carousel-context";
import { TEMPLATES_PER_PAGE } from "./types";

interface UseTemplatePaginationParams<T> {
  items: T[];
  selectedActivity: string | null;
}

export function useTemplatePagination<T>({
  items,
  selectedActivity,
}: UseTemplatePaginationParams<T>) {
  const [api, setApi] = useState<CarouselApi>();
  const pages = getTemplatePages(items);
  const pageCount = pages.length;
  const [pageState, setPageState] = useState({
    page: 0,
    selectedActivity,
  });
  const page =
    pageState.selectedActivity === selectedActivity
      ? Math.min(pageState.page, pageCount - 1)
      : 0;
  const syncPage = useEffectEvent((carouselApi: NonNullable<CarouselApi>) => {
    setPageState({
      page: carouselApi.selectedScrollSnap(),
      selectedActivity,
    });
  });

  useEffect(() => {
    if (!api) return undefined;

    const sync = () => syncPage(api);
    api.on("select", sync);
    api.on("reInit", sync);
    sync();

    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  const canPage = pageCount > 1;
  const options: CarouselOptions = {
    align: "start",
    containScroll: "trimSnaps",
    loop: canPage,
  };

  return {
    canPage,
    options,
    page,
    pageCount,
    pages,
    setApi,
    showNextPage: () => api?.scrollNext(),
    showPreviousPage: () => api?.scrollPrev(),
  };
}

function getTemplatePages<T>(items: T[]) {
  const pageCount = Math.max(1, Math.ceil(items.length / TEMPLATES_PER_PAGE));

  return Array.from({ length: pageCount }, (_, page) =>
    items.slice(
      page * TEMPLATES_PER_PAGE,
      page * TEMPLATES_PER_PAGE + TEMPLATES_PER_PAGE,
    ),
  );
}
