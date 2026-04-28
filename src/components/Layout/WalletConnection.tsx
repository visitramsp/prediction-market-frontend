"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";

export const WalletConnection = () => {
  const prevConnected = useRef<boolean | null>(null);
  const { isConnected } = useAccount();
  console.log(isConnected, "isConnected");

  useEffect(() => {
    if (prevConnected.current === null) {
      prevConnected.current = isConnected;
      return;
    }
    if (prevConnected.current === true && isConnected === false) {
      toast.error("Wallet Disconnected");
    }

    prevConnected.current = isConnected;
  }, [isConnected]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";

        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!ready) {
          return null;
        }

        // ❌ Not Connected
        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="px-2 text-nowrap py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium"
            >
              Connect Wallet
            </button>
          );
        }

        // ❌ Wrong Network
        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="px-4 py-2 rounded-lg bg-red-500 text-white"
            >
              Wrong Network
            </button>
          );
        }

        // ✅ Connected UI
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={openAccountModal}
              className="px-4 py-2 rounded-lg !bg-gray-300 dark:!bg-gray-900 text-gray-800 dark:text-white font-medium"
            >
              {account.displayName}
              {account.displayBalance ? ` (${account.displayBalance})` : ""}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
