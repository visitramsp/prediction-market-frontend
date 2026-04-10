"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Send, Smile, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import type { ReplyingTo } from "./types";

interface ChatInputProps {
  onSend: (text: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
  replyingTo?: ReplyingTo | null;
  onCancelReply?: () => void;
}

export default function ChatInput({
  onSend,
  onTyping,
  onStopTyping,
  disabled,
  replyingTo,
  onCancelReply,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  // Focus textarea when replying
  useEffect(() => {
    if (replyingTo) {
      textareaRef.current?.focus();
    }
  }, [replyingTo]);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const handleEmojiSelect = useCallback((emojiData: EmojiClickData) => {
    setText((prev) => prev + emojiData.emoji);
    textareaRef.current?.focus();
  }, []);

  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker((prev) => !prev);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);

      // Auto-resize
      const ta = textareaRef.current;
      if (ta) {
        ta.style.height = "auto";
        ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
      }

      // Typing indicator
      onTyping();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping();
      }, 3000);
    },
    [onTyping, onStopTyping]
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setText("");
    setShowEmojiPicker(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    onStopTyping();

    // Reset textarea height
    const ta = textareaRef.current;
    if (ta) ta.style.height = "auto";
  }, [text, disabled, onSend, onStopTyping]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
      // Escape closes emoji picker or cancels reply
      if (e.key === "Escape") {
        if (showEmojiPicker) {
          setShowEmojiPicker(false);
        } else if (replyingTo) {
          onCancelReply?.();
        }
      }
    },
    [handleSend, replyingTo, onCancelReply, showEmojiPicker]
  );

  const hasText = text.trim().length > 0;

  return (
    <div className="border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
      {/* Reply preview bar */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.03]">
              <div className="w-[3px] h-10 rounded-full bg-gradient-to-b from-[#8160ee] to-[#7a48df] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[#8160ee] font-poppins">
                  {replyingTo.isMine ? "Replying to yourself" : "Replying"}
                </p>
                <p className="text-xs text-[#94a3b8] truncate font-poppins">
                  {replyingTo.plaintext}
                </p>
              </div>
              <button
                onClick={onCancelReply}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-[#64748b]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-3 px-4 py-3 relative">
        {/* Emoji picker popup */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              ref={emojiPickerRef}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 z-50"
            >
              <div className="rounded-xl overflow-hidden shadow-2xl border border-white/[0.08]">
                <EmojiPicker
                  onEmojiClick={handleEmojiSelect}
                  theme={Theme.DARK}
                  width={350}
                  height={400}
                  searchDisabled={false}
                  skinTonesDisabled={false}
                  lazyLoadEmojis
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emoji button */}
        <motion.button
          ref={emojiButtonRef}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleEmojiPicker}
          className={`p-2.5 rounded-xl transition-colors flex-shrink-0 mb-0.5 ${
            showEmojiPicker
              ? "bg-white/[0.1] text-[#8160ee]"
              : "hover:bg-white/[0.06] text-[#64748b]"
          }`}
        >
          <Smile className="w-5 h-5" />
        </motion.button>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            disabled={disabled}
            className="w-full resize-none bg-white/[0.04] text-white text-sm rounded-2xl px-4 py-3 border border-white/[0.08] focus:border-[#8160ee]/40 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-[#8160ee]/20 placeholder:text-[#4a5568] placeholder:italic disabled:opacity-50 max-h-[120px] transition-all duration-200 font-poppins"
          />
        </div>

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={!hasText || disabled}
          className={`p-3 rounded-full flex-shrink-0 mb-0.5 transition-all duration-300 ${
            hasText && !disabled
              ? "bg-gradient-to-br from-[#8160ee] to-[#7a48df] text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
              : "bg-white/[0.04] text-[#4a5568] border border-white/[0.06]"
          }`}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
