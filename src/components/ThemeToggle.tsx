"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="relative w-8 h-8 cursor-pointer rounded-full bg-[var(--color-bglight)] dark:bg-[var(--color-bgdark)] 
                 flex items-center justify-center
                 transition-colors duration-300 overflow-hidden"
    >
      {/* SUN ICON */}
      <span
        className={`
          absolute transition-all duration-500 ease-in-out
          ${
            resolvedTheme === "light"
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 rotate-180 opacity-0"
          }
        `}
      >
        {/* <svg
          className="w-5 h-5 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg> */}
        <Moon className="w-5 h-5 text-gray-500 inline-block" />
      </span>

      {/* MOON ICON */}
      <span
        className={`
          absolute transition-all duration-500 ease-in-out
          ${
            resolvedTheme === "dark"
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 -rotate-180 opacity-0"
          }
        `}
      >
        <Sun className="w-5 h-5 text-gray-500 inline-block" />
      </span>
    </button>
  );
}
