"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Header from "./Layout/Header/page";
import WatchList from "./Layout/WatchList";
import Footer from "./Layout/Footer/page";
import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import DotsNavPage from "./common/Customdots";
const SidebarContext = createContext({ isSidebarOpen: false });
export const useSidebar = () => useContext(SidebarContext);

export default function TradingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isReelsPage = pathname?.startsWith("/reels");
  const isMessagesPage = pathname?.startsWith("/messages");
  const isProfilePage = pathname?.startsWith("/userProfile");

  const hideLayoutPages = ["/register", "/login", "/forgot-password"]; // Add more if needed

  const isHideLayout = hideLayoutPages.some((path) =>
    pathname?.startsWith(path),
  );
  return (
    <DotsNavPage>
      <div
        className={`min-h-screen ${isReelsPage ? "h-screen overflow-hidden" : ""}`}
      >
        <div className="md:block hidden">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.aside
                initial={{ x: -380 }}
                animate={{ x: 0 }}
                exit={{ x: -380 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-24 left-0 h-[calc(100vh-64px)] w-[380px] border-r border-gray-100 dark:border-gray-800  dark:bg-bgdark z-40"
              >
                <div className="">
                  <WatchList />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
        <div
          className={`transition-all duration-300 ${
            isSidebarOpen ? "md:pl-[380px]" : "pl-0"
          }`}
        >
          {!isHideLayout && (
            <Header isPosition={isSidebarOpen} setPosition={setIsSidebarOpen} />
          )}

          <SidebarContext.Provider value={{ isSidebarOpen }}>
            <main className={!isHideLayout && "pt-16 "}>{children}</main>
          </SidebarContext.Provider>
          {!isHideLayout &&
            !isReelsPage &&
            !isMessagesPage &&
            !isProfilePage && <Footer isPosition={isSidebarOpen} />}
        </div>
      </div>
    </DotsNavPage>
  );
}
