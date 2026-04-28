const ALGORITHM = "AES-CBC";

const KEY_SECRET = "hello";

// ✅ Key banana — same as Node ka sha256("hello")

async function getKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();

  const keyData = await window.crypto.subtle.digest(
    "SHA-256",

    encoder.encode(KEY_SECRET),
  );

  return window.crypto.subtle.importKey(
    "raw",

    keyData,

    { name: ALGORITHM },

    false,

    ["encrypt", "decrypt"],
  );
}

// ✅ Helper functions

function uint8ArrayToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))

    .map((b) => b.toString(16).padStart(2, "0"))

    .join("");
}

function hexToUint8Array(hex: string): Uint8Array<ArrayBuffer> {
  const arr = new Uint8Array(hex.length / 2);

  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }

  return arr as Uint8Array<ArrayBuffer>;
}

// ✅ Encrypt

export async function encrypt(text: string): Promise<string> {
  try {
    const key = await getKey();

    const encoder = new TextEncoder();

    // Random 16 bytes IV — same as Node ka randomBytes(16)

    const iv = window.crypto.getRandomValues(new Uint8Array(16));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: ALGORITHM, iv },

      key,

      encoder.encode(text),
    );

    const ivHex = uint8ArrayToHex(iv.buffer as ArrayBuffer);

    const encryptedHex = uint8ArrayToHex(encryptedBuffer);

    // ✅ Same format as Node: "ivHex:encryptedHex"

    return `${ivHex}:${encryptedHex}`;
  } catch (error) {
    throw new Error("Encryption failed");
  }
}

// ✅ Decrypt

export async function decrypt(data: string): Promise<string> {
  try {
    if (!data || !data.includes(":")) {
      throw new Error("Invalid encrypted data format");
    }

    const separatorIndex = data.indexOf(":");

    const ivHex = data.substring(0, separatorIndex);

    const encryptedHex = data.substring(separatorIndex + 1);

    // ✅ IV length check

    if (ivHex.length !== 32) {
      throw new Error(`Invalid IV length: ${ivHex.length} (expected 32)`);
    }

    const iv = hexToUint8Array(ivHex);

    const encryptedBytes = hexToUint8Array(encryptedHex);

    const key = await getKey();

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: ALGORITHM, iv },

      key,

      encryptedBytes,
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    throw new Error("Decryption failed");
  }
}
