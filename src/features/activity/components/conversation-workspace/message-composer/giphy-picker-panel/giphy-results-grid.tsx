import type { GifsResult } from "@giphy/js-fetch-api";
import type { IGif } from "@giphy/js-types";
import { Grid } from "@giphy/react-components";

import type { ActivityOutgoingGifAttachment } from "@/features/activity/lib/activity-contract";
import { showAppErrorMessageToast } from "@/shared/lib/app-toast";
import { GIF_GRID_WIDTH } from "./constants";
import { toOutgoingGiphyAttachment } from "./giphy-attachment";

interface GiphyResultsGridProps {
  deferredSearch: string;
  fetchGifs: (offset: number) => Promise<GifsResult>;
  onSelect: (gif: ActivityOutgoingGifAttachment) => void;
}

export function GiphyResultsGrid({
  deferredSearch,
  fetchGifs,
  onSelect,
}: GiphyResultsGridProps) {
  return (
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
          handleGifSelection({ gif, onSelect });
        }}
        width={GIF_GRID_WIDTH}
      />
    </div>
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
