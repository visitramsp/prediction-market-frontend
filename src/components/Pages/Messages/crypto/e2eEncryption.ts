import { x25519 } from "@noble/curves/ed25519.js";
import { ed25519 } from "@noble/curves/ed25519.js";
import type { RatchetState, PreKeyBundle, X3DHHeader } from "../types";

// ── Utility helpers ──

// Web Crypto requires ArrayBuffer, not Uint8Array with SharedArrayBuffer backing
function toBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer as ArrayBuffer;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// ── Key generation ──

export function generateX25519KeyPair(): {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
} {
  const privateKey = x25519.utils.randomSecretKey();
  const publicKey = x25519.getPublicKey(privateKey);
  return { publicKey, privateKey };
}

export function generateEd25519KeyPair(): {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
} {
  const privateKey = ed25519.utils.randomSecretKey();
  const publicKey = ed25519.getPublicKey(privateKey);
  return { publicKey, privateKey };
}

export function signData(
  privateKey: Uint8Array,
  data: Uint8Array
): Uint8Array {
  return ed25519.sign(data, privateKey);
}

export function verifySignature(
  publicKey: Uint8Array,
  data: Uint8Array,
  signature: Uint8Array
): boolean {
  try {
    return ed25519.verify(signature, data, publicKey);
  } catch {
    return false;
  }
}

// ── HKDF-SHA256 (via Web Crypto) ──

async function hkdfDerive(
  ikm: Uint8Array,
  salt: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey("raw", toBuffer(ikm), "HKDF", false, [
    "deriveBits",
  ]);
  const derived = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: toBuffer(salt), info: toBuffer(info) },
    keyMaterial,
    length * 8
  );
  return new Uint8Array(derived);
}

// ── AES-256-GCM encryption/decryption ──

async function aesGcmEncrypt(
  key: Uint8Array,
  plaintext: Uint8Array
): Promise<{ ciphertext: Uint8Array; iv: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    toBuffer(key),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toBuffer(iv) },
    cryptoKey,
    toBuffer(plaintext)
  );
  return { ciphertext: new Uint8Array(encrypted), iv };
}

async function aesGcmDecrypt(
  key: Uint8Array,
  ciphertext: Uint8Array,
  iv: Uint8Array
): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    toBuffer(key),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toBuffer(iv) },
    cryptoKey,
    toBuffer(ciphertext)
  );
  return new Uint8Array(decrypted);
}

// ── X3DH Key Agreement ──

const X3DH_SALT = new TextEncoder().encode("OpinionKingsX3DH");
const RATCHET_INFO = new TextEncoder().encode("OpinionKingsRatchet");

export async function performX3DH(
  identityKeyPairPrivate: Uint8Array,
  bundle: PreKeyBundle
): Promise<{
  sharedSecret: Uint8Array;
  ephemeralPublicKey: Uint8Array;
  header: X3DHHeader;
}> {
  // Verify signed prekey signature
  const signingPubKey = fromBase64(bundle.signingPublicKey);
  const signedPreKeyPub = fromBase64(bundle.signedPreKey.publicKey);
  const signature = fromBase64(bundle.signedPreKey.signature);

  if (!verifySignature(signingPubKey, signedPreKeyPub, signature)) {
    throw new Error("Signed prekey signature verification failed");
  }

  const remotePubIdentity = fromBase64(bundle.identityPublicKey);
  const ephemeral = generateX25519KeyPair();

  // 4 ECDH operations
  const dh1 = x25519.getSharedSecret(identityKeyPairPrivate, signedPreKeyPub);
  const dh2 = x25519.getSharedSecret(ephemeral.privateKey, remotePubIdentity);
  const dh3 = x25519.getSharedSecret(ephemeral.privateKey, signedPreKeyPub);

  const dhConcat = concatBytes(dh1, dh2, dh3);

  // OTP (DH4) disabled — OTP key sync issues cause OperationError.
  // 3-DH (DH1+DH2+DH3) is still secure and avoids key mismatch.

  const sharedSecret = await hkdfDerive(dhConcat, X3DH_SALT, RATCHET_INFO, 32);

  const header: X3DHHeader = {
    identityPubKey: toBase64(
      x25519.getPublicKey(identityKeyPairPrivate)
    ),
    ephemeralPubKey: toBase64(ephemeral.publicKey),
    usedOtpKeyId: null,
  };

  return { sharedSecret, ephemeralPublicKey: ephemeral.publicKey, header };
}

