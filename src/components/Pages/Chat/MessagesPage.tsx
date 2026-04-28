"use client";
import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import ConversationList from "@/components/Pages/Messages/ConversationList";
import ChatWindow from "@/components/Pages/Messages/ChatWindow";
import EmptyChat from "@/components/Pages/Messages/EmptyChat";
import { useChatActions } from "@/components/Pages/Messages/hooks/useChatActions";
import {
  setActiveConversation,
  setReplyingTo,
  clearReplyingTo,
} from "@/components/store/slice/chat";
import type { RootState, AppDispatch } from "@/components/store/store";
import type { Conversation } from "@/components/Pages/Messages/types";

export default function MessagesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [showNewChat, setShowNewChat] = useState(false);

  const {
    keysReady,
    activeConv,
    handleSend,
    handleSelectConversation,
    handleNewChat,
    handleTyping,
    handleStopTyping,
  } = useChatActions();

  const activeConversationId = useSelector(
    (state: RootState) => state.chat.activeConversationId,
  );
  const replyingTo = useSelector((state: RootState) => state.chat.replyingTo);

  const handleSelectConv = useCallback(
    (conv: Conversation) => {
      handleSelectConversation(conv);
    },
    [handleSelectConversation],
  );

  const handleBack = useCallback(() => {
    dispatch(setActiveConversation(null));
    dispatch(clearReplyingTo());
  }, [dispatch]);

  const handleNewChatStart = useCallback(() => {
    setShowNewChat(true);
  }, []);

  const handleReply = useCallback(
    (msg: {
      messageId: number;
      senderId: number;
      plaintext: string;
      isMine: boolean;
    }) => {
      if (!activeConversationId) return;
      dispatch(
        setReplyingTo({
          conversationId: activeConversationId,
          messageId: msg.messageId,
          senderId: msg.senderId,
          plaintext: msg.plaintext,
          isMine: msg.isMine,
        }),
      );
    },
    [dispatch, activeConversationId],
  );

  const handleCancelReply = useCallback(() => {
    dispatch(clearReplyingTo());
  }, [dispatch]);

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden dark:bg-chat-background">
      {/* Subtle animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#8160ee]/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#7a48df]/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative h-full max-w-[1600px] mx-auto flex">
        {/* Desktop: side-by-side layout */}
        {/* Conversation list — left panel */}
        <div className="hidden lg:flex w-[360px] xl:w-[380px] flex-shrink-0 flex-col">
          <div className="h-full m-2 ml-3 rounded-2xl overflow-hidden border border-white/[0.06] dark:bg-[#1a1a1a]/30 backdrop-blur-xl shadow-2xl shadow-black/20">
            <ConversationList
              activeId={activeConversationId}
              onSelect={handleSelectConv}
              onNewChat={handleNewChat}
              onNewChatModal={handleNewChatStart}
            />
          </div>
        </div>

        {/* Chat window — right panel */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="h-full m-2 mr-3 rounded-2xl overflow-hidden border border-white/[0.06] dark:bg-[#1a1a1a]/30 backdrop-blur-xl shadow-2xl shadow-black/20">
            {/* Mobile: show conversation list or chat */}
            <div className="lg:hidden h-full">
              <AnimatePresence mode="wait">
                {activeConv ? (
                  <motion.div
                    key="chat"
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="h-full"
                  >
                    <ChatWindow
                      conversation={activeConv}
                      onBack={handleBack}
                      onSend={handleSend}
                      onTyping={handleTyping}
                      onStopTyping={handleStopTyping}
                      disabled={!keysReady}
                      replyingTo={replyingTo}
                      onReply={handleReply}
                      onCancelReply={handleCancelReply}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="h-full"
                  >
                    <ConversationList
                      activeId={activeConversationId}
                      onSelect={handleSelectConv}
                      onNewChat={handleNewChat}
                      onNewChatModal={handleNewChatStart}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop: chat or empty state */}
            <div className="hidden lg:flex h-full flex-col">
              {activeConv ? (
                <ChatWindow
                  conversation={activeConv}
                  onBack={handleBack}
                  onSend={handleSend}
                  onTyping={handleTyping}
                  onStopTyping={handleStopTyping}
                  disabled={!keysReady}
                  replyingTo={replyingTo}
                  onReply={handleReply}
                  onCancelReply={handleCancelReply}
                />
              ) : (
                <EmptyChat onNewChat={() => setShowNewChat(true)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
