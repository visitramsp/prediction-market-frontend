"use client";

import React, { useEffect, useRef, useState } from "react";
import { Modal, Box, IconButton, CircularProgress } from "@mui/material";
import Image from "next/image";
import { IoArrowBack, IoClose } from "react-icons/io5";
import {
  countWords,
  delay,
  getCleanTextLength,
  MAX_WORDS,
  timeAgoCompact,
} from "@/utils/Content";
import { GrCloudUpload } from "react-icons/gr";
import { Gift } from "lucide-react";
import { imageUpload } from "@/components/service/apiService/user";
import toast from "react-hot-toast";
import GiphyModal from "./GiphyModal";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";

export default function ReplyModal({
  open,
  onClose,
  row,
  handleSend,
  isLoader,
  mixText,
  setMixText,
  gif,
  setGif,
}: any) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const emojiBtnRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [openEmoji, setOpenEmoji] = useState(false);
  const [emojiPos, setEmojiPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const [isMobile, setIsMobile] = useState(false);

  const [imageLoading, setImageLoading] = useState(true);
  const [isImageUploadLoader, setIsImageUploadLoader] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [isGifOpen, setIsGifOpen] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const pickerTheme: Theme =
    resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT;
  // Detect mobile responsively
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640); // tailwind sm breakpoint
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto textarea resize
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 80) + "px";
  };

  // Toggle emoji (desktop = anchored, mobile = bottom sheet)
  const toggleEmoji = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Mobile: just open/close bottom sheet (no coords needed)
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setOpenEmoji((p) => !p);
      return;
    }

    // Desktop: position near button
    const btn = emojiBtnRef.current;
    if (!btn) return;

    const r = btn.getBoundingClientRect();

    const pickerWidth = 350;
    const pickerHeight = 420;

    let left = r.right;
    let top = r.bottom + 8;

    // If out bottom -> show above
    if (top + pickerHeight > window.innerHeight) {
      top = r.top - 8;
    }

    // If out left -> shift
    if (left - pickerWidth < 8) {
      left = r.left + pickerWidth;
    }

    setEmojiPos({ top, left });
    setOpenEmoji((prev) => !prev);
  };

  // Insert emoji at cursor
  const insertEmoji = (emojiData: EmojiClickData) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? mixText.length;
    const end = textarea.selectionEnd ?? mixText.length;

    const text =
      mixText.substring(0, start) + emojiData.emoji + mixText.substring(end);

    setMixText(text);

    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + emojiData.emoji.length;
      textarea.selectionStart = pos;
      textarea.selectionEnd = pos;
    });
  };

  // Close emoji on outside click (works for desktop popover + mobile sheet)
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

  // Close upload menu on outside click
  useEffect(() => {
    if (!showUploadMenu) return;

    const handleOutside = (e: any) => {
      const target = e.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        wrapperRef.current &&
        !wrapperRef.current.contains(target)
      ) {
        setShowUploadMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [showUploadMenu]);

  // Image upload
  const chooseImages = async (file: File) => {
    setIsImageUploadLoader(true);
    try {
      const formData = new FormData();
      formData.append("images", file);

      const [response] = await Promise.all([
        imageUpload(formData),
        delay(1000),
      ]);

      if (response?.success) {
        setGif(response?.data?.[0]?.url);
      } else {
        toast.error(response?.message || "Upload failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsImageUploadLoader(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    chooseImages(file);
  };

  const commentDetails = (() => {
    if (!row?.metadata) return null;
    if (typeof row?.metadata === "object") return row?.metadata;
    try {
      return JSON.parse(row?.metadata);
    } catch (e) {
      return null;
    }
  })();

  const handleClose = () => {
    setIsGifOpen(false);
    setShowUploadMenu(false);
    setOpenEmoji(false);
    onClose();
  };

  const handleSubmit = () => {
    handleSend(row, mixText, gif);
  };

  const isDisabled = getCleanTextLength(mixText) < 2;

  const emojiPortal =
    openEmoji &&
    typeof window !== "undefined" &&
    createPortal(
      <div
        ref={popupRef}
        style={{
          position: "fixed",
          zIndex: 999999,
          ...(isMobile
            ? {
                left: 0,
                right: 0,
                bottom: 0,
                top: "auto",
                transform: "none",
                padding: 12,
              }
            : {
                top: emojiPos.top,
                left: emojiPos.left,
                transform:
                  emojiPos.top <
                  (emojiBtnRef.current?.getBoundingClientRect().top || 0)
                    ? "translate(-100%, -100%)" // shown above
                    : "translateX(-100%)", // shown below
              }),
        }}
      >
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
                onClick={() => setOpenEmoji(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                type="button"
              >
                <IoClose className="text-gray-700 dark:text-gray-200" />
              </button>
            </div>
          )}

          <EmojiPicker
            onEmojiClick={insertEmoji}
            width={isMobile ? "100%" : 350}
            theme={pickerTheme}
          />
        </div>
      </div>,
      document.body,
    );

  return (
    <Modal
      className="m-2"
      BackdropProps={{
        timeout: 500,
        sx: {
          backdropFilter: "blur(10px)",
          backgroundColor:
            theme === "dark"
              ? "rgba(15, 23, 42, 0.7)"
              : "rgba(255, 255, 255, 0.7)",
        },
      }}
      open={open}
      onClose={handleClose}
    >
      <Box
        className="
          absolute top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          w-full max-w-lg
          rounded-2xl
          bg-white dark:bg-[#0F172A]
          shadow-2xl
          p-4
          outline-none
        "
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <IconButton onClick={handleClose}>
            <IoArrowBack className="text-gray-700 dark:text-gray-200 text-xl" />
          </IconButton>
        </div>

        {/* Comment */}
        <div className="flex gap-3 mb-4">
          <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-200 p-1 dark:bg-gray-600 flex-shrink-0">
            <Image
              src={row?.User?.image_url || "/img/user.png"}
              alt="user"
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {row?.User?.username || "--"}{" "}
              <span className="text-gray-400 text-xs font-normal">
                {timeAgoCompact(row?.createdAt)}
              </span>
            </p>

            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {commentDetails?.content || "--"}
            </p>

            {commentDetails?.images?.length > 0 && (
              <div className="bg-green-100 p-2 w-fit rounded shadow">
                <Image
                  src={commentDetails?.images?.[0]}
                  height={150}
                  alt="post image"
                  width={150}
                />
              </div>
            )}

            <p className="text-xs text-gray-400 mt-2">
              Replying to{" "}
              <span className="text-teal-500">
                @{row?.User?.username || "--"}
              </span>
            </p>
          </div>
        </div>

        {/* Reply textarea */}
        <div className="text-gray-800 rounded-lg px-2 border-t border-gray-200 dark:border-gray-800 dark:text-gray-100 text-sm mb-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={mixText}
            onChange={(e) => {
              const value = e.target.value;
              if (countWords(value) <= MAX_WORDS) setMixText(value);
            }}
            placeholder="Enter the reply..."
            className="w-full resize-none bg-transparent outline-none text-[15px] text-gray-600 dark:text-gray-100 placeholder-gray-400 leading-5 max-h-[80px] overflow-y-auto pt-1"
            onInput={handleInput}
          />

          {gif && (
            <div className="relative w-fit mt-2 mb-4">
              {imageLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/30">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              <Image
                src={gif}
                alt="gif"
                width={220}
                height={220}
                className={`rounded-xl w-56 transition-opacity duration-300 ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoadingComplete={() => setImageLoading(false)}
              />

              <button
                onClick={() => {
                  setGif(null);
                  setImageLoading(true);
                }}
                className="absolute cursor-pointer top-1 right-1 z-20 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                type="button"
              >
                <IoClose />
              </button>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-4">
            {/* Upload dropdown */}
            <div className="relative" ref={wrapperRef}>
              <button
                disabled={gif || isImageUploadLoader}
                onClick={() => setShowUploadMenu((p) => !p)}
                className={`text-sm relative font-medium ${
                  gif || isImageUploadLoader
                    ? "text-gray-400 dark:text-gray-700"
                    : "text-gray-500 cursor-pointer hover:text-[#d2b8fa]"
                }`}
                type="button"
              >
                {isImageUploadLoader ? (
                  <CircularProgress size={18} />
                ) : (
                  "UPLOAD"
                )}
              </button>

              <div
                ref={dropdownRef}
                className={`absolute mt-2 w-32 rounded-xl bg-white dark:bg-[#0F172A] shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 z-50 ${
                  showUploadMenu ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
              >
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowUploadMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  type="button"
                >
                  <GrCloudUpload /> Image
                </button>

                <button
                  onClick={() => {
                    setIsGifOpen(true);
                    setShowUploadMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  type="button"
                >
                  <Gift size={18} /> GIF
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleFileChange}
              />
            </div>

            {/* Emoji */}
            <button
              ref={emojiBtnRef}
              onClick={toggleEmoji}
              className="text-lg px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              type="button"
            >
              🙂
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {countWords(mixText)} / {MAX_WORDS} words
            </span>
            <button
              disabled={isDisabled}
              onClick={handleSubmit}
              className={`px-4 py-2 w-20 flex items-center justify-center rounded-lg text-sm font-medium
              transition-colors duration-300
              ${
                isDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                  : "bg-black text-white cursor-pointer dark:bg-white dark:text-black"
              }`}
              type="button"
            >
              {isLoader ? (
                <CircularProgress
                  size={19}
                  className="!text-white dark:!text-gray-600"
                />
              ) : (
                "Reply"
              )}
            </button>
          </div>
        </div>

        {/* Emoji Portal (Responsive) */}
        {emojiPortal}

        {/* GIF Modal */}
        <GiphyModal
          open={isGifOpen}
          onClose={() => setIsGifOpen(false)}
          onSelect={setGif}
        />
      </Box>
    </Modal>
  );
}