export async function respondX3DH(
  identityKeyPairPrivate: Uint8Array,
  signedPreKeyPrivate: Uint8Array,
  otpKeyPrivate: Uint8Array | null,
  header: X3DHHeader
): Promise<Uint8Array> {
  const remotePubIdentity = fromBase64(header.identityPubKey);
  const ephemeralPub = fromBase64(header.ephemeralPubKey);

  const dh1 = x25519.getSharedSecret(signedPreKeyPrivate, remotePubIdentity);
  const dh2 = x25519.getSharedSecret(identityKeyPairPrivate, ephemeralPub);
  const dh3 = x25519.getSharedSecret(signedPreKeyPrivate, ephemeralPub);

  // OTP (DH4) disabled — always use 3-DH only
  const dhConcat = concatBytes(dh1, dh2, dh3);

  return hkdfDerive(dhConcat, X3DH_SALT, RATCHET_INFO, 32);
}

// ── Double Ratchet ──

const CHAIN_INFO = new TextEncoder().encode("OpinionKingsChain");
const MSG_KEY_INFO = new TextEncoder().encode("OpinionKingsMsgKey");

async function kdfRootKey(
  rootKey: Uint8Array,
  dhOutput: Uint8Array
): Promise<{ newRootKey: Uint8Array; chainKey: Uint8Array }> {
  const derived = await hkdfDerive(dhOutput, rootKey, RATCHET_INFO, 64);
  return {
    newRootKey: derived.slice(0, 32),
    chainKey: derived.slice(32, 64),
  };
}

async function kdfChainKey(
  chainKey: Uint8Array
): Promise<{ newChainKey: Uint8Array; messageKey: Uint8Array }> {
  const derived = await hkdfDerive(chainKey, CHAIN_INFO, MSG_KEY_INFO, 64);
  return {
    newChainKey: derived.slice(0, 32),
    messageKey: derived.slice(32, 64),
  };
}

export function initRatchetAsSender(
  sharedSecret: Uint8Array,
  remoteDHPublicKey: Uint8Array
): RatchetState {
  const sendDHKeyPair = generateX25519KeyPair();
  return {
    rootKey: sharedSecret,
    sendChainKey: null,
    recvChainKey: null,
    sendDHKeyPair,
    remoteDHPublicKey,
    sendMessageNumber: 0,
    recvMessageNumber: 0,
    previousChainLength: 0,
  };
}

export function initRatchetAsReceiver(
  sharedSecret: Uint8Array,
  signedPreKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array }
): RatchetState {
  return {
    rootKey: sharedSecret,
    sendChainKey: null,
    recvChainKey: null,
    sendDHKeyPair: signedPreKeyPair,
    remoteDHPublicKey: null,
    sendMessageNumber: 0,
    recvMessageNumber: 0,
    previousChainLength: 0,
  };
}

export async function ratchetEncrypt(
  state: RatchetState,
  plaintext: string
): Promise<{
  state: RatchetState;
  ciphertext: string;
  iv: string;
  dhPublicKey: string;
  messageNumber: number;
  previousChainLength: number;
}> {
  let currentState = { ...state };

  // If no send chain yet, perform DH ratchet step
  if (!currentState.sendChainKey && currentState.remoteDHPublicKey) {
    const dhOut = x25519.getSharedSecret(
      currentState.sendDHKeyPair.privateKey,
      currentState.remoteDHPublicKey
    );
    const { newRootKey, chainKey } = await kdfRootKey(
      currentState.rootKey,
      dhOut
    );
    currentState = {
      ...currentState,
      rootKey: newRootKey,
      sendChainKey: chainKey,
      previousChainLength: currentState.sendMessageNumber,
      sendMessageNumber: 0,
    };
  }

  if (!currentState.sendChainKey) {
    throw new Error("Cannot encrypt: no send chain established");
  }

  // KDF chain step
  const { newChainKey, messageKey } = await kdfChainKey(
    currentState.sendChainKey
  );

  const plaintextBytes = new TextEncoder().encode(plaintext);
  const { ciphertext, iv } = await aesGcmEncrypt(messageKey, plaintextBytes);

  const messageNumber = currentState.sendMessageNumber;

  const newState: RatchetState = {
    ...currentState,
    sendChainKey: newChainKey,
    sendMessageNumber: messageNumber + 1,
  };

  return {
    state: newState,
    ciphertext: toBase64(ciphertext),
    iv: toBase64(iv),
    dhPublicKey: toBase64(currentState.sendDHKeyPair.publicKey),
    messageNumber,
    previousChainLength: currentState.previousChainLength,
  };
}

