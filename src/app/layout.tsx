import { Geist, Geist_Mono, Roboto, Poppins } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/store/providers";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import SocketProvider from "@/components/socket/SocketProvider";
import TradingLayout from "@/components/TradingLayout";
import E2EProvider from "@/components/Pages/Messages/crypto/E2EProvider";

// wallet connection start
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import Web3Provider from "./Web3Provider";
// wallet connection end
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${roboto.variable} ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="globalFonts">
        <Web3Provider>
          <ReduxProvider>
            <SocketProvider>
              <ThemeProvider attribute="class" defaultTheme="system">
                <E2EProvider>
                  <TradingLayout>
                    <Toaster
                      position="bottom-center"
                      containerStyle={{
                        zIndex: 999999999, // super high
                        pointerEvents: "none", // optional (click-through)
                      }}
                      toastOptions={{
                        duration: 4000,

                        style: {
                          // Using the CSS variables we defined
                          background: "var(--toast-bg)",
                          color: "var(--toast-color)",
                          border: "1px solid var(--toast-border)",

                          // The Premium "Feel"
                          backdropFilter: "blur(12px) saturate(180%)",
                          WebkitBackdropFilter: "blur(12px) saturate(180%)", // Safari support
                          padding: "12px 20px",
                          borderRadius: "14px",
                          fontSize: "14px",
                          fontWeight: "500",
                          letterSpacing: "-0.01em",
                          boxShadow:
                            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                        },
                        success: {
                          iconTheme: {
                            primary: "#10b981",
                            secondary: "var(--toast-bg)", // Makes the checkmark "see through" to the glass
                          },
                        },
                        error: {
                          iconTheme: {
                            primary: "#ff4b4b",
                            secondary: "var(--toast-bg)",
                          },
                        },
                      }}
                    />
                    {children}
                  </TradingLayout>
                </E2EProvider>
              </ThemeProvider>
            </SocketProvider>
          </ReduxProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
