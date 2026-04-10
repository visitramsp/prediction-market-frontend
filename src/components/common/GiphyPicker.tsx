"use client";

import { useCallback } from "react";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";

const gf = new GiphyFetch("6yXO79zQVXhs6Qfk4x8hdUIugnQujLni");

export default function GiphyPicker({ onSelect, query }) {
  const fetchGifs = useCallback(
    (offset) => {
      if (query.trim()) {
        return gf.search(query, { offset, limit: 20 });
      }
      return gf.trending({ offset, limit: 20 });
    },
    [query],
  );

  return (
    <Grid
      key={query || "trending"}
      width={400}
      columns={2}
      gutter={6}
      fetchGifs={fetchGifs}
      onGifClick={(gif, e) => {
        e.preventDefault();
        onSelect(gif.images.original.url);
      }}
    />
  );
}