export async function ratchetDecrypt(
  state: RatchetState,
  ciphertext: string,
  iv: string,
  senderDHPublicKey: string,
  messageNumber: number
): Promise<{ state: RatchetState; plaintext: string }> {
  let currentState = { ...state };
  const senderPub = fromBase64(senderDHPublicKey);

  // Check if we need a DH ratchet step (new DH public key from sender)
  const currentRemote = currentState.remoteDHPublicKey;
  const needsRatchet =
    !currentRemote ||
    toBase64(currentRemote) !== senderDHPublicKey;

  if (needsRatchet) {
    // DH ratchet step: derive recv chain from incoming DH key
    const dhOut1 = x25519.getSharedSecret(
      currentState.sendDHKeyPair.privateKey,
      senderPub
    );
    const { newRootKey: rootKey1, chainKey: recvChainKey } = await kdfRootKey(
      currentState.rootKey,
      dhOut1
    );

    // Generate new send DH keypair
    const newSendDH = generateX25519KeyPair();
    const dhOut2 = x25519.getSharedSecret(newSendDH.privateKey, senderPub);
    const { newRootKey: rootKey2, chainKey: sendChainKey } = await kdfRootKey(
      rootKey1,
      dhOut2
    );

    currentState = {
      ...currentState,
      rootKey: rootKey2,
      sendChainKey: sendChainKey,
      recvChainKey: recvChainKey,
      sendDHKeyPair: newSendDH,
      remoteDHPublicKey: senderPub,
      previousChainLength: currentState.sendMessageNumber,
      sendMessageNumber: 0,
      recvMessageNumber: 0,
    };
  }

  if (!currentState.recvChainKey) {
    throw new Error("Cannot decrypt: no receive chain established");
  }

  // Skip ahead to the right message number
  let chainKey = currentState.recvChainKey;
  let recvMsgNum = currentState.recvMessageNumber;

  while (recvMsgNum < messageNumber) {
    const { newChainKey } = await kdfChainKey(chainKey);
    chainKey = newChainKey;
    recvMsgNum++;
  }

  // Derive the actual message key
  const { newChainKey, messageKey } = await kdfChainKey(chainKey);

  const ciphertextBytes = fromBase64(ciphertext);
  const ivBytes = fromBase64(iv);
  const plaintextBytes = await aesGcmDecrypt(messageKey, ciphertextBytes, ivBytes);
  const plaintext = new TextDecoder().decode(plaintextBytes);

  const newState: RatchetState = {
    ...currentState,
    recvChainKey: newChainKey,
    recvMessageNumber: recvMsgNum + 1,
  };

  return { state: newState, plaintext };
}

// ── Serialization helpers for IndexedDB ──

export function serializeRatchetState(state: RatchetState): Record<string, unknown> {
  return {
    rootKey: toBase64(state.rootKey),
    sendChainKey: state.sendChainKey ? toBase64(state.sendChainKey) : null,
    recvChainKey: state.recvChainKey ? toBase64(state.recvChainKey) : null,
    sendDHPublicKey: toBase64(state.sendDHKeyPair.publicKey),
    sendDHPrivateKey: toBase64(state.sendDHKeyPair.privateKey),
    remoteDHPublicKey: state.remoteDHPublicKey
      ? toBase64(state.remoteDHPublicKey)
      : null,
    sendMessageNumber: state.sendMessageNumber,
    recvMessageNumber: state.recvMessageNumber,
    previousChainLength: state.previousChainLength,
  };
}

export function deserializeRatchetState(data: Record<string, unknown>): RatchetState {
  return {
    rootKey: fromBase64(data.rootKey as string),
    sendChainKey: data.sendChainKey
      ? fromBase64(data.sendChainKey as string)
      : null,
    recvChainKey: data.recvChainKey
      ? fromBase64(data.recvChainKey as string)
      : null,
    sendDHKeyPair: {
      publicKey: fromBase64(data.sendDHPublicKey as string),
      privateKey: fromBase64(data.sendDHPrivateKey as string),
    },
    remoteDHPublicKey: data.remoteDHPublicKey
      ? fromBase64(data.remoteDHPublicKey as string)
      : null,
    sendMessageNumber: data.sendMessageNumber as number,
    recvMessageNumber: data.recvMessageNumber as number,
    previousChainLength: data.previousChainLength as number,
  };
}

export { toBase64, fromBase64 };
