import { Geist, Geist_Mono, Roboto, Poppins } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/store/providers";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import SocketProvider from "@/components/socket/SocketProvider";
import TradingLayout from "@/components/TradingLayout";
import E2EProvider from "@/components/Pages/Messages/crypto/E2EProvider";
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
        <ReduxProvider>
          <SocketProvider>
            <ThemeProvider attribute="class" defaultTheme="system">
              <E2EProvider>
                <TradingLayout>
                  <Toaster position="bottom-center" />
                  {children}
                </TradingLayout>
              </E2EProvider>
            </ThemeProvider>
          </SocketProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
