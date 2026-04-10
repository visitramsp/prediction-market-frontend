"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { Check, CheckCheck, Reply } from "lucide-react";
import type { DecryptedMessage } from "./types";

interface MessageBubbleProps {
  message: DecryptedMessage;
  onReply?: (msg: { messageId: number; senderId: number; plaintext: string; isMine: boolean }) => void;
}

export default function MessageBubble({ message, onReply }: MessageBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleReply = useCallback(() => {
    onReply?.({
      messageId: message.id,
      senderId: message.senderId,
      plaintext: message.plaintext,
      isMine: message.isMine,
    });
  }, [onReply, message]);

  const replyPreview = message.replyToPreview;
  const hasReplyRef = message.replyToId != null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`group flex ${message.isMine ? "justify-end" : "justify-start"} mb-1`}
    >
      {/* Reply button — appears on hover (before bubble for received, after for sent) */}
      {!message.isMine && (
        <button
          onClick={handleReply}
          className="self-center mr-1 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/[0.06] transition-all duration-200"
          title="Reply"
        >
          <Reply className="w-3.5 h-3.5 text-[#64748b]" />
        </button>
      )}

      <div
        className={`max-w-[70%] px-4 py-2.5 ${
          message.isMine
            ? "bg-gradient-to-br from-[#8160ee] to-[#7a48df] text-white rounded-2xl rounded-tr-sm shadow-lg shadow-purple-500/10"
            : "bg-white/[0.06] text-[#e2e8f0] rounded-2xl rounded-tl-sm border border-white/[0.04] backdrop-blur-sm"
        }`}
      >
        {/* Reply quote block */}
        {hasReplyRef && (
          <div
            className={`mb-2 px-3 py-2 rounded-xl text-xs font-poppins border-l-[3px] ${
              message.isMine
                ? "bg-white/[0.12] border-white/40"
                : "bg-white/[0.04] border-[#8160ee]/60"
            }`}
          >
            {replyPreview ? (
              <>
                <p className={`font-semibold text-[11px] mb-0.5 ${
                  message.isMine
                    ? "text-white/80"
                    : replyPreview.isMine ? "text-[#8160ee]" : "text-[#a5b4fc]"
                }`}>
                  {replyPreview.isMine ? "You" : "Them"}
                </p>
                <p className={`truncate ${
                  message.isMine ? "text-white/60" : "text-[#94a3b8]"
                }`}>
                  {replyPreview.plaintext}
                </p>
              </>
            ) : (
              <p className={message.isMine ? "text-white/40 italic" : "text-[#4a5568] italic"}>
                Original message unavailable
              </p>
            )}
          </div>
        )}

        <p className="text-sm whitespace-pre-wrap break-words font-poppins">
          {message.plaintext}
        </p>
        <div
          className={`flex items-center gap-1 mt-0.5 ${
            message.isMine ? "justify-end" : ""
          }`}
        >
          <span
            className={`text-[10px] font-poppins ${
              message.isMine ? "text-white/60" : "text-[#4a5568]"
            }`}
          >
            {time}
          </span>
          {message.isMine &&
            (message.isRead ? (
              <CheckCheck className="w-3.5 h-3.5 text-[#a5f3fc]" />
            ) : (
              <Check className="w-3.5 h-3.5 text-white/50" />
            ))}
        </div>
      </div>

      {/* Reply button for sent messages */}
      {message.isMine && (
        <button
          onClick={handleReply}
          className="self-center ml-1 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/[0.06] transition-all duration-200"
          title="Reply"
        >
          <Reply className="w-3.5 h-3.5 text-[#64748b]" />
        </button>
      )}
    </motion.div>
  );
}
