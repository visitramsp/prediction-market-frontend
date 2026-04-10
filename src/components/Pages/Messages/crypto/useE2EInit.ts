"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  generateX25519KeyPair,
  generateEd25519KeyPair,
  signData,
  toBase64,
  fromBase64,
} from "./e2eEncryption";
import {
  getIdentityKeyPair,
  saveIdentityKeyPair,
  getSigningKeyPair,
  saveSigningKeyPair,
  getSignedPreKeyPair,
  saveSignedPreKeyPair,
  saveOtpPrivateKeys,
  clearKeysOnly,
} from "./indexedDB";
import { chatApi } from "../../../service/apiService/chat";

const OTP_KEY_COUNT = 100;
const OTP_REPLENISH_THRESHOLD = 10;
const MAX_RETRIES = 3;

export function useE2EInit(enabled: boolean = true) {
  const [keysReady, setKeysReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retriesRef = useRef(0);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const retry = useCallback(() => {
    if (retriesRef.current < MAX_RETRIES) {
      retriesRef.current += 1;
      setError(null);
      setRetryTrigger((t) => t + 1);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function reUploadExistingKeys(
      existingIdentity: { publicKey: string; privateKey: string },
      existingSigning: { publicKey: string; privateKey: string } | undefined
    ) {
      // Re-use ALL existing keys (identity, signing, signed prekey) and only
      // generate fresh OTP keys. This prevents signed prekey changes that would
      // break in-flight X3DH handshakes from other users.
      let signingPub: string;
      let signingPrivBytes: Uint8Array;

      if (existingSigning) {
        signingPub = existingSigning.publicKey;
        signingPrivBytes = fromBase64(existingSigning.privateKey);
      } else {
        const newSigning = generateEd25519KeyPair();
        signingPub = toBase64(newSigning.publicKey);
        signingPrivBytes = newSigning.privateKey;
        await saveSigningKeyPair({
          publicKey: signingPub,
          privateKey: toBase64(newSigning.privateKey),
        });
      }

      // Reuse existing signed prekey if available
      const existingSignedPreKey = await getSignedPreKeyPair();
      let signedPreKeyData: { keyId: number; publicKey: string; signature: string };

      if (existingSignedPreKey) {
        // Reuse the same signed prekey — critical for X3DH consistency
        signedPreKeyData = {
          keyId: existingSignedPreKey.keyId,
          publicKey: existingSignedPreKey.publicKey,
          signature: existingSignedPreKey.signature,
        };
      } else {
        // No signed prekey in IndexedDB — generate fresh
        const signedPreKP = generateX25519KeyPair();
        const signature = signData(signingPrivBytes, signedPreKP.publicKey);
        const signedPreKeyId = Date.now();
        signedPreKeyData = {
          keyId: signedPreKeyId,
          publicKey: toBase64(signedPreKP.publicKey),
          signature: toBase64(signature),
        };
        await saveSignedPreKeyPair({
          keyId: signedPreKeyId,
          publicKey: toBase64(signedPreKP.publicKey),
          privateKey: toBase64(signedPreKP.privateKey),
          signature: toBase64(signature),
        });
      }

      // Generate only fresh OTP keys
      const baseId = Date.now();
      const otpKeys: { keyId: number; publicKey: string; privateKey: string }[] = [];
      for (let i = 0; i < OTP_KEY_COUNT; i++) {
        const kp = generateX25519KeyPair();
        otpKeys.push({
          keyId: baseId + i + 1,
          publicKey: toBase64(kp.publicKey),
          privateKey: toBase64(kp.privateKey),
        });
      }

      await chatApi.uploadPreKeyBundle({
        identityPublicKey: existingIdentity.publicKey,
        signingPublicKey: signingPub,
        signedPreKey: signedPreKeyData,
        oneTimePreKeys: otpKeys.map((k) => ({ keyId: k.keyId, publicKey: k.publicKey })),
      });

      await saveOtpPrivateKeys(
        otpKeys.map((k) => ({ keyId: k.keyId, privateKey: k.privateKey }))
      );
    }

    async function generateAndUploadFreshKeys() {
      // Generate all new keys from scratch
      const identityKP = generateX25519KeyPair();
      const signingKP = generateEd25519KeyPair();
      const signedPreKP = generateX25519KeyPair();
      const signature = signData(signingKP.privateKey, signedPreKP.publicKey);
      const signedPreKeyId = 1;

      const otpKeys: { keyId: number; publicKey: string; privateKey: string }[] = [];
      for (let i = 0; i < OTP_KEY_COUNT; i++) {
        const kp = generateX25519KeyPair();
        otpKeys.push({
          keyId: i + 1,
          publicKey: toBase64(kp.publicKey),
          privateKey: toBase64(kp.privateKey),
        });
      }

      // Upload to server FIRST — if this fails, don't save to IndexedDB
      await chatApi.uploadPreKeyBundle({
        identityPublicKey: toBase64(identityKP.publicKey),
        signingPublicKey: toBase64(signingKP.publicKey),
        signedPreKey: {
          keyId: signedPreKeyId,
          publicKey: toBase64(signedPreKP.publicKey),
          signature: toBase64(signature),
        },
        oneTimePreKeys: otpKeys.map((k) => ({
          keyId: k.keyId,
          publicKey: k.publicKey,
        })),
      });

      // Server accepted — now save private keys to IndexedDB
      await saveIdentityKeyPair({
        publicKey: toBase64(identityKP.publicKey),
        privateKey: toBase64(identityKP.privateKey),
      });
      await saveSigningKeyPair({
        publicKey: toBase64(signingKP.publicKey),
        privateKey: toBase64(signingKP.privateKey),
      });
      await saveSignedPreKeyPair({
        keyId: signedPreKeyId,
        publicKey: toBase64(signedPreKP.publicKey),
        privateKey: toBase64(signedPreKP.privateKey),
        signature: toBase64(signature),
      });
      await saveOtpPrivateKeys(
        otpKeys.map((k) => ({ keyId: k.keyId, privateKey: k.privateKey }))
      );
    }

    async function init() {
      try {
        const existingIdentity = await getIdentityKeyPair();

        if (!existingIdentity) {
          // First time: generate and upload fresh keys
          await generateAndUploadFreshKeys();
        } else {
          // Keys exist in IndexedDB — verify server has them too
          const existingSigning = await getSigningKeyPair();

          try {
            const countRes = await chatApi.getOtpKeyCount();
            const serverCount = countRes?.data?.data?.count ?? countRes?.data?.count ?? 0;

            if (serverCount === 0) {
              // Server has NO OTP keys — try re-uploading existing keys first
              console.warn("Server missing keys, re-uploading existing identity with fresh OTP keys");
              try {
                await reUploadExistingKeys(existingIdentity, existingSigning);
              } catch (reuploadErr) {
                // Re-upload failed (corrupt/stale keys) — nuke and regenerate
                console.warn("Re-upload failed, clearing keys and generating fresh", reuploadErr);
                await clearKeysOnly();
                await generateAndUploadFreshKeys();
              }
            } else if (serverCount < OTP_REPLENISH_THRESHOLD) {
              // Replenish OTP keys
              const newKeys: { keyId: number; publicKey: string; privateKey: string }[] = [];
              const baseId = Date.now();
              for (let i = 0; i < 50; i++) {
                const kp = generateX25519KeyPair();
                newKeys.push({
                  keyId: baseId + i,
                  publicKey: toBase64(kp.publicKey),
                  privateKey: toBase64(kp.privateKey),
                });
              }

              await chatApi.replenishOtpKeys(
                newKeys.map((k) => ({ keyId: k.keyId, publicKey: k.publicKey }))
              );

              await saveOtpPrivateKeys(
                newKeys.map((k) => ({ keyId: k.keyId, privateKey: k.privateKey }))
              );
            }
          } catch (e) {
            console.error("Could not sync keys with server, clearing and regenerating", e);
            // Existing keys are corrupted or stale — full reset
            await clearKeysOnly();
            await generateAndUploadFreshKeys();
          }
        }

        if (!cancelled) setKeysReady(true);
      } catch (err: unknown) {
        console.error("E2E init error:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "E2E init failed");
          // Auto-retry after a delay
          if (retriesRef.current < MAX_RETRIES) {
            setTimeout(() => {
              if (!cancelled) retry();
            }, 2000);
          }
        }
      }
    }

    if (enabled) {
      init();
    }
    return () => {
      cancelled = true;
    };
  }, [retryTrigger, retry, enabled]);

  return { keysReady, error, retry };
}
