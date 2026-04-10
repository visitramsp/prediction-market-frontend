"use client";

import React from "react";
import { Lock, MessageCircle, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyChatProps {
  onNewChat?: () => void;
}

export default function EmptyChat({ onNewChat }: EmptyChatProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      {/* Animated lock icon with glow */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-[#22c55e]/20 blur-xl" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#22c55e]/20 to-[#16a34a]/10 flex items-center justify-center border border-[#22c55e]/20 shadow-lg shadow-green-500/10">
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{ perspective: 200 }}
          >
            <Lock className="w-9 h-9 text-[#22c55e]" />
          </motion.div>
        </div>
      </motion.div>

      <motion.h3
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="text-xl font-semibold text-white mb-2 font-poppins"
      >
        Your messages are end-to-end encrypted
      </motion.h3>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="text-[#64748b] text-sm max-w-xs mb-2 font-poppins"
      >
        No one outside of this chat, not even Opinion Kings, can read or listen
        to them.
      </motion.p>

      {/* Security badges */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="flex items-center gap-3 mt-3 mb-6"
      >
        <div className="flex items-center gap-1.5 text-[10px] text-[#4a5568] bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1 font-poppins">
          <Shield className="w-3 h-3 text-[#22c55e]" />
          Signal Protocol
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#4a5568] bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1 font-poppins">
          <Lock className="w-3 h-3 text-[#8160ee]" />
          X3DH + Double Ratchet
        </div>
      </motion.div>

      {/* CTA button */}
      {onNewChat && (
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNewChat}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8160ee] to-[#7a48df] text-white text-sm font-medium font-poppins shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
        >
          <MessageCircle className="w-4 h-4" />
          Start a conversation
        </motion.button>
      )}
    </div>
  );
}
