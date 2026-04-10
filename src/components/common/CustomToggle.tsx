import React from "react";

interface customToggle {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export const CustomToggle = ({ label, checked, onChange }: customToggle) => {
  return (
    <label className="flex items-center gap-2 px-4 py-1.5 rounded-full dark:bg-gray-700 bg-gray-100 text-xs dark:text-gray-300 text-gray-700 hover:bg-[#273244]/10 dark:hover:bg-gray-600 transition">
      {/* REAL CHECKBOX */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />

      {/* Custom toggle circle */}
      <span
        className={`w-4 h-4 rounded-full border flex items-center justify-center transition
        ${checked ? "border-sky-500" : "border-gray-500"}`}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-sky-500" />}
      </span>

      {/* Label */}
      <span className="text-xs dark:text-gray-300 font-normal text-gray-700 font-poppins">
        {label}
      </span>
    </label>
  );
};
