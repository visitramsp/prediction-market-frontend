"use client";
import React from "react";
import Label from "./label";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  title?: string;
  error?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  startIcon,
  endIcon,
  title,
  error,
  ...props
}) => {
  return (
    <div>
      {title && <Label text={title || ""} />}
      <div className="border border-[#46216d] -mt-1 w-full cursor-pointer focus-within:!border-fuchsia-700 flex flex-row items-center justify-between py-2 pr-2 rounded">
        {startIcon && <span className="ml-2">{startIcon}</span>}
        <input
          className="placeholder:text-gray-400 dark:placeholder:text-gray-300 !w-full pl-2 outline-none text-gray-800 dark:text-white"
          {...props}
        />
        {endIcon && <span className="ml-2">{endIcon}</span>}
      </div>
      {error && <span className="text-red-600 text-sm pl-2">{error}</span>}
    </div>
  );
};

export default CustomInput;
