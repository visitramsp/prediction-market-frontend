"use client";

import React, { useState, useMemo } from "react";
import { Search, PenSquare, MessageCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import type { RootState } from "../../store/store";
import ConversationListItem from "./ConversationListItem";
import NewChatModal from "./NewChatModal";
import type { Conversation, ChatUser } from "./types";

interface ConversationListProps {
  activeId: number | null;
  onSelect: (conversation: Conversation) => void;
  onNewChat: (userId: number) => void;
  onNewChatModal?: () => void;
  showGeneral?: boolean;
  isGeneralActive?: boolean;
  onGeneralSelect?: () => void;
  showYou?: boolean;
  isYouActive?: boolean;
  onYouSelect?: () => void;
}

export default function ConversationList({
  activeId,
  onSelect,
  onNewChat,
  showGeneral = false,
  isGeneralActive = false,
  onGeneralSelect,
  showYou = false,
  isYouActive = false,
  onYouSelect,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const conversations = useSelector(
    (state: RootState) => state.chat.conversations,
  );
  const followedUsers = useSelector(
    (state: RootState) => state.chat.followedUsers,
  );
  const onlineUserIds = useSelector(
    (state: RootState) => state.chat.onlineUserIds,
  );

  // Merge followed users who don't have conversations yet
  const followedWithoutConv = useMemo(() => {
    const convUserIds = new Set(conversations.map((c) => c.otherUser.id));
    return followedUsers.filter((u) => !convUserIds.has(u.id));
  }, [conversations, followedUsers]);

  const filtered = search
    ? conversations.filter((c) => {
        const name =
          c.otherUser.preferences?.username || c.otherUser.email.split("@")[0];
        return name.toLowerCase().includes(search.toLowerCase());
      })
    : conversations;

  const filteredFollowed = search
    ? followedWithoutConv.filter((u) => {
        const name = u.preferences?.username || u.email.split("@")[0];
        return name.toLowerCase().includes(search.toLowerCase());
      })
    : followedWithoutConv;

  return (
    <div className="flex flex-col h-full">
      {/* Header with glass effect */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8160ee] to-[#7a48df] flex items-center justify-center shadow-lg shadow-purple-500/20">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white font-poppins tracking-tight">
            Messages
          </h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNewChat(true)}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.06] transition-all duration-200"
        >
          <PenSquare className="w-4 h-4 text-[#8160ee]" />
        </motion.button>
      </div>

      {/* Search with glass effect */}
      <div className="px-4 py-3">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] group-focus-within:text-[#8160ee] transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-white/[0.04] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 border border-gray-200 dark:border-white/[0.08] focus:border-[#8160ee]/50 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-[#8160ee]/20 placeholder:text-[#4a5568] transition-all duration-200 font-poppins"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {/* General feed option */}
        {showGeneral && (
          <button
            onClick={onGeneralSelect}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 text-left ${
              isGeneralActive
                ? "bg-[#8160ee]/10 border-l-[3px] border-[#8160ee]"
                : "hover:bg-white/[0.03] border-l-[3px] border-transparent"
            }`}
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#8160ee] to-[#7a48df] flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white font-poppins">
                General Feed
              </p>
              <p className="text-xs text-[#64748b] truncate">
                Posts from everyone you follow
              </p>
            </div>
          </button>
        )}

        {/* You option */}
        {showYou && (
          <button
            onClick={onYouSelect}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 text-left ${
              isYouActive
                ? "bg-[#8160ee]/10 border-l-[3px] border-[#8160ee]"
                : "hover:bg-white/[0.03] border-l-[3px] border-transparent"
            }`}
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white font-poppins">You</p>
              <p className="text-xs text-[#64748b] truncate">Your posts</p>
            </div>
          </button>
        )}

        {filtered.length === 0 &&
        filteredFollowed.length === 0 &&
        !showGeneral ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8160ee]/20 to-[#7a48df]/10 flex items-center justify-center mb-4 border border-white/[0.06]">
              <MessageCircle className="w-7 h-7 text-[#8160ee]/60" />
            </div>
            <p className="text-sm text-[#64748b] font-poppins mb-1">
              No conversations yet
            </p>
            <p className="text-xs text-[#4a5568] font-poppins mb-4">
              Start chatting with your connections
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowNewChat(true)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8160ee] to-[#7a48df] text-white text-sm font-medium font-poppins shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
            >
              New conversation
            </motion.button>
          </div>
        ) : (
          <>
            {filtered.map((conv) => (
              <ConversationListItem
                key={conv.id}
                conversation={conv}
                isActive={
                  conv.id === activeId && !isGeneralActive && !isYouActive
                }
                isOnline={onlineUserIds.includes(conv.otherUser.id)}
                onClick={() => onSelect(conv)}
              />
            ))}
            {filteredFollowed.length > 0 && filtered.length > 0 && (
              <div className="px-5 py-2 border-t border-white/[0.04]">
                <p className="text-[10px] font-semibold text-[#4a5568] uppercase tracking-wider font-poppins">
                  Following
                </p>
              </div>
            )}
            {filteredFollowed.map((user) => {
              const username =
                user.preferences?.username || user.email.split("@")[0];
              const avatar = user.preferences?.imageUrl;
              return (
                <motion.button
                  key={`follow-${user.id}`}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onNewChat(user.id)}
                  className="w-full flex items-center gap-3.5 px-5 py-3.5 transition-all duration-200 text-left hover:bg-white/[0.02]"
                >
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
                    {onlineUserIds.includes(user.id) && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#22c55e] rounded-full border-[2.5px] border-[#111827] shadow-sm shadow-green-500/40">
                        <span className="absolute inset-0 rounded-full bg-[#22c55e] animate-ping opacity-40" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#e2e8f0] truncate font-poppins">
                      {username}
                    </p>
                    <p className="text-[13px] text-[#64748b] font-poppins">
                      Start a conversation
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </>
        )}
      </div>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onSelectUser={(userId) => {
            setShowNewChat(false);
            onNewChat(userId);
          }}
        />
      )}
    </div>
  );
}
