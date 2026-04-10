"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  FaHome,
  FaCommentAlt,
  FaBookmark,
  FaUser,
  FaUsers,
  FaHeadset,
  FaQuestionCircle,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // ✅ App Router safe
  const userId = useSelector((state: any) => state?.user?.user?.id);
  const handleMenuClick = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <>
      {/* ===== Mobile Top Bar ===== */}
      <div className="md:hidden flex items-center p-4 w-fit">
        <button
          aria-label="Toggle Menu"
          className="dark:text-white text-gray-950 text-xl -top-14 relative"
          onClick={() => setOpen(true)}
        >
          <FaBars />
        </button>
      </div>

      {/* ===== Overlay ===== */}
      {open && (
        <div
          className="fixed inset-0  md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ===== Sidebar / Drawer ===== */}
      <aside
        className={` md:relative z-50 w-64
    fixed top-0 left-0 h-full
    md:pt-5 pt-24
    py-5 pl-5 md:pl-0
    md:bg-transparent md:dark:bg-transparent
    bg-[var(--boxbg2)] dark:bg-[var(--boxbg1)]
    transition-transform duration-300
    ${open ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
    md:relative
    md:block
  `}
      >
        <div className="md:hidden flex justify-end mb-6 mt-2 relative">
          <button
            aria-label="Close Menu"
            onClick={() => setOpen(false)}
            className="dark:text-white text-gray-500 text-xl absolute top-0 right-3"
          >
            <FaTimes />
          </button>
        </div>

        <ul>
          <MenuItem
            label="Home"
            icon={<FaHome />}
            active={pathname === "/ideas/"}
            onClick={() => handleMenuClick("/ideas")}
          />

          <MenuItem
            label="Bookmarks"
            icon={<FaBookmark />}
            active={pathname === "/ideas/bookmark/"}
            onClick={() => handleMenuClick("/ideas/bookmark")}
          />

          <MenuItem
            label="Profile"
            icon={<FaUser />}
            active={pathname.startsWith(`/ideas/profile/${userId}/`)}
            onClick={() => handleMenuClick(`/ideas/profile/${userId}/`)}
          />

          <MenuItem
            label="Community Guidelines"
            icon={<FaUsers />}
            active={pathname === "/ideas/community-guidelines/"}
            onClick={() => handleMenuClick("/ideas/community-guidelines")}
          />

          <MenuItem
            label="Support"
            icon={<FaHeadset />}
            active={pathname === "/ideas/support/"}
            onClick={() => handleMenuClick("/ideas/support")}
          />

          <MenuItem
            label="FAQs"
            icon={<FaQuestionCircle />}
            active={pathname === "/ideas/faq/"}
            onClick={() => handleMenuClick("/ideas/faq")}
          />

          {/* CTA */}
          <li className="mt-6">
            {/* <Link
              href="#"
              onClick={() => setOpen(false)}
              className="block text-center bg-blue-500 hover:bg-blue-500/80
              py-2 px-4 text-white rounded font-semibold"
            >
              Post
            </Link> */}
            {/* <button
              onClick={() => setOpen(false)}
              className="block w-full text-center bg-blue-500 
             hover:bg-blue-500/80 active:bg-blue-600 
             py-2 px-4 text-white rounded font-semibold 
             transition duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg cursor-pointer"
            >
              Post
            </button> */}
          </li>
        </ul>
      </aside>
    </>
  );
}

/* ================= MENU ITEM ================= */

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function MenuItem({ icon, label, active, onClick }: MenuItemProps) {
  return (
    <li onClick={onClick} className="my-4 cursor-pointer text-sm select-none">
      <span
        className={`flex items-center gap-3 transition-colors
          ${
            active
              ? "font-semibold text-[#8160ee] font-bold"
              : "dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900"
          }
        `}
      >
        <span className="text-base">{icon}</span>
        {label}
      </span>
    </li>
  );
}
