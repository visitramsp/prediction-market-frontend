import { countWords, MAX_WORDS } from "@/utils/Content";
import React, { useMemo, useRef } from "react";

type Props = {
  message: string;
  setMessage: (v: string) => void;
  image?: string | null;
  onRemoveImage?: () => void;
};

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function highlightText(text: string) {
  const escaped = escapeHtml(text);

  const withBreaks = escaped
    .replace(/\n/g, "<br/>")
    .replace(/ {2}/g, " &nbsp;");

  const mentionRegex = /(^|[\s(>])(@[a-zA-Z0-9_.]{1,30})/g;
  const hashRegex = /(^|[\s(>])(#[_a-zA-Z0-9]{1,50})/g;
  const urlRegex = /(^|[\s(>])((https?:\/\/|www\.)[^\s<]+[^<.,:;"')\]\s])/gi;

  return withBreaks
    .replace(
      urlRegex,
      `$1<span class="text-blue-500 dark:text-blue-400 underline">$2</span>`,
    )
    .replace(
      mentionRegex,
      `$1<span class="text-emerald-500 dark:text-emerald-400">$2</span>`,
    )
    .replace(
      hashRegex,
      `$1<span class="text-sky-500 dark:text-sky-400">$2</span>`,
    );
}

export default function InputTextArea({
  message,
  setMessage,
  image,
  onRemoveImage,
}: Props) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const highlightedHtml = useMemo(() => {
    const t = message ?? "";
    return highlightText(t.length ? t : "\u200b");
  }, [message]);

  const syncScroll = () => {
    if (!taRef.current || !overlayRef.current) return;
    overlayRef.current.scrollTop = taRef.current.scrollTop;
    overlayRef.current.scrollLeft = taRef.current.scrollLeft;
  };

  return (
    <div className="w-full">
      {image && (
        <div className="relative w-fit pt-4">
          <img
            src={image}
            alt="preview"
            className="max-h-40 rounded-xl border border-gray-300 dark:border-gray-700"
          />
          {onRemoveImage && (
            <button
              type="button"
              onClick={onRemoveImage}
              className="absolute !cursor-pointer top-2 -right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <div className="relative w-full">
        {/* Highlight overlay */}
        <div
          ref={overlayRef}
          aria-hidden="true"
          className="
            absolute inset-0
            pt-4
            px-0
            h-[110px]             /* 👈 approx 4 rows */
            overflow-y-auto       /* 👈 scrolling */
            leading-relaxed
            whitespace-pre-wrap
            break-words
            hideScrollbar
            pointer-events-none
            text-gray-900 dark:text-gray-400
          "
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />

        {/* Textarea */}
        <textarea
          ref={taRef}
          rows={4}
          value={message || ""}
          onChange={(e) => {
            const value = e.target.value;
            if (countWords(value) <= MAX_WORDS) {
              setMessage(value);
            }
          }}
          onScroll={syncScroll}
          placeholder="What is your prediction?"
          className="
            relative
            pt-4
            w-full
            h-[110px]            /* 👈 fixed height */
            overflow-y-auto      /* 👈 scroll after 4 rows */
            hideScrollbar
            leading-relaxed
            bg-transparent
            resize-none
            outline-none
            text-transparent
            caret-gray-900 dark:caret-gray-200
            placeholder:text-gray-400
            placeholder:dark:text-gray-600
          "
        />
      </div>
    </div>
  );
}
