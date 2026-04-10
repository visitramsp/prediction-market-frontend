export interface ChatUser {
  id: number;
  email: string;
  preferences: {
    username?: string;
    imageUrl?: string;
  };
}

export interface Conversation {
  id: number;
  otherUser: ChatUser;
  lastMessageAt: string | null;
  createdAt: string;
  unreadCount?: number;
  lastMessagePreview?: string;
}

export interface EncryptedMessage {
  id: number;
  conversationId: number;
  senderId: number;
  ciphertext: string;
  iv: string;
  cipherType: "aes-gcm" | "chacha20";
  messageType: "text" | "image" | "deleted";
  x3dhHeader?: string | null;
  dhPublicKey?: string | null;
  messageNumber: number;
  previousChainLength: number;
  replyToId?: number | null;
  clientMsgId: string;
  createdAt: string;
  isRead?: boolean;
}

export interface DecryptedMessage {
  id: number;
  conversationId: number;
  senderId: number;
  plaintext: string;
  messageType: "text" | "image" | "deleted";
  clientMsgId: string;
  createdAt: string;
  isRead: boolean;
  isMine: boolean;
  replyToId?: number | null;
  replyToPreview?: {
    senderId: number;
    plaintext: string;
    isMine: boolean;
  } | null;
}

export interface PreKeyBundle {
  identityPublicKey: string;
  signingPublicKey: string;
  signedPreKey: {
    keyId: number;
    publicKey: string;
    signature: string;
  };
  oneTimePreKey: {
    keyId: number;
    publicKey: string;
  } | null;
}

export interface X3DHHeader {
  identityPubKey: string;
  ephemeralPubKey: string;
  usedOtpKeyId: number | null;
}

export interface RatchetState {
  rootKey: Uint8Array;
  sendChainKey: Uint8Array | null;
  recvChainKey: Uint8Array | null;
  sendDHKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array };
  remoteDHPublicKey: Uint8Array | null;
  sendMessageNumber: number;
  recvMessageNumber: number;
  previousChainLength: number;
}

export interface SendMessagePayload {
  conversationId: number;
  recipientId: number;
  ciphertext: string;
  iv: string;
  cipherType: "aes-gcm" | "chacha20";
  messageType: string;
  x3dhHeader?: string;
  dhPublicKey: string;
  messageNumber: number;
  previousChainLength: number;
  replyToId?: number;
  clientMsgId: string;
}

export interface ReplyingTo {
  conversationId: number;
  messageId: number;
  senderId: number;
  plaintext: string;
  isMine: boolean;
}
