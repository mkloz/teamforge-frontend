import { type GifsResult, GiphyFetch } from "@giphy/js-fetch-api";

import { config } from "@/config/config";
import { GIF_GRID_LIMIT } from "./constants";

const GIPHY_FETCH_CLIENT = config.giphyApiKey
  ? new GiphyFetch(config.giphyApiKey)
  : null;

export function useGifGridFetcher(deferredSearch: string) {
  if (!GIPHY_FETCH_CLIENT) {
    return null;
  }

  return (offset: number) =>
    fetchGifGridPage(GIPHY_FETCH_CLIENT, deferredSearch, offset);
}

function fetchGifGridPage(
  giphyFetch: GiphyFetch,
  deferredSearch: string,
  offset: number,
): Promise<GifsResult> {
  const requestOptions = {
    limit: GIF_GRID_LIMIT,
    offset,
    rating: "pg-13" as const,
  };

  return deferredSearch
    ? giphyFetch.search(deferredSearch, requestOptions)
    : giphyFetch.trending(requestOptions);
}
