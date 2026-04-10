"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { chatApi } from "../../service/apiService/chat";
import { getFollowing } from "../../service/apiService/user";
import type { Conversation, DecryptedMessage, ReplyingTo, ChatUser } from "../../Pages/Messages/types";

interface ChatState {
  conversations: Conversation[];
  followedUsers: ChatUser[];
  activeConversationId: number | null;
  messages: Record<number, DecryptedMessage[]>;
  typingUsers: { conversationId: number; userId: number }[];
  onlineUserIds: number[];
  keysReady: boolean;
  conversationsLoading: boolean;
  messagesLoading: boolean;
  unreadCount: number;
  mobileChatOpen: boolean;
  replyingTo: ReplyingTo | null;
}

const initialState: ChatState = {
  conversations: [],
  followedUsers: [],
  activeConversationId: null,
  messages: {},
  typingUsers: [],
  onlineUserIds: [],
  keysReady: false,
  conversationsLoading: false,
  messagesLoading: false,
  unreadCount: 0,
  mobileChatOpen: false,
  replyingTo: null,
};

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await chatApi.fetchConversations();
      return res.data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to fetch conversations");
    }
  }
);

export const fetchFollowedUsers = createAsyncThunk(
  "chat/fetchFollowedUsers",
  async (userId: number, { rejectWithValue }) => {
    try {
      const res = await getFollowing(userId, 200, 0);
      const list = res?.following?.detailList || [];
      return list.map((item: Record<string, unknown>) => {
        const following = item.following as Record<string, unknown> | undefined;
        return {
          id: following?.id || item.followingUserId,
          email: (following?.email as string) || "",
          preferences: {
            username: following?.username as string | undefined,
            imageUrl: following?.imageUrl as string | undefined,
          },
        } as ChatUser;
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed to fetch followed users");
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "chat/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await chatApi.getUnreadCount();
      return res.data.data.unreadCount;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Failed");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setKeysReady(state, action: PayloadAction<boolean>) {
      state.keysReady = action.payload;
    },
    setActiveConversation(state, action: PayloadAction<number | null>) {
      state.activeConversationId = action.payload;
    },
    addConversation(state, action: PayloadAction<Conversation>) {
      const exists = state.conversations.find((c) => c.id === action.payload.id);
      if (!exists) {
        state.conversations.unshift(action.payload);
      }
    },
    addDecryptedMessage(
      state,
      action: PayloadAction<DecryptedMessage>
    ) {
      const msg = action.payload;
      if (!state.messages[msg.conversationId]) {
        state.messages[msg.conversationId] = [];
      }
      // Dedup by clientMsgId
      const exists = state.messages[msg.conversationId].find(
        (m) => m.clientMsgId === msg.clientMsgId
      );
      if (!exists) {
        state.messages[msg.conversationId].push(msg);
      }
    },
    setMessages(
      state,
      action: PayloadAction<{ conversationId: number; messages: DecryptedMessage[] }>
    ) {
      state.messages[action.payload.conversationId] = action.payload.messages;
    },
    addTypingUser(
      state,
      action: PayloadAction<{ conversationId: number; userId: number }>
    ) {
      const exists = state.typingUsers.find(
        (t) =>
          t.conversationId === action.payload.conversationId &&
          t.userId === action.payload.userId
      );
      if (!exists) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser(
      state,
      action: PayloadAction<{ conversationId: number; userId: number }>
    ) {
      state.typingUsers = state.typingUsers.filter(
        (t) =>
          !(
            t.conversationId === action.payload.conversationId &&
            t.userId === action.payload.userId
          )
      );
    },
    setOnlineUsers(state, action: PayloadAction<number[]>) {
      const combined = new Set([...state.onlineUserIds, ...action.payload]);
      state.onlineUserIds = Array.from(combined);
    },
    setUserOnline(state, action: PayloadAction<number>) {
      if (!state.onlineUserIds.includes(action.payload)) {
        state.onlineUserIds.push(action.payload);
      }
    },
    setUserOffline(state, action: PayloadAction<number>) {
      state.onlineUserIds = state.onlineUserIds.filter(
        (id) => id !== action.payload
      );
    },
    markMessagesRead(
      state,
      action: PayloadAction<{
        conversationId: number;
        upToMessageId: number;
      }>
    ) {
      const msgs = state.messages[action.payload.conversationId];
      if (msgs) {
        msgs.forEach((m) => {
          if (m.id <= action.payload.upToMessageId) {
            m.isRead = true;
          }
        });
      }
    },
    confirmMessage(
      state,
      action: PayloadAction<{
        clientMsgId: string;
        messageId: number;
        createdAt: string;
      }>
    ) {
      for (const convId of Object.keys(state.messages)) {
        const msgs = state.messages[Number(convId)];
        const msg = msgs.find((m) => m.clientMsgId === action.payload.clientMsgId);
        if (msg) {
          msg.id = action.payload.messageId;
          msg.createdAt = action.payload.createdAt;
          break;
        }
      }
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
    toggleMobileChat(state) {
      state.mobileChatOpen = !state.mobileChatOpen;
    },
    setMobileChatOpen(state, action: PayloadAction<boolean>) {
      state.mobileChatOpen = action.payload;
    },
    setReplyingTo(state, action: PayloadAction<ReplyingTo>) {
      state.replyingTo = action.payload;
    },
    clearReplyingTo(state) {
      state.replyingTo = null;
    },
    updateConversationLastMessage(
      state,
      action: PayloadAction<{
        conversationId: number;
        lastMessageAt: string;
        preview?: string;
      }>
    ) {
      const conv = state.conversations.find(
        (c) => c.id === action.payload.conversationId
      );
      if (conv) {
        conv.lastMessageAt = action.payload.lastMessageAt;
        if (action.payload.preview) {
          conv.lastMessagePreview = action.payload.preview;
        }
      }
      // Re-sort by last message
      state.conversations.sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsLoading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        state.conversations = action.payload.conversations;
      })
      .addCase(fetchConversations.rejected, (state) => {
        state.conversationsLoading = false;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchFollowedUsers.fulfilled, (state, action) => {
        state.followedUsers = action.payload;
      });
  },
});

export const {
  setKeysReady,
  setActiveConversation,
  addConversation,
  addDecryptedMessage,
  setMessages,
  addTypingUser,
  removeTypingUser,
  setOnlineUsers,
  setUserOnline,
  setUserOffline,
  markMessagesRead,
  confirmMessage,
  setUnreadCount,
  updateConversationLastMessage,
  toggleMobileChat,
  setMobileChatOpen,
  setReplyingTo,
  clearReplyingTo,
} = chatSlice.actions;

export default chatSlice.reducer;
