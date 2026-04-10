"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal, IconButton } from "@mui/material";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { IoClose } from "react-icons/io5";

const gf = new GiphyFetch("6yXO79zQVXhs6Qfk4x8hdUIugnQujLni");

export default function GiphyModal({ open, onClose, onSelect }) {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(input.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    if (!open) {
      setInput("");
      setQuery("");
    }
  }, [open]);

  const fetchGifs = useCallback(
    (offset: number) => {
      if (query) {
        return gf.search(query, { offset, limit: 6 });
      }
      return gf.trending({ offset, limit: 6 });
    },
    [query],
  );

  return (
    <Modal open={open} onClose={onClose}>
      {/* overlay */}
      <div className="fixed inset-0 p-2 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        {/* modal */}
        <div
          className="
            bg-white dark:bg-[#0F172A]
            w-[95%] sm:w-[420px]
            max-w-[420px]
            h-[75vh] sm:h-[600px]
            rounded-2xl
            shadow-2xl
            flex flex-col
            overflow-hidden   /* ✅ IMPORTANT: remove extra scroll */
          "
        >
          {/* header */}
          <div className="h-[60px] px-3 sm:px-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search GIFs"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="
                flex-1 h-[40px] px-4 text-sm rounded-full
                bg-gray-100 dark:bg-gray-800
                border border-transparent
                focus:border-indigo-500
                focus:ring-1 focus:ring-indigo-500/40
                outline-none
              "
            />
            <IconButton size="small" onClick={onClose}>
              <IoClose className="dark:!text-gray-300" />
            </IconButton>
          </div>

          {/* GIF LIST */}
          <div className="flex-1 p-2 sm:p-3 overflow-y-scroll overflow-x-hidden hideScrollbar">
            <Grid
              key={query || "trending"}
              width={
                typeof window !== "undefined"
                  ? Math.min(window.innerWidth - 50, 380)
                  : 390
              }
              columns={2}
              gutter={6}
              fetchGifs={fetchGifs}
              noLink
              hideAttribution
              onGifClick={(gif, e) => {
                e.preventDefault();
                const preview = gif.images.fixed_width_small_still.url;
                onSelect(preview);
                onClose();
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
