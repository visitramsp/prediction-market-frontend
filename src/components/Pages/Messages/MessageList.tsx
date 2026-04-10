"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import type { DecryptedMessage } from "./types";

interface MessageListProps {
  messages: DecryptedMessage[];
  isTyping: boolean;
  onReply?: (msg: { messageId: number; senderId: number; plaintext: string; isMine: boolean }) => void;
}

export default function MessageList({ messages, isTyping, onReply }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    // Auto-scroll on new messages
    if (messages.length > prevLengthRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevLengthRef.current = messages.length;
  }, [messages.length]);

  const sorted = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages]
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
      {sorted.map((msg) =>
        msg.senderId === 0 ? (
          <div key={msg.clientMsgId} className="flex justify-center my-3">
            <p className="text-xs text-[#64748b] bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-1.5 font-poppins">
              {msg.plaintext}
            </p>
          </div>
        ) : (
          <MessageBubble key={msg.clientMsgId} message={msg} onReply={onReply} />
        )
      )}
      <AnimatePresence>
        {isTyping && <TypingIndicator />}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
