import { GiphyFetch } from "@giphy/js-fetch-api";
import type { IGif } from "@giphy/js-types";
import { Grid } from "@giphy/react-components";
import { Clapperboard, Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { config } from "@/config/config";
import type { ActivityOutgoingGifAttachment } from "@/features/activity/lib/activity-contract";
import { showAppErrorMessageToast } from "@/shared/lib/app-toast";

interface GifPickerPanelProps {
  canSendGif: boolean;
  onSelect: (gif: ActivityOutgoingGifAttachment) => void;
}

const GIF_GRID_WIDTH = 320;
const GIF_GRID_LIMIT = 18;

export function GifPickerPanel({ canSendGif, onSelect }: GifPickerPanelProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const giphyFetch = useMemo(
    () => (config.giphyApiKey ? new GiphyFetch(config.giphyApiKey) : null),
    [],
  );
  const fetchGifs = useMemo(() => {
    if (!giphyFetch) {
      return null;
    }

    return (offset: number) =>
      deferredSearch
        ? giphyFetch.search(deferredSearch, {
            limit: GIF_GRID_LIMIT,
            offset,
            rating: "pg-13",
          })
        : giphyFetch.trending({
            limit: GIF_GRID_LIMIT,
            offset,
            rating: "pg-13",
          });
  }, [deferredSearch, giphyFetch]);

  if (!canSendGif) {
    return (
      <ExpressionEmptyState
        title="GIFs are available for new messages"
        detail="Finish or cancel editing to send one."
      />
    );
  }

  if (!config.giphyApiKey || !fetchGifs) {
    return (
      <ExpressionEmptyState
        title="GIF search is not configured"
        detail="Add VITE_GIPHY_API_KEY to enable GIPHY."
      />
    );
  }

  return (
    <div className="flex h-92 flex-col">
      <div className="border-border/50 border-b px-2 py-1.5">
        <label className="relative block">
          <span className="sr-only">Search GIFs</span>
          <Search className="absolute top-1/2 left-1.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search GIFs"
            className="h-8 w-full border-0 bg-transparent pr-2 pl-7 font-semibold text-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:ring-0"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-2">
        <Grid
          key={deferredSearch || "trending"}
          borderRadius={8}
          columns={3}
          fetchGifs={fetchGifs}
          gutter={6}
          hideAttribution={false}
          loaderConfig={{ rootMargin: "240px" }}
          noLink
          noResultsMessage={
            <div className="px-3 py-10 text-center font-semibold text-muted-foreground text-sm">
              No GIFs found.
            </div>
          }
          onGifClick={(gif, event) => {
            event.preventDefault();
            const attachment = toOutgoingGiphyAttachment(gif);

            if (!attachment) {
              showAppErrorMessageToast("That GIF cannot be sent.");
              return;
            }

            onSelect(attachment);
          }}
          width={GIF_GRID_WIDTH}
        />
      </div>

      <div className="border-border/50 border-t px-2 py-1.5 text-right font-bold text-[0.56rem] text-muted-foreground">
        Powered by GIPHY
      </div>
    </div>
  );
}

function ExpressionEmptyState({
  detail,
  title,
}: {
  detail: string;
  title: string;
}) {
  return (
    <div className="flex h-92 flex-col items-center justify-center gap-2 px-6 text-center">
      <span className="flex size-10 items-center justify-center rounded-full border border-border/55 bg-muted/50 text-muted-foreground">
        <Clapperboard className="size-5" />
      </span>
      <p className="font-black text-foreground text-sm">{title}</p>
      <p className="max-w-56 font-medium text-muted-foreground text-xs leading-5">
        {detail}
      </p>
    </div>
  );
}

function toNumber(value: number | string | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : null;
}

function toOutgoingGiphyAttachment(
  gif: IGif,
): ActivityOutgoingGifAttachment | null {
  const rendition = gif.images.fixed_width ?? gif.images.fixed_height;
  const videoUrl =
    rendition?.mp4 ||
    gif.images.downsized_small?.mp4 ||
    gif.images.original_mp4?.mp4 ||
    gif.images.original?.mp4;

  if (!videoUrl) {
    return null;
  }

  const previewUrl =
    rendition?.webp ||
    gif.images.fixed_width_still?.url ||
    gif.images.preview_gif?.url ||
    gif.images.original_still?.url ||
    null;

  return {
    height: toNumber(rendition?.height),
    previewUrl,
    provider: "giphy",
    providerId: String(gif.id),
    title: (gif.title || "GIPHY GIF").slice(0, 255),
    url: videoUrl,
    width: toNumber(rendition?.width),
  };
}
