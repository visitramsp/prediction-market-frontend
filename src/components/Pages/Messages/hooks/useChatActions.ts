"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../store/store";
import {
  fetchConversations,
  fetchFollowedUsers,
  setActiveConversation,
  addConversation,
  addDecryptedMessage,
  setMessages,
  updateConversationLastMessage,
  fetchUnreadCount,
  clearReplyingTo,
  confirmMessage,
} from "../../../store/slice/chat";
import { chatApi } from "../../../service/apiService/chat";
import { useChatSocket } from "./useChatSocket";
import {
  performX3DH,
  respondX3DH,
  initRatchetAsSender,
  initRatchetAsReceiver,
  ratchetEncrypt,
  ratchetDecrypt,
  serializeRatchetState,
  deserializeRatchetState,
  fromBase64,
  toBase64,
} from "../crypto/e2eEncryption";
import {
  getIdentityKeyPair,
  getSignedPreKeyPair,
  getOtpPrivateKey,
  getRatchetState,
  saveRatchetState,
  deleteRatchetState,
  cacheMessage,
  getCachedMessages,
  getCachedMessageById,
  confirmCachedMessage,
  isCachedByClientMsgId,
} from "../crypto/indexedDB";
import type {
  Conversation,
  EncryptedMessage,
  DecryptedMessage,
  RatchetState,
  X3DHHeader,
} from "../types";

