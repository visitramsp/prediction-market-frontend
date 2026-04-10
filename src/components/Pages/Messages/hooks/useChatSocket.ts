"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useDispatch } from "react-redux";
import { basedURLs } from "../../../service/apiInstance";
import {
  addTypingUser,
  removeTypingUser,
  setOnlineUsers,
  setUserOnline,
  setUserOffline,
  markMessagesRead,
  fetchConversations,
  fetchUnreadCount,
} from "../../../store/slice/chat";
import type { AppDispatch } from "../../../store/store";
import type { EncryptedMessage } from "../types";

interface UseChatSocketOptions {
  token: string | null;
  onReceiveMessage: (msg: EncryptedMessage) => void;
  onMessageSent: (data: { clientMsgId: string; messageId: number; createdAt: string }) => void;
}

export function useChatSocket({ token, onReceiveMessage, onMessageSent }: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  // Stable refs so socket doesn't reconnect when callbacks change
  const onReceiveRef = useRef(onReceiveMessage);
  const onSentRef = useRef(onMessageSent);
  onReceiveRef.current = onReceiveMessage;
  onSentRef.current = onMessageSent;

  useEffect(() => {
    if (!token) return;

    const socket = io(`${basedURLs}/chat`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Chat socket connected");
      // Refresh conversation list and unread counts on (re)connect
      // to pick up any messages received while offline
      dispatch(fetchConversations());
      dispatch(fetchUnreadCount());
    });

    socket.on("chat:receive", (data: EncryptedMessage) => {
      onReceiveRef.current(data);
    });

    socket.on("chat:sent", (data: { clientMsgId: string; messageId: number; createdAt: string }) => {
      onSentRef.current(data);
    });

    socket.on("chat:typing", (data: { conversationId: number; userId: number }) => {
      dispatch(addTypingUser(data));
    });

    socket.on("chat:stop_typing", (data: { conversationId: number; userId: number }) => {
      dispatch(removeTypingUser(data));
    });

    socket.on("chat:read", (data: { conversationId: number; upToMessageId: number }) => {
      dispatch(markMessagesRead(data));
    });

    socket.on("chat:online_users", (userIds: number[]) => {
      dispatch(setOnlineUsers(userIds));
    });

    socket.on("chat:online", (data: { userId: number }) => {
      dispatch(setUserOnline(data.userId));
    });

    socket.on("chat:offline", (data: { userId: number }) => {
      dispatch(setUserOffline(data.userId));
    });

    socket.on("connect_error", (err) => {
      console.error("Chat socket error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, dispatch]);

  const sendMessage = useCallback(
    (payload: Record<string, unknown>) => {
      socketRef.current?.emit("chat:send", payload);
    },
    []
  );

  const sendTyping = useCallback(
    (data: { conversationId: number; recipientId: number }) => {
      socketRef.current?.emit("chat:typing", data);
    },
    []
  );

  const sendStopTyping = useCallback(
    (data: { conversationId: number; recipientId: number }) => {
      socketRef.current?.emit("chat:stop_typing", data);
    },
    []
  );

  const sendRead = useCallback(
    (data: { conversationId: number; senderId: number; upToMessageId: number }) => {
      socketRef.current?.emit("chat:read", data);
    },
    []
  );

  return { sendMessage, sendTyping, sendStopTyping, sendRead };
}
