import type { GifsResult } from "@giphy/js-fetch-api";
import type { IGif } from "@giphy/js-types";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ActivityOutgoingGifAttachment } from "@/features/activity/lib/activity-contract";
import { showAppErrorMessageToast } from "@/shared/lib/app-toast";
import { toOutgoingGiphyAttachment } from "./giphy-attachment";

interface GiphyResultsGridProps {
  fetchGifs: (offset: number) => Promise<GifsResult>;
  onSelect: (gif: ActivityOutgoingGifAttachment) => void;
}

export function GiphyResultsGrid({
  fetchGifs,
  onSelect,
}: GiphyResultsGridProps) {
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestVersionRef = useRef(0);
  const loadingRef = useRef(false);
  const [gifs, setGifs] = useState<IGif[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadPage = useCallback(
    async (offset: number, replace: boolean) => {
      if (loadingRef.current && !replace) {
        return;
      }

      const requestVersion = requestVersionRef.current;
      loadingRef.current = true;
      setIsLoading(true);
      setLoadError(false);

      try {
        const result = await fetchGifs(offset);

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setGifs((current) =>
          mergeUniqueGifs(replace ? [] : current, result.data),
        );
        setHasMore(hasAnotherPage(result, offset));
      } catch {
        if (requestVersion === requestVersionRef.current) {
          setLoadError(true);
        }
      } finally {
        if (requestVersion === requestVersionRef.current) {
          loadingRef.current = false;
          setIsLoading(false);
        }
      }
    },
    [fetchGifs],
  );

  useEffect(() => {
    requestVersionRef.current += 1;
    loadingRef.current = false;
    setGifs([]);
    setHasMore(true);
    setLoadError(false);
    void loadPage(0, true);

    return () => {
      requestVersionRef.current += 1;
      loadingRef.current = false;
    };
  }, [loadPage]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    const scrollRoot = scrollRootRef.current;

    if (!loadMoreElement || !scrollRoot || !hasMore || isLoading || loadError) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void loadPage(gifs.length, false);
        }
      },
      {
        root: scrollRoot,
        rootMargin: "240px",
      },
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.disconnect();
    };
  }, [gifs.length, hasMore, isLoading, loadError, loadPage]);

  return (
    <div
      ref={scrollRootRef}
      className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-2"
    >
      {gifs.length > 0 ? (
        <div className="columns-3 gap-1.5">
          {gifs.map((gif) => (
            <GifResult key={String(gif.id)} gif={gif} onSelect={onSelect} />
          ))}
        </div>
      ) : null}

      {!isLoading && !loadError && gifs.length === 0 ? (
        <div className="px-3 py-10 text-center font-semibold text-muted-foreground text-sm">
          No GIFs found.
        </div>
      ) : null}

      {loadError ? (
        <div className="flex flex-col items-center gap-2 px-3 py-6 text-center">
          <p className="font-semibold text-muted-foreground text-sm">
            GIFs could not be loaded.
          </p>
          <button
            type="button"
            className="rounded-full bg-primary px-3 py-1.5 font-semibold text-primary-foreground text-xs"
            onClick={() => {
              void loadPage(gifs.length, gifs.length === 0);
            }}
          >
            Try again
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div
          className="px-3 py-4 text-center font-semibold text-muted-foreground text-sm"
          role="status"
        >
          Loading GIFs…
        </div>
      ) : null}

      <div ref={loadMoreRef} className="h-px" aria-hidden />
    </div>
  );
}

function GifResult({
  gif,
  onSelect,
}: {
  gif: IGif;
  onSelect: GiphyResultsGridProps["onSelect"];
}) {
  const rendition =
    gif.images.fixed_width ?? gif.images.downsized ?? gif.images.original;
  const source = rendition?.webp ?? rendition?.url;

  if (!source) {
    return null;
  }

  const title = gif.title || "GIPHY GIF";

  return (
    <button
      type="button"
      className="mb-1.5 block w-full break-inside-avoid overflow-hidden rounded-lg bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Select ${title}`}
      onClick={() => {
        handleGifSelection({ gif, onSelect });
      }}
    >
      <img
        src={source}
        alt={title}
        className="block h-auto w-full"
        height={toPositiveNumber(rendition.height)}
        loading="lazy"
        width={toPositiveNumber(rendition.width)}
      />
    </button>
  );
}

function handleGifSelection({
  gif,
  onSelect,
}: {
  gif: IGif;
  onSelect: GiphyResultsGridProps["onSelect"];
}) {
  const attachment = toOutgoingGiphyAttachment(gif);

  if (!attachment) {
    showAppErrorMessageToast("That GIF cannot be sent.");
    return;
  }

  onSelect(attachment);
}

function mergeUniqueGifs(current: IGif[], incoming: IGif[]) {
  const seenIds = new Set(current.map((gif) => String(gif.id)));

  return [
    ...current,
    ...incoming.filter((gif) => {
      const id = String(gif.id);

      if (seenIds.has(id)) {
        return false;
      }

      seenIds.add(id);
      return true;
    }),
  ];
}

function hasAnotherPage(result: GifsResult, offset: number) {
  const loadedCount = offset + result.data.length;
  const totalCount = toPositiveNumber(result.pagination?.total_count);

  if (totalCount) {
    return loadedCount < totalCount;
  }

  return result.data.length > 0;
}

function toPositiveNumber(value: number | string | undefined) {
  const parsed =
    typeof value === "number" ? value : Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
