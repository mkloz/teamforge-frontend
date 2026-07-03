import { useDeferredValue, useState } from "react";

import { config } from "@/config/config";
import type { ActivityOutgoingGifAttachment } from "@/features/activity/lib/activity-contract";
import { ExpressionEmptyState } from "./giphy-picker-panel/empty-state";
import { GiphyResultsGrid } from "./giphy-picker-panel/giphy-results-grid";
import { GiphySearchInput } from "./giphy-picker-panel/giphy-search-input";
import { useGifGridFetcher } from "./giphy-picker-panel/use-gif-grid-fetcher";

interface GifPickerPanelProps {
  canSendGif: boolean;
  onSelect: (gif: ActivityOutgoingGifAttachment) => void;
}

export function GifPickerPanel({ canSendGif, onSelect }: GifPickerPanelProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const fetchGifs = useGifGridFetcher(deferredSearch);

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
      <GiphySearchInput search={search} onSearchChange={setSearch} />
      <GiphyResultsGrid
        deferredSearch={deferredSearch}
        fetchGifs={fetchGifs}
        onSelect={onSelect}
      />
      <div className="border-border/50 border-t px-2 py-1.5 text-right font-bold text-[0.56rem] text-muted-foreground">
        Powered by GIPHY
      </div>
    </div>
  );
}
