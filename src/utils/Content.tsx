import { AxiosError } from "axios";
import { ChartSeries, RawSeries } from "./typesInterface";

export const prepareSeries = (data: RawSeries[] | undefined): ChartSeries[] => {
  if (!data || data.length === 0) return [];

  // 1️⃣ Collect ALL unique timestamps
  const allTimestamps = Array.from(
    new Set(data.flatMap((item) => item.data.map((d) => d.timestamp))),
  ).sort((a, b) => a - b);

  return data.map((item) => {
    const priceMap = new Map<number, number>();

    item.data.forEach((d) => {
      priceMap.set(d.timestamp, d.price);
    });

    let lastPrice = item.data[0]?.price ?? 0;

    const normalizedData = allTimestamps.map((timestamp) => {
      if (priceMap.has(timestamp)) {
        lastPrice = priceMap.get(timestamp)!;
      }
      return {
        x: timestamp,
        y: Number(truncateValue(Number(lastPrice || 0))),
      };
    });

    return {
      name: item.name,
      data: normalizedData,
    };
  });
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response?.data?.errors?.length > 0) {
      return (
        (error.response?.data?.errors?.[0] as { message?: string })?.message ??
        "Request failed"
      );
    } else {
      return (
        (error.response?.data as { message?: string })?.message ??
        "Request failed"
      );
    }
  }
  return "Unexpected error";
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function timeAgoCompact(iso: string, now: Date = new Date()): string {
  const past = new Date(iso);
  if (isNaN(past.getTime())) return "";

  let diffMs = now.getTime() - past.getTime();

  // If future time, treat as 0s (or you can show "0s")
  if (diffMs < 0) diffMs = 0;

  const totalSec = Math.floor(diffMs / 1000);

  // seconds
  if (totalSec < 60) return `${totalSec}s`;

  const totalMin = Math.floor(totalSec / 60);

  // minutes
  if (totalMin < 60) return `${totalMin}m`;

  const totalHr = Math.floor(totalMin / 60);

  // hours:minutes
  if (totalHr < 24) {
    const remMin = totalMin % 60;
    return `${totalHr}h:${remMin}m`;
  }

  // days
  const days = Math.floor(totalHr / 24);
  return `${days}day`;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function HighlightTexts({ text }: { text: string }) {
  if (!text) return null;

  const escaped = escapeHtml(text);

  // ✅ only keep real line breaks (no extra whitespace handling in CSS)
  const withBreaks = escaped
    .replace(/\n/g, "<br/>")
    .replace(/ {2,}/g, (m) => "&nbsp;".repeat(m.length)); // keep multiple spaces only

  const mentionRegex = /(^|[\s(>])(@[a-zA-Z0-9_.]{1,30})/g;
  const hashRegex = /(^|[\s(>])(#[_a-zA-Z0-9]{1,50})/g;
  const urlRegex = /(^|[\s(>])((https?:\/\/|www\.)[^\s<]+[^<.,:;"')\]\s])/gi;

  const highlightedHtml = withBreaks
    .replace(urlRegex, (_match, p1, p2) => {
      const href = p2.toLowerCase().startsWith("www.") ? `https://${p2}` : p2;

      return `${p1}<a href="${href}" target="_blank" rel="noopener noreferrer"
        class="text-blue-500 dark:text-blue-400 underline font-medium break-words">
        ${p2}
      </a>`;
    })
    .replace(
      mentionRegex,
      `$1<span class="text-emerald-500 dark:text-emerald-400 font-medium">$2</span>`,
    )
    .replace(
      hashRegex,
      `$1<span class="text-sky-500 dark:text-sky-400 font-medium">$2</span>`,
    );

  return (
    <span
      className="text-[15px] leading-snug break-words whitespace-normal"
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
    />
  );
}

export const truncateValue = (num: number, decimals: number = 2) => {
  const factor = Math.pow(10, decimals);
  const truncated = Math.floor(num * factor) / factor;
  return truncated.toFixed(decimals);
};

export const MAX_WORDS = 500;

export function countWords(text: string) {
  return text?.length;
  // return text.trim().split(/\s+/).filter(Boolean).length;
}

export const isGifImage = (url = "") =>
  /\.gif($|\?)/i.test(url) || url.includes("giphy.com");

export const getCleanTextLength = (text: string) => {
  if (!text) return 0;

  // remove @mentions like @ram123456
  const cleaned = text.replace(/@\w+/g, "").trim();

  return cleaned.length;
};

export const BASE_COLORS = [
  "#008FFB",
  "#00E396",
  "#FEB019",
  "#FF4560",
  "#775DD0",
  "#3F51B5",
  "#546E7A",
  "#D4526E",
  "#8D5B4C",
  "#F86624",
  "#2E93fA",
  "#66DA26",
  "#546E7A",
  "#E91E63",
  "#FF9800",
  "#009688",
  "#673AB7",
  "#9C27B0",
  "#03A9F4",
  "#4CAF50",
];

export function extractSingleMainKeyword(sentence) {
  const stopWords = new Set([
    "who",
    "will",
    "be",
    "confirmed",
    "as",
    "the",
    "in",
    "at",
    "of",
    "is",
    "a",
    "an",
    "next",
    "to",
    "for",
    "on",
    "was",
    "were",
    "been",
    "how",
    "what",
    "which",
    "win",
    "year",
    "nominated",
    "will",
    "this",
  ]);

  // 1. Clean and split
  const words = sentence
    ?.toLowerCase()
    ?.replace(/[?.,!]/g, "")
    ?.split(" ");

  // 2. Filter out stopWords
  const potentialKeywords = words?.filter(
    (word) => !stopWords?.has(word) && word?.length > 2,
  );

  // 3. Logic to pick the BEST single keyword:
  // Prediction market mein aksar pehla "Important" noun hi main subject hota hai.
  // Jaise: "Which [game]..." or "Who will [treasury]..."

  if (potentialKeywords?.length > 0) {
    // Hum pehla word return karenge jo filter hone ke baad bacha hai
    return potentialKeywords[0];
  }

  return "No keyword found";
}

export function isValidEmail(email: string) {
  if (typeof email !== "string") return false;
  email = email.trim();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
