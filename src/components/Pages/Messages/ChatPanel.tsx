"use client";

import React, { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import type { RootState, AppDispatch } from "../../store/store";
import { setActiveConversation, setReplyingTo, clearReplyingTo } from "../../store/slice/chat";
import { useChatActions } from "./hooks/useChatActions";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

export default function ChatPanel() {
  const dispatch = useDispatch<AppDispatch>();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = useSelector(
    (state: RootState) => state.user?.user?.id
  ) as number | undefined;
  const activeConversationId = useSelector(
    (state: RootState) => state.chat.activeConversationId
  );
  const replyingTo = useSelector(
    (state: RootState) => state.chat.replyingTo
  );

  const [showChat, setShowChat] = useState(false);

  const {
    keysReady,
    e2eError,
    activeConv,
    handleSend,
    handleSelectConversation,
    handleNewChat,
    handleTyping,
    handleStopTyping,
  } = useChatActions();

  const onSelect = useCallback(
    (conv: Parameters<typeof handleSelectConversation>[0]) => {
      handleSelectConversation(conv);
      setShowChat(true);
    },
    [handleSelectConversation]
  );

  const onNewChat = useCallback(
    (targetUserId: number) => {
      handleNewChat(targetUserId);
      setShowChat(true);
    },
    [handleNewChat]
  );

  const handleReply = useCallback(
    (msg: { messageId: number; senderId: number; plaintext: string; isMine: boolean }) => {
      if (!activeConversationId) return;
      dispatch(
        setReplyingTo({
          conversationId: activeConversationId,
          messageId: msg.messageId,
          senderId: msg.senderId,
          plaintext: msg.plaintext,
          isMine: msg.isMine,
        })
      );
    },
    [dispatch, activeConversationId]
  );

  const handleCancelReply = useCallback(() => {
    dispatch(clearReplyingTo());
  }, [dispatch]);

  if (!token || !userId) return null;

  if (e2eError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-400 text-xs">Encryption error</p>
      </div>
    );
  }

  if (!keysReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-[#8160ee] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {!showChat || !activeConv ? (
          <motion.div
            key="list"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            <ConversationList
              activeId={activeConversationId}
              onSelect={onSelect}
              onNewChat={onNewChat}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            <ChatWindow
              conversation={activeConv}
              onBack={() => {
                setShowChat(false);
                dispatch(setActiveConversation(null));
                dispatch(clearReplyingTo());
              }}
              onSend={handleSend}
              onTyping={handleTyping}
              onStopTyping={handleStopTyping}
              disabled={!keysReady}
              replyingTo={replyingTo}
              onReply={handleReply}
              onCancelReply={handleCancelReply}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
