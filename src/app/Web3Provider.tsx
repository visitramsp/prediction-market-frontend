"use client";

import {
  darkTheme,
  getDefaultConfig,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { bscTestnet, mainnet, polygon } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";

const config = getDefaultConfig({
  appName: "Prediction Market",
  projectId: "b7bd623749ace05f4e15f931e2ecf63b", // ✅ env use karo
  chains: [bscTestnet],
});

const queryClient = new QueryClient();

export default function Web3Provider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  const isDark = theme === "dark";
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={
            isDark
              ? darkTheme({
                  accentColor: "#8b5cf6", // match your purple UI
                  accentColorForeground: "white",
                  borderRadius: "large",
                  overlayBlur: "small",
                })
              : lightTheme({
                  accentColor: "#8b5cf6",
                  accentColorForeground: "white",
                  borderRadius: "large",
                  overlayBlur: "small",
                })
          }
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
