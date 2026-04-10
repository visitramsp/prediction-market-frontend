"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Conversation } from "./types";

interface ConversationListItemProps {
  conversation: Conversation;
  isActive: boolean;
  isOnline: boolean;
  onClick: () => void;
}

export default function ConversationListItem({
  conversation,
  isActive,
  isOnline,
  onClick,
}: ConversationListItemProps) {
  const user = conversation.otherUser;
  const username = user.preferences?.username || user.email.split("@")[0];
  const avatar = user.preferences?.imageUrl;
  const time = conversation.lastMessageAt
    ? new Date(conversation.lastMessageAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-5 py-3.5 transition-all duration-200 text-left relative ${
        isActive
          ? "bg-[#8160ee]/[0.08]"
          : "hover:bg-white/[0.02]"
      }`}
    >
      {/* Active indicator bar */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-300 ${
          isActive ? "h-8 bg-gradient-to-b from-[#8160ee] to-[#7a48df] shadow-md shadow-purple-500/30" : "h-0 bg-transparent"
        }`}
      />

      {/* Avatar with online indicator */}
      <div className="relative flex-shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={username}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/[0.06]"
          />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8160ee]/30 to-[#7a48df]/20 flex items-center justify-center text-sm font-semibold text-white ring-2 ring-white/[0.06]">
            {username[0]?.toUpperCase()}
          </div>
        )}
        {isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#22c55e] rounded-full border-[2.5px] border-[#111827] shadow-sm shadow-green-500/40">
            <span className="absolute inset-0 rounded-full bg-[#22c55e] animate-ping opacity-40" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p
            className={`text-[15px] truncate font-poppins ${
              conversation.unreadCount
                ? "font-semibold text-white"
                : "font-medium text-[#e2e8f0]"
            }`}
          >
            {username}
          </p>
          <span className="text-[11px] text-[#4a5568] flex-shrink-0 ml-2 font-poppins">
            {time}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-[13px] text-[#64748b] truncate font-poppins">
            {conversation.lastMessagePreview || (conversation.lastMessageAt ? "Encrypted message" : "No messages yet")}
          </p>
          {conversation.unreadCount ? (
            <span className="flex-shrink-0 ml-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-gradient-to-r from-[#8160ee] to-[#7a48df] text-white text-[10px] flex items-center justify-center font-semibold shadow-md shadow-purple-500/30">
              {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </motion.button>
  );
}
