"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TypingIndicator() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="flex items-center gap-1.5 bg-white/[0.06] border border-white/[0.04] rounded-2xl rounded-tl-sm px-4 py-3 w-fit backdrop-blur-sm"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-[#8160ee]"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              delay: i * 0.15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
