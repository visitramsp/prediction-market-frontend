"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import type { RootState, AppDispatch } from "../../store/store";
import {
  fetchConversations,
  setActiveConversation,
  addConversation,
  addDecryptedMessage,
  setMessages,
  updateConversationLastMessage,
  fetchUnreadCount,
} from "../../store/slice/chat";
import { chatApi } from "../../service/apiService/chat";
import { useChatSocket } from "./hooks/useChatSocket";
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
} from "./crypto/e2eEncryption";
import {
  getIdentityKeyPair,
  getSignedPreKeyPair,
  getOtpPrivateKey,
  getRatchetState,
  saveRatchetState,
  cacheMessage,
  getCachedMessages,
} from "./crypto/indexedDB";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import type {
  Conversation,
  EncryptedMessage,
  DecryptedMessage,
  RatchetState,
  X3DHHeader,
} from "./types";

export default function MessagesPage() {
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

  const [mobileShowChat, setMobileShowChat] = useState(false);
  const ratchetStatesRef = useRef<Map<number, RatchetState>>(new Map());

  // E2E keys are initialized by global E2EProvider
  const e2eError = null;

  // Fetch conversations on mount
  useEffect(() => {
    if (keysReady && token) {
      dispatch(fetchConversations());
      dispatch(fetchUnreadCount());
    }
  }, [keysReady, token, dispatch]);

  // Load ratchet state from IndexedDB for a conversation
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

  // Handle incoming encrypted message
  const handleReceiveMessage = useCallback(
    async (msg: EncryptedMessage) => {
      if (!userId) return;

      try {
        let rState = await loadRatchetState(msg.conversationId);

        // If no ratchet state and there's an X3DH header, initialize as receiver
        if (!rState && msg.x3dhHeader) {
          const header: X3DHHeader = JSON.parse(msg.x3dhHeader);
          const identityKP = await getIdentityKeyPair();
          const signedPreKP = await getSignedPreKeyPair();

          if (!identityKP || !signedPreKP) {
            console.error("Missing keys for X3DH response");
            return;
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

          rState = initRatchetAsReceiver(sharedSecret, {
            publicKey: fromBase64(signedPreKP.publicKey),
            privateKey: fromBase64(signedPreKP.privateKey),
          });
        }

        if (!rState) {
          console.error("No ratchet state for conversation", msg.conversationId);
          return;
        }

        const dhPubKey = msg.dhPublicKey || toBase64(new Uint8Array(32));

        const { state: newState, plaintext } = await ratchetDecrypt(
          rState,
          msg.ciphertext,
          msg.iv,
          dhPubKey,
          msg.messageNumber
        );

        await persistRatchetState(msg.conversationId, newState);

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
        };

        dispatch(addDecryptedMessage(decrypted));
        dispatch(
          updateConversationLastMessage({
            conversationId: msg.conversationId,
            lastMessageAt: msg.createdAt,
            preview: plaintext.substring(0, 50),
          })
        );

        // Cache for scroll-back
        await cacheMessage({
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          plaintext,
          messageType: msg.messageType,
          clientMsgId: msg.clientMsgId,
          createdAt: msg.createdAt,
          isRead: false,
        });
      } catch (err) {
        console.error("Failed to decrypt message:", err);
      }
    },
    [userId, loadRatchetState, persistRatchetState, dispatch]
  );

  const handleMessageSent = useCallback(
    (data: { clientMsgId: string; messageId: number; createdAt: string }) => {
      // Could update message status in state if needed
      console.log("Message confirmed:", data.clientMsgId);
    },
    []
  );

  // Socket connection
  const { sendMessage, sendTyping, sendStopTyping, sendRead } = useChatSocket({
    token,
    onReceiveMessage: handleReceiveMessage,
    onMessageSent: handleMessageSent,
  });

  // Send encrypted message
  const handleSend = useCallback(
    async (text: string) => {
      if (!activeConversationId || !userId) return;

      const activeConv = conversations.find(
        (c) => c.id === activeConversationId
      );
      if (!activeConv) return;

      try {
        let rState = await loadRatchetState(activeConversationId);
        let x3dhHeader: string | undefined;

        // First message: perform X3DH
        if (!rState) {
          const identityKP = await getIdentityKeyPair();
          if (!identityKP) {
            console.error("Missing identity key pair");
            return;
          }

          const bundleRes = await chatApi.fetchPreKeyBundle(
            activeConv.otherUser.id
          );
          const bundle = bundleRes.data.data;

          const { sharedSecret, header } = await performX3DH(
            fromBase64(identityKP.privateKey),
            bundle
          );

          // Init ratchet as sender, using recipient's signed prekey as initial remote DH key
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

        // Optimistic: add decrypted message to local state
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
        };
        dispatch(addDecryptedMessage(decrypted));
        dispatch(
          updateConversationLastMessage({
            conversationId: activeConversationId,
            lastMessageAt: now,
            preview: text.substring(0, 50),
          })
        );

        // Send via socket
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
          clientMsgId,
        });

        // Cache locally
        await cacheMessage({
          id: decrypted.id,
          conversationId: activeConversationId,
          senderId: userId,
          plaintext: text,
          messageType: "text",
          clientMsgId,
          createdAt: now,
          isRead: false,
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
      setMobileShowChat(true);

      // Load cached messages
      const cached = await getCachedMessages(conv.id);
      if (cached.length > 0 && userId) {
        const decrypted: DecryptedMessage[] = cached.map((m) => ({
          id: m.id,
          conversationId: m.conversationId,
          senderId: m.senderId,
          plaintext: m.plaintext,
          messageType: m.messageType as "text" | "image" | "deleted",
          clientMsgId: m.clientMsgId,
          createdAt: m.createdAt,
          isRead: m.isRead,
          isMine: m.senderId === userId,
        }));
        dispatch(setMessages({ conversationId: conv.id, messages: decrypted }));
      }
    },
    [dispatch, userId]
  );

  // Start new chat
  const handleNewChat = useCallback(
    async (targetUserId: number) => {
      try {
        const res = await chatApi.startConversation(targetUserId);
        const conv = res.data.data;
        dispatch(addConversation(conv));
        dispatch(setActiveConversation(conv.id));
        setMobileShowChat(true);
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

  // Auth guard
  if (!token || !userId) {
    return (
      <div className="h-[calc(100vh-64px)] bg-[#0f172a] flex items-center justify-center">
        <p className="text-[#94a3b8]">Please log in to access messages.</p>
      </div>
    );
  }

  if (e2eError) {
    return (
      <div className="h-[calc(100vh-64px)] bg-[#0f172a] flex items-center justify-center">
        <p className="text-red-400">Encryption init failed: {e2eError}</p>
      </div>
    );
  }

  if (!keysReady) {
    return (
      <div className="h-[calc(100vh-64px)] bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#8160ee] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#94a3b8] text-sm">
            Setting up end-to-end encryption...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-[#0f172a] flex overflow-hidden">
      {/* Desktop: always show list | Mobile: toggle */}
      <div
        className={`w-full lg:w-[360px] lg:border-r lg:border-[#1e293b] flex-shrink-0 ${
          mobileShowChat ? "hidden lg:block" : "block"
        }`}
      >
        <ConversationList
          activeId={activeConversationId}
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Chat window */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mobileShowChat ? "chat" : "empty"}
          initial={{ x: mobileShowChat ? 50 : 0, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex-1 ${
            !mobileShowChat ? "hidden lg:flex" : "flex"
          }`}
        >
          <ChatWindow
            conversation={activeConv || null}
            onBack={() => {
              setMobileShowChat(false);
              dispatch(setActiveConversation(null));
            }}
            onSend={handleSend}
            onTyping={handleTyping}
            onStopTyping={handleStopTyping}
            disabled={!keysReady}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
