"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { IoClose } from "react-icons/io5";
import { useTheme } from "next-themes";

type Props = {
  theme?: "dark" | "light";
  buttonClassName?: string;
  buttonContent?: React.ReactNode; // 🙂 icon etc
  onEmojiSelect: (emoji: string) => void;
};

export default function EmojiPopover({
  buttonClassName = "",
  buttonContent = "🙂",
  onEmojiSelect,
}: Props) {
  const emojiBtnRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const [openEmoji, setOpenEmoji] = useState(false);
  const [emojiPos, setEmojiPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();
  const pickerTheme: Theme =
    resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT;
  // detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggleEmoji = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Mobile: bottom sheet
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setOpenEmoji((p) => !p);
      return;
    }

    // Desktop: anchor near button
    const btn = emojiBtnRef.current;
    if (!btn) return;

    const r = btn.getBoundingClientRect();
    const pickerWidth = 350;
    const pickerHeight = 420;

    let left = r.right;
    let top = r.bottom + 8;

    if (top + pickerHeight > window.innerHeight) top = r.top - 8; // show above
    if (left - pickerWidth < 8) left = r.left + pickerWidth; // keep in screen

    setEmojiPos({ top, left });
    setOpenEmoji((p) => !p);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
  };

  // outside click close
  useEffect(() => {
    if (!openEmoji) return;

    const handleOutside = (e: any) => {
      const target = e.target as Node;

      if (
        popupRef.current &&
        !popupRef.current.contains(target) &&
        emojiBtnRef.current &&
        !emojiBtnRef.current.contains(target)
      ) {
        setOpenEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [openEmoji]);

  const portal =
    openEmoji &&
    typeof window !== "undefined" &&
    createPortal(
      <div
        ref={popupRef}
        style={{
          position: "fixed",
          zIndex: 999999,
          ...(isMobile
            ? { left: 0, right: 0, bottom: 0, padding: 12 }
            : {
                top: emojiPos.top,
                left: emojiPos.left,
                transform:
                  emojiPos.top <
                  (emojiBtnRef.current?.getBoundingClientRect().top || 0)
                    ? "translate(-100%, -100%)"
                    : "translateX(-100%)",
              }),
        }}
      >
        {/* Mobile backdrop */}
        {isMobile && (
          <div
            onClick={() => setOpenEmoji(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: -1,
            }}
          />
        )}

        <div
          className={
            isMobile
              ? "w-full max-w-[520px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0F172A]"
              : "rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0F172A]"
          }
        >
          {isMobile && (
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Emojis
              </span>
              <button
                type="button"
                onClick={() => setOpenEmoji(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
              >
                <IoClose className="text-gray-700 dark:text-gray-200" />
              </button>
            </div>
          )}

          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={pickerTheme}
            width={isMobile ? "100%" : 350}
          />
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      <button
        ref={emojiBtnRef}
        type="button"
        onClick={toggleEmoji}
        className={buttonClassName}
      >
        {buttonContent}
      </button>

      {portal}
    </>
  );
}
