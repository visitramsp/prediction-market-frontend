"use client";

import React from "react";
import { ArrowLeft, Lock, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import type { ChatUser } from "./types";

interface ChatHeaderProps {
  otherUser: ChatUser;
  isOnline: boolean;
  isTyping: boolean;
  onBack: () => void;
}

export default function ChatHeader({
  otherUser,
  isOnline,
  isTyping,
  onBack,
}: ChatHeaderProps) {
  const username =
    otherUser.preferences?.username || otherUser.email.split("@")[0];
  const avatar = otherUser.preferences?.imageUrl;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors lg:hidden"
      >
        <ArrowLeft className="w-5 h-5 text-[#94a3b8]" />
      </motion.button>

      <div className="relative">
        {avatar ? (
          <img
            src={avatar}
            alt={username}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/[0.08]"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8160ee]/40 to-[#7a48df]/30 flex items-center justify-center text-sm font-semibold text-white ring-2 ring-white/[0.08]">
            {username[0]?.toUpperCase()}
          </div>
        )}
        {isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22c55e] rounded-full border-2 border-[#0f172a]">
            <span className="absolute inset-0 rounded-full bg-[#22c55e] animate-ping opacity-40" />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-white truncate font-poppins">
          {username}
        </p>
        {isTyping ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-[#8160ee] font-poppins italic"
          >
            typing...
          </motion.p>
        ) : (
          <p className="text-[11px] text-[#4a5568] flex items-center gap-1.5 font-poppins">
            <Lock className="w-3 h-3" />
            <span>end-to-end encrypted</span>
            {isOnline && (
              <span className="inline-flex items-center gap-1 ml-1 text-[#22c55e]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                online
              </span>
            )}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
        >
          <MoreVertical className="w-4.5 h-4.5 text-[#64748b]" />
        </motion.button>
      </div>
    </div>
  );
}
