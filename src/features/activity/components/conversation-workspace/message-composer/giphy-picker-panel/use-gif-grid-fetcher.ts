import { type GifsResult, GiphyFetch } from "@giphy/js-fetch-api";
import { useCallback } from "react";

import { config } from "@/config/config";
import { GIF_GRID_LIMIT } from "./constants";

const GIPHY_FETCH_CLIENT = config.giphyApiKey
  ? new GiphyFetch(config.giphyApiKey)
  : null;

export function useGifGridFetcher(deferredSearch: string) {
  const fetchGifs = useCallback(
    (offset: number) => {
      if (!GIPHY_FETCH_CLIENT) {
        return Promise.reject(new Error("GIPHY is not configured."));
      }

      return fetchGifGridPage(GIPHY_FETCH_CLIENT, deferredSearch, offset);
    },
    [deferredSearch],
  );

  return GIPHY_FETCH_CLIENT ? fetchGifs : null;
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
