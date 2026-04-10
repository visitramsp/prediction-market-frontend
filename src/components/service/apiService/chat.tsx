"use client";

import apiInstance from "../apiInstance";

export const chatApi = {
  uploadPreKeyBundle: (bundle: {
    identityPublicKey: string;
    signingPublicKey: string;
    signedPreKey: { keyId: number; publicKey: string; signature: string };
    oneTimePreKeys: { keyId: number; publicKey: string }[];
  }) => apiInstance.post("/chat/keys", bundle),

  fetchPreKeyBundle: (userId: number) =>
    apiInstance.get(`/chat/keys/${userId}`),

  replenishOtpKeys: (keys: { keyId: number; publicKey: string }[]) =>
    apiInstance.post("/chat/keys/replenish", { keys }),

  getOtpKeyCount: () => apiInstance.get("/chat/keys/count"),

  fetchConversations: (limit: number = 20, cursor?: number) =>
    apiInstance.get("/chat/conversations", {
      params: { limit, ...(cursor ? { cursor } : {}) },
    }),

  startConversation: (targetUserId: number) =>
    apiInstance.post("/chat/conversations", { targetUserId }),

  fetchMessages: (
    conversationId: number,
    limit: number = 50,
    cursor?: number
  ) =>
    apiInstance.get(`/chat/conversations/${conversationId}/messages`, {
      params: { limit, ...(cursor ? { cursor } : {}) },
    }),

  markConversationRead: (conversationId: number, upToMessageId: number) =>
    apiInstance.post(`/chat/conversations/${conversationId}/read`, {
      upToMessageId,
    }),

  getUnreadCount: () => apiInstance.get("/chat/unread-count"),
};
