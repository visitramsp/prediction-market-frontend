import { useState, useRef, useEffect } from "react";
import { FaCog } from "react-icons/fa";

export default function FilterDropdown() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("open");
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Cog Button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <FaCog className="text-gray-700 dark:text-gray-300" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
            Filter by status
          </div>

          <div className="p-3 space-y-3 text-sm">
            {[
              { label: "All markets", value: "all" },
              { label: "Open markets", value: "open" },
              { label: "Closed markets", value: "closed" },
            ].map((item) => (
              <label
                key={item.value}
                className="flex items-center gap-3 cursor-pointer text-gray-700 dark:text-gray-300"
              >
                <input
                  type="radio"
                  name="status"
                  checked={status === item.value}
                  onChange={() => setStatus(item.value)}
                  className="accent-green-500"
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
