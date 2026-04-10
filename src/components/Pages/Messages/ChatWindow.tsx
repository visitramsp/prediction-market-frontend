"use client";

import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import EmptyChat from "./EmptyChat";
import type { Conversation, ReplyingTo } from "./types";

interface ChatWindowProps {
  conversation: Conversation | null;
  onBack: () => void;
  onSend: (text: string, replyToId?: number) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
  replyingTo?: ReplyingTo | null;
  onReply?: (msg: { messageId: number; senderId: number; plaintext: string; isMine: boolean }) => void;
  onCancelReply?: () => void;
}

export default function ChatWindow({
  conversation,
  onBack,
  onSend,
  onTyping,
  onStopTyping,
  disabled,
  replyingTo,
  onReply,
  onCancelReply,
}: ChatWindowProps) {
  const messages = useSelector((state: RootState) =>
    conversation ? state.chat.messages[conversation.id] || [] : []
  );
  const onlineUserIds = useSelector(
    (state: RootState) => state.chat.onlineUserIds
  );
  const typingUsers = useSelector(
    (state: RootState) => state.chat.typingUsers
  );

  const handleSend = useCallback(
    (text: string) => {
      onSend(text, replyingTo?.messageId);
    },
    [onSend, replyingTo]
  );

  if (!conversation) {
    return (
      <div className="flex-1 h-full">
        <EmptyChat />
      </div>
    );
  }

  const isOnline = onlineUserIds.includes(conversation.otherUser.id);
  const isTyping = typingUsers.some(
    (t) =>
      t.conversationId === conversation.id &&
      t.userId === conversation.otherUser.id
  );

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        otherUser={conversation.otherUser}
        isOnline={isOnline}
        isTyping={isTyping}
        onBack={onBack}
      />
      <MessageList messages={messages} isTyping={isTyping} onReply={onReply} />
      <ChatInput
        onSend={handleSend}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
        disabled={disabled}
        replyingTo={replyingTo}
        onCancelReply={onCancelReply}
      />
    </div>
  );
}
