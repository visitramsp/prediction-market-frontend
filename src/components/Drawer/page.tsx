"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
interface RightDrawerProps {
  buttonLabel?: React.ReactNode;
  className?: string;
}

export default function Drawer({ buttonLabel, className }: RightDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeDrawer = () => {
    setIsOpen(false);
  };
  return (
    <>
      {/* Button to open drawer */}
      <button
        onClick={() => {
          setIsOpen(true);
        }}
        className={`cursor-pointer text-white px-3 py-2 ${className ?? ""}`}
      >
        {buttonLabel}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}></div>
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0  right-0 h-full w-64 bg-white dark:bg-[#1e293b] shadow-lg z-50 transform transition-transform duration-300  ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-600 border-gray-300">
          <div className=" flex items-center gap-2">
             {/* Light mode logo */}
              <Image
                src="/img/opinionLogo-dark.png"
                alt="Opinion logo"
                width={40}
                height={40}
                className="h-auto block dark:hidden"
                priority
              />
            
              {/* Dark mode logo */}
              <Image
                src="/img/opinionLogo-light.png"
                alt="Opinion logo"
                width={40}
                height={40}
                className="h-auto hidden dark:block"
                priority
              />
            <span className="font-serif text-xl dark:text-gray-300 text-gray-600">
              Opinion Kings
            </span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300 hover:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Drawer Content (Scrollable) */}
        <div className="space-y-2.5 mt-5">
          {/* Privacy Policy */}
          <Link
            href="/ideas"
            onClick={closeDrawer}
            className="block px-4 rounded-lg text-base font-medium text-gray-600 dark:text-gray-400 
                            dark:hover:bg-gray-800 hover:text-[#c6a872] transition"
          >
            Ideas
          </Link>
          <Link
            href="/privacyPolicy"
            onClick={closeDrawer}
            className="block px-4 rounded-lg text-base font-medium text-gray-600 dark:text-gray-400 
                            dark:hover:bg-gray-800 hover:text-[#c6a872] transition"
          >
            Privacy Policy
          </Link>

          {/* Terms & Conditions */}
          <Link
            href="/termsAndConditions"
            onClick={closeDrawer}
            className="block px-4 rounded-lg text-base font-medium text-gray-600 dark:text-gray-400 
                            dark:hover:bg-gray-800 hover:text-[#c6a872] transition"
          >
            Terms & Conditions
          </Link>
        </div>
      </div>
    </>
  );
}