export function useChatActions() {
  const dispatch = useDispatch<AppDispatch>();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = useSelector(
    (state: RootState) => state.user?.user?.id
  ) as number | undefined;

  const activeConversationId = useSelector(
    (state: RootState) => state.chat.activeConversationId
  );
  const conversations = useSelector(
    (state: RootState) => state.chat.conversations
  );
  const keysReady = useSelector((state: RootState) => state.chat.keysReady);

  const ratchetStatesRef = useRef<Map<number, RatchetState>>(new Map());
  const activeConversationIdRef = useRef<number | null>(activeConversationId);
  activeConversationIdRef.current = activeConversationId;
  const sendReadRef = useRef<(data: { conversationId: number; senderId: number; upToMessageId: number }) => void>(() => {});

  // E2E error from global provider (keysReady comes from Redux now)
  const e2eError = null;

  // Fetch conversations and followed users on mount
  useEffect(() => {
    if (keysReady && token) {
      dispatch(fetchConversations());
      dispatch(fetchUnreadCount());
      if (userId) {
        dispatch(fetchFollowedUsers(userId));
      }
    }
  }, [keysReady, token, userId, dispatch]);

  // Load ratchet state from IndexedDB
  const loadRatchetState = useCallback(
    async (convId: number): Promise<RatchetState | null> => {
      const cached = ratchetStatesRef.current.get(convId);
      if (cached) return cached;

      const stored = await getRatchetState(convId);
      if (stored) {
        const state = deserializeRatchetState(stored);
        ratchetStatesRef.current.set(convId, state);
        return state;
      }
      return null;
    },
    []
  );

  // Save ratchet state
  const persistRatchetState = useCallback(
    async (convId: number, state: RatchetState) => {
      ratchetStatesRef.current.set(convId, state);
      await saveRatchetState(convId, serializeRatchetState(state));
    },
    []
  );

  // Initialize ratchet from X3DH header
  const initFromX3DH = useCallback(
    async (x3dhHeader: string): Promise<RatchetState | null> => {
      const header: X3DHHeader = JSON.parse(x3dhHeader);
      const identityKP = await getIdentityKeyPair();
      const signedPreKP = await getSignedPreKeyPair();

      if (!identityKP || !signedPreKP) {
        console.error("Missing keys for X3DH response");
        return null;
      }

      let otpPrivate: Uint8Array | null = null;
      if (header.usedOtpKeyId !== null) {
        const otpKey = await getOtpPrivateKey(header.usedOtpKeyId);
        if (otpKey) otpPrivate = fromBase64(otpKey);
      }

      const sharedSecret = await respondX3DH(
        fromBase64(identityKP.privateKey),
        fromBase64(signedPreKP.privateKey),
        otpPrivate,
        header
      );

      return initRatchetAsReceiver(sharedSecret, {
        publicKey: fromBase64(signedPreKP.publicKey),
        privateKey: fromBase64(signedPreKP.privateKey),
      });
    },
    []
  );

  // Handle incoming encrypted message
  const handleReceiveMessage = useCallback(
    async (msg: EncryptedMessage) => {
      if (!userId) return;

      try {
        // Skip if this message was already decrypted and cached (e.g. re-delivered on reconnect)
        const alreadyCached = await isCachedByClientMsgId(msg.clientMsgId);
        if (alreadyCached) {
          return;
        }

        let rState = await loadRatchetState(msg.conversationId);

        if (!rState && msg.x3dhHeader) {
          rState = await initFromX3DH(msg.x3dhHeader);
        }

        if (!rState) {
          console.error("No ratchet state for conversation", msg.conversationId);
          // Show placeholder so the message isn't silently lost
          const placeholder: DecryptedMessage = {
            id: msg.id,
            conversationId: msg.conversationId,
            senderId: msg.senderId,
            plaintext: "⚠️ Unable to decrypt — encryption session expired. New messages will work normally.",
            messageType: "text",
            clientMsgId: msg.clientMsgId,
            createdAt: msg.createdAt,
            isRead: false,
            isMine: false,
            replyToId: null,
            replyToPreview: null,
          };
          dispatch(addDecryptedMessage(placeholder));
          return;
        }

        const dhPubKey = msg.dhPublicKey || toBase64(new Uint8Array(32));

        let newState: RatchetState;
        let plaintext: string;

        try {
          ({ state: newState, plaintext } = await ratchetDecrypt(
            rState,
            msg.ciphertext,
            msg.iv,
            dhPubKey,
            msg.messageNumber
          ));
        } catch (decryptErr) {
          // Decryption failed — if message has X3DH header, the sender likely
          // regenerated keys. Clear stale ratchet state and retry with fresh X3DH.
          if (msg.x3dhHeader) {
            console.warn("Decrypt failed, retrying with fresh X3DH handshake");
            ratchetStatesRef.current.delete(msg.conversationId);
            await deleteRatchetState(msg.conversationId);

            const freshState = await initFromX3DH(msg.x3dhHeader);
            if (!freshState) {
              console.error("X3DH re-init failed");
              return;
            }

            ({ state: newState, plaintext } = await ratchetDecrypt(
              freshState,
              msg.ciphertext,
              msg.iv,
              dhPubKey,
              msg.messageNumber
            ));
          } else {
            // No X3DH header — ratchet is desynchronized. Reset it so the
            // next outgoing message triggers a fresh X3DH handshake.
            console.warn("Decrypt failed without X3DH header, resetting session for conv", msg.conversationId);
            ratchetStatesRef.current.delete(msg.conversationId);
            await deleteRatchetState(msg.conversationId);
            throw decryptErr;
          }
        }

        await persistRatchetState(msg.conversationId, newState);

        // Resolve reply preview from cache
        let replyToPreview: DecryptedMessage["replyToPreview"] = null;
        if (msg.replyToId) {
          const cached = await getCachedMessageById(msg.replyToId);
          if (cached) {
            replyToPreview = {
              senderId: cached.senderId,
              plaintext: cached.plaintext,
              isMine: cached.senderId === userId,
            };
          }
        }

        const decrypted: DecryptedMessage = {
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          plaintext,
          messageType: msg.messageType,
          clientMsgId: msg.clientMsgId,
          createdAt: msg.createdAt,
          isRead: false,
          isMine: false,
          replyToId: msg.replyToId,
          replyToPreview,
        };

        dispatch(addDecryptedMessage(decrypted));
        dispatch(
          updateConversationLastMessage({
            conversationId: msg.conversationId,
            lastMessageAt: msg.createdAt,
            preview: plaintext.substring(0, 50),
          })
        );

        // Auto-send read receipt if this conversation is currently active
        if (activeConversationIdRef.current === msg.conversationId) {
          sendReadRef.current({
            conversationId: msg.conversationId,
            senderId: msg.senderId,
            upToMessageId: msg.id,
          });
        }

        await cacheMessage({
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          plaintext,
          messageType: msg.messageType,
          clientMsgId: msg.clientMsgId,
          createdAt: msg.createdAt,
          isRead: false,
          replyToId: msg.replyToId,
          replyToPreview: replyToPreview
            ? { senderId: replyToPreview.senderId, plaintext: replyToPreview.plaintext }
            : null,
        });
      } catch (err) {
        console.error("Failed to decrypt message:", err);
        // Show placeholder so the message isn't silently lost
        if (userId) {
          const placeholder: DecryptedMessage = {
            id: msg.id,
            conversationId: msg.conversationId,
            senderId: msg.senderId,
            plaintext: "⚠️ Unable to decrypt this message.",
            messageType: "text",
            clientMsgId: msg.clientMsgId,
            createdAt: msg.createdAt,
            isRead: false,
            isMine: false,
            replyToId: null,
            replyToPreview: null,
          };
          dispatch(addDecryptedMessage(placeholder));
        }
      }
    },
    [userId, loadRatchetState, initFromX3DH, persistRatchetState, dispatch]
  );

  const handleMessageSent = useCallback(
    async (data: { clientMsgId: string; messageId: number; createdAt: string }) => {
      dispatch(confirmMessage(data));
      // Update IndexedDB: replace temporary Date.now() ID with real server ID
      // so future reply lookups by replyToId can find the message
      await confirmCachedMessage(data.clientMsgId, data.messageId, data.createdAt);
    },
    [dispatch]
  );

  // Socket connection
  const { sendMessage, sendTyping, sendStopTyping, sendRead } = useChatSocket({
    token,
    onReceiveMessage: handleReceiveMessage,
    onMessageSent: handleMessageSent,
  });
  sendReadRef.current = sendRead;

  // Send encrypted message
  const handleSend = useCallback(
    async (text: string, replyToId?: number) => {
      if (!activeConversationId || !userId) return;

      const activeConv = conversations.find(
        (c) => c.id === activeConversationId
      );
      if (!activeConv) return;

      try {
        let rState = await loadRatchetState(activeConversationId);
        let x3dhHeader: string | undefined;

        if (!rState) {
          const identityKP = await getIdentityKeyPair();
          if (!identityKP) {
            console.error("Missing identity key pair");
            return;
          }

          let bundleRes;
          try {
            bundleRes = await chatApi.fetchPreKeyBundle(
              activeConv.otherUser.id
            );
          } catch (bundleErr: unknown) {
            const axErr = bundleErr as Record<string, unknown>;
            const resp = axErr?.response as Record<string, unknown> | undefined;
            if (resp?.status === 404) {
              console.error("Recipient has not set up encryption keys yet");
              alert("This user hasn't set up their encryption keys yet. They need to open the chat page first.");
            }
            throw bundleErr;
          }
          const bundle = bundleRes.data.data;

          const { sharedSecret, header } = await performX3DH(
            fromBase64(identityKP.privateKey),
            bundle
          );

          rState = initRatchetAsSender(
            sharedSecret,
            fromBase64(bundle.signedPreKey.publicKey)
          );

          x3dhHeader = JSON.stringify(header);
        }

        const {
          state: newState,
          ciphertext,
          iv,
          dhPublicKey,
          messageNumber,
          previousChainLength,
        } = await ratchetEncrypt(rState, text);

        await persistRatchetState(activeConversationId, newState);

        const clientMsgId = crypto.randomUUID();
        const now = new Date().toISOString();

        // Resolve reply preview from Redux store
        let replyToPreview: DecryptedMessage["replyToPreview"] = null;
        if (replyToId) {
          const cached = await getCachedMessageById(replyToId);
          if (cached) {
            replyToPreview = {
              senderId: cached.senderId,
              plaintext: cached.plaintext,
              isMine: cached.senderId === userId,
            };
          }
        }

        const decrypted: DecryptedMessage = {
          id: Date.now(),
          conversationId: activeConversationId,
          senderId: userId,
          plaintext: text,
          messageType: "text",
          clientMsgId,
          createdAt: now,
          isRead: false,
          isMine: true,
          replyToId: replyToId || null,
          replyToPreview,
        };
        dispatch(addDecryptedMessage(decrypted));
        dispatch(clearReplyingTo());
        dispatch(
          updateConversationLastMessage({
            conversationId: activeConversationId,
            lastMessageAt: now,
            preview: text.substring(0, 50),
          })
        );

        sendMessage({
          conversationId: activeConversationId,
          recipientId: activeConv.otherUser.id,
          ciphertext,
          iv,
          cipherType: "aes-gcm",
          messageType: "text",
          x3dhHeader,
          dhPublicKey,
          messageNumber,
          previousChainLength,
          replyToId,
          clientMsgId,
        });

        await cacheMessage({
          id: decrypted.id,
          conversationId: activeConversationId,
          senderId: userId,
          plaintext: text,
          messageType: "text",
          clientMsgId,
          createdAt: now,
          isRead: false,
          replyToId: replyToId || null,
          replyToPreview: replyToPreview
            ? { senderId: replyToPreview.senderId, plaintext: replyToPreview.plaintext }
            : null,
        });
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    },
    [
      activeConversationId,
      userId,
      conversations,
      loadRatchetState,
      persistRatchetState,
      sendMessage,
      dispatch,
    ]
  );

  // Select conversation
  const handleSelectConversation = useCallback(
    async (conv: Conversation) => {
      dispatch(setActiveConversation(conv.id));
      dispatch(clearReplyingTo());

      // 1. Show cached messages instantly for fast UX
      const cached = await getCachedMessages(conv.id);
      const cachedClientMsgIds = new Set(cached.map((m) => m.clientMsgId));

      if (cached.length > 0 && userId) {
        const cacheMap = new Map(cached.map((m) => [m.id, m]));
        const decrypted: DecryptedMessage[] = cached.map((m) => {
          let replyToPreview: DecryptedMessage["replyToPreview"] = null;
          if (m.replyToId) {
            // First try the persisted preview (saved alongside the message)
            if (m.replyToPreview) {
              replyToPreview = {
                senderId: m.replyToPreview.senderId,
                plaintext: m.replyToPreview.plaintext,
                isMine: m.replyToPreview.senderId === userId,
              };
            } else {
              // Fall back to looking up in current cache batch
              const original = cacheMap.get(m.replyToId);
              if (original) {
                replyToPreview = {
                  senderId: original.senderId,
                  plaintext: original.plaintext,
                  isMine: original.senderId === userId,
                };
              }
            }
          }
          return {
            id: m.id,
            conversationId: m.conversationId,
            senderId: m.senderId,
            plaintext: m.plaintext,
            messageType: m.messageType as "text" | "image" | "deleted",
            clientMsgId: m.clientMsgId,
            createdAt: m.createdAt,
            isRead: m.isRead,
            isMine: m.senderId === userId,
            replyToId: m.replyToId,
            replyToPreview,
          };
        });
        dispatch(setMessages({ conversationId: conv.id, messages: decrypted }));
      }

      // 2. Fetch from server to sync any messages missed while offline
      try {
        const res = await chatApi.fetchMessages(conv.id, 50);
        const serverMessages = res.data.data.messages as EncryptedMessage[];

        if (serverMessages && serverMessages.length > 0) {
          // Process only messages NOT already in our local cache (by clientMsgId)
          const missedMessages = serverMessages
            .filter((m: EncryptedMessage) => !cachedClientMsgIds.has(m.clientMsgId))
            .sort((a: EncryptedMessage, b: EncryptedMessage) => a.id - b.id); // chronological order for ratchet

          let undecryptableCount = 0;

          for (const msg of missedMessages) {
            // Only decrypt incoming messages (not our own sent messages)
            if (msg.senderId !== userId) {
              let rState = await loadRatchetState(conv.id);

              if (!rState && msg.x3dhHeader) {
                rState = await initFromX3DH(msg.x3dhHeader);
              }

              if (!rState) {
                // No ratchet and no X3DH header — silently cache so we don't retry
                undecryptableCount++;
                await cacheMessage({
                  id: msg.id,
                  conversationId: msg.conversationId,
                  senderId: msg.senderId,
                  plaintext: "",
                  messageType: "text",
                  clientMsgId: msg.clientMsgId,
                  createdAt: msg.createdAt,
                  isRead: true,
                  replyToId: null,
                });
                continue;
              }

              try {
                const dhPubKey = msg.dhPublicKey || toBase64(new Uint8Array(32));
                let newState: RatchetState;
                let plaintext: string;

                try {
                  ({ state: newState, plaintext } = await ratchetDecrypt(
                    rState,
                    msg.ciphertext,
                    msg.iv,
                    dhPubKey,
                    msg.messageNumber
                  ));
                } catch (firstDecryptErr) {
                  // Decrypt failed — try fresh X3DH handshake if header available
                  if (msg.x3dhHeader) {
                    console.warn("Decrypt failed in sync, retrying with fresh X3DH");
                    ratchetStatesRef.current.delete(conv.id);
                    await deleteRatchetState(conv.id);
                    const freshState = await initFromX3DH(msg.x3dhHeader);
                    if (!freshState) throw firstDecryptErr;
                    ({ state: newState, plaintext } = await ratchetDecrypt(
                      freshState,
                      msg.ciphertext,
                      msg.iv,
                      dhPubKey,
                      msg.messageNumber
                    ));
                  } else {
                    throw firstDecryptErr;
                  }
                }

                await persistRatchetState(conv.id, newState);

                const decrypted: DecryptedMessage = {
                  id: msg.id,
                  conversationId: msg.conversationId,
                  senderId: msg.senderId,
                  plaintext,
                  messageType: msg.messageType,
                  clientMsgId: msg.clientMsgId,
                  createdAt: msg.createdAt,
                  isRead: false,
                  isMine: false,
                  replyToId: msg.replyToId || null,
                  replyToPreview: null,
                };
                dispatch(addDecryptedMessage(decrypted));

                await cacheMessage({
                  id: msg.id,
                  conversationId: msg.conversationId,
                  senderId: msg.senderId,
                  plaintext,
                  messageType: msg.messageType,
                  clientMsgId: msg.clientMsgId,
                  createdAt: msg.createdAt,
                  isRead: false,
                  replyToId: msg.replyToId || null,
                });
              } catch (decryptErr) {
                console.warn("Failed to decrypt server message, caching as skipped:", msg.id);
                // Cache as empty so we don't retry — silently skip
                undecryptableCount++;
                await cacheMessage({
                  id: msg.id,
                  conversationId: msg.conversationId,
                  senderId: msg.senderId,
                  plaintext: "",
                  messageType: "text",
                  clientMsgId: msg.clientMsgId,
                  createdAt: msg.createdAt,
                  isRead: true,
                  replyToId: null,
                });
              }
            }
          }

          // Show a single banner if old messages couldn't be decrypted
          if (undecryptableCount > 0) {
            dispatch(addDecryptedMessage({
              id: -Date.now(),
              conversationId: conv.id,
              senderId: 0,
              plaintext: `🔒 ${undecryptableCount} earlier message${undecryptableCount > 1 ? "s" : ""} couldn't be decrypted due to an encryption session change.`,
              messageType: "system" as "text",
              clientMsgId: `system_undecryptable_${conv.id}_${Date.now()}`,
              createdAt: new Date(0).toISOString(),
              isRead: true,
              isMine: false,
              replyToId: null,
              replyToPreview: null,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch server messages:", err);
      }

      // 3. Send read receipt for latest unread message
      if (userId) {
        const allCached = await getCachedMessages(conv.id);
        const unreadFromOther = allCached
          .filter((m) => m.senderId !== userId && !m.isRead)
          .sort((a, b) => b.id - a.id);
        if (unreadFromOther.length > 0) {
          sendReadRef.current({
            conversationId: conv.id,
            senderId: unreadFromOther[0].senderId,
            upToMessageId: unreadFromOther[0].id,
          });
        }
      }
    },
    [dispatch, userId, loadRatchetState, initFromX3DH, persistRatchetState]
  );

  // Start new chat
  const handleNewChat = useCallback(
    async (targetUserId: number) => {
      try {
        const res = await chatApi.startConversation(targetUserId);
        const conv = res.data.data;
        dispatch(addConversation(conv));
        dispatch(setActiveConversation(conv.id));
      } catch (err) {
        console.error("Failed to start conversation:", err);
      }
    },
    [dispatch]
  );

  // Typing handlers
  const activeConv = conversations.find(
    (c) => c.id === activeConversationId
  );

  const handleTyping = useCallback(() => {
    if (activeConversationId && activeConv) {
      sendTyping({
        conversationId: activeConversationId,
        recipientId: activeConv.otherUser.id,
      });
    }
  }, [activeConversationId, activeConv, sendTyping]);

  const handleStopTyping = useCallback(() => {
    if (activeConversationId && activeConv) {
      sendStopTyping({
        conversationId: activeConversationId,
        recipientId: activeConv.otherUser.id,
      });
    }
  }, [activeConversationId, activeConv, sendStopTyping]);

  return {
    keysReady,
    e2eError,
    activeConv,
    handleSend,
    handleSelectConversation,
    handleNewChat,
    handleTyping,
    handleStopTyping,
    sendRead,
  };
}
