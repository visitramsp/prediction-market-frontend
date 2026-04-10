const DB_NAME_PREFIX = "opinionkings_e2e";
const DB_VERSION = 4;

const STORES = {
  KEYS: "keys",
  RATCHET_STATES: "ratchet_states",
  MESSAGE_CACHE: "message_cache",
} as const;

/** Get per-user DB name. Falls back to global DB if no user is logged in. */
function getDBName(): string {
  if (typeof window === "undefined") return `${DB_NAME_PREFIX}_0`;
  try {
    const raw = localStorage.getItem("persist:user");
    if (raw) {
      const parsed = JSON.parse(raw);
      const userStr = parsed?.user;
      if (userStr && userStr !== "null") {
        const user = JSON.parse(userStr);
        if (user?.id) return `${DB_NAME_PREFIX}_${user.id}`;
      }
    }
  } catch {
    // ignore parse errors
  }
  return `${DB_NAME_PREFIX}_0`;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(getDBName(), DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      if (!db.objectStoreNames.contains(STORES.KEYS)) {
        db.createObjectStore(STORES.KEYS);
      }
      if (!db.objectStoreNames.contains(STORES.RATCHET_STATES)) {
        db.createObjectStore(STORES.RATCHET_STATES);
      }
      if (!db.objectStoreNames.contains(STORES.MESSAGE_CACHE)) {
        const msgStore = db.createObjectStore(STORES.MESSAGE_CACHE, {
          keyPath: "id",
        });
        msgStore.createIndex("conversationId", "conversationId", {
          unique: false,
        });
      }

      // Migration v4: full reset — clear ALL stores to force fresh key generation
      // and fresh X3DH handshakes (fixes OTP key desync causing OperationError)
      if (oldVersion < 4) {
        const tx = request.transaction;
        if (tx) {
          tx.objectStore(STORES.KEYS).clear();
          tx.objectStore(STORES.RATCHET_STATES).clear();
          tx.objectStore(STORES.MESSAGE_CACHE).clear();
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getFromStore<T>(
  storeName: string,
  key: string
): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

async function putToStore<T>(
  storeName: string,
  key: string,
  value: T
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function deleteFromStore(
  storeName: string,
  key: string
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Key storage
export async function saveIdentityKeyPair(keyPair: {
  publicKey: string;
  privateKey: string;
}): Promise<void> {
  await putToStore(STORES.KEYS, "identityKeyPair", keyPair);
}

export async function getIdentityKeyPair(): Promise<
  { publicKey: string; privateKey: string } | undefined
> {
  return getFromStore(STORES.KEYS, "identityKeyPair");
}

export async function saveSigningKeyPair(keyPair: {
  publicKey: string;
  privateKey: string;
}): Promise<void> {
  await putToStore(STORES.KEYS, "signingKeyPair", keyPair);
}

export async function getSigningKeyPair(): Promise<
  { publicKey: string; privateKey: string } | undefined
> {
  return getFromStore(STORES.KEYS, "signingKeyPair");
}

export async function saveSignedPreKeyPair(data: {
  keyId: number;
  publicKey: string;
  privateKey: string;
  signature: string;
}): Promise<void> {
  await putToStore(STORES.KEYS, "signedPreKeyPair", data);
}

export async function getSignedPreKeyPair(): Promise<
  | { keyId: number; publicKey: string; privateKey: string; signature: string }
  | undefined
> {
  return getFromStore(STORES.KEYS, "signedPreKeyPair");
}

export async function saveOtpPrivateKeys(
  keys: { keyId: number; privateKey: string }[]
): Promise<void> {
  const existing =
    (await getFromStore<{ keyId: number; privateKey: string }[]>(
      STORES.KEYS,
      "otpPrivateKeys"
    )) || [];
  await putToStore(STORES.KEYS, "otpPrivateKeys", [...existing, ...keys]);
}

export async function getOtpPrivateKey(
  keyId: number
): Promise<string | undefined> {
  const keys =
    (await getFromStore<{ keyId: number; privateKey: string }[]>(
      STORES.KEYS,
      "otpPrivateKeys"
    )) || [];
  return keys.find((k) => k.keyId === keyId)?.privateKey;
}

// Clear only encryption keys (preserves ratchet states for existing conversations)
export async function clearKeysOnly(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.KEYS, "readwrite");
    tx.objectStore(STORES.KEYS).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Clear all encryption keys AND ratchet states (full reset)
export async function clearAllKeys(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(
      [STORES.KEYS, STORES.RATCHET_STATES],
      "readwrite"
    );
    tx.objectStore(STORES.KEYS).clear();
    tx.objectStore(STORES.RATCHET_STATES).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Ratchet state storage (keyed by conversationId)
export async function saveRatchetState(
  conversationId: number,
  state: Record<string, unknown>
): Promise<void> {
  await putToStore(STORES.RATCHET_STATES, String(conversationId), state);
}

export async function getRatchetState(
  conversationId: number
): Promise<Record<string, unknown> | undefined> {
  return getFromStore(STORES.RATCHET_STATES, String(conversationId));
}

export async function deleteRatchetState(
  conversationId: number
): Promise<void> {
  await deleteFromStore(STORES.RATCHET_STATES, String(conversationId));
}

// Message cache
export interface CachedMessage {
  id: number;
  conversationId: number;
  senderId: number;
  plaintext: string;
  messageType: string;
  clientMsgId: string;
  createdAt: string;
  isRead: boolean;
  replyToId?: number | null;
  replyToPreview?: { senderId: number; plaintext: string } | null;
}

export async function cacheMessage(message: CachedMessage): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.MESSAGE_CACHE, "readwrite");
    const store = tx.objectStore(STORES.MESSAGE_CACHE);
    const request = store.put(message);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getCachedMessages(
  conversationId: number,
  limit: number = 50
): Promise<CachedMessage[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.MESSAGE_CACHE, "readonly");
    const store = tx.objectStore(STORES.MESSAGE_CACHE);
    const index = store.index("conversationId");
    const request = index.getAll(conversationId);
    request.onsuccess = () => {
      const results = (request.result as CachedMessage[])
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(-limit);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function confirmCachedMessage(
  clientMsgId: string,
  serverId: number,
  createdAt: string
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.MESSAGE_CACHE, "readwrite");
    const store = tx.objectStore(STORES.MESSAGE_CACHE);
    const cursorReq = store.openCursor();
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (!cursor) {
        resolve();
        return;
      }
      const msg = cursor.value as CachedMessage;
      if (msg.clientMsgId === clientMsgId && msg.id !== serverId) {
        // Delete old entry with temporary ID
        cursor.delete();
        // Insert with real server ID
        store.put({ ...msg, id: serverId, createdAt });
        tx.oncomplete = () => resolve();
        return;
      }
      cursor.continue();
    };
    cursorReq.onerror = () => reject(cursorReq.error);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Check if a message with the given clientMsgId already exists in cache.
 * Used to skip re-decryption of messages already processed.
 */
export async function isCachedByClientMsgId(
  clientMsgId: string
): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.MESSAGE_CACHE, "readonly");
    const store = tx.objectStore(STORES.MESSAGE_CACHE);
    const cursorReq = store.openCursor();
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (!cursor) {
        resolve(false);
        return;
      }
      const msg = cursor.value as CachedMessage;
      if (msg.clientMsgId === clientMsgId) {
        resolve(true);
        return;
      }
      cursor.continue();
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
}

export async function getCachedMessageById(
  messageId: number
): Promise<CachedMessage | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.MESSAGE_CACHE, "readonly");
    const store = tx.objectStore(STORES.MESSAGE_CACHE);
    const request = store.get(messageId);
    request.onsuccess = () =>
      resolve(request.result as CachedMessage | undefined);
    request.onerror = () => reject(request.error);
  });
}
