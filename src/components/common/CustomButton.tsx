import { CircularProgress } from "@mui/material";
import clsx from "clsx";

interface PrimaryButtonProps {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
}

export default function PrimaryButton({
  label,
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        `
    relative w-full py-3 rounded-xl text-lg font-semibold text-black
    flex items-center justify-center gap-2 select-none

    bg-gradient-to-r from-green-500 to-emerald-500
    shadow-[0_6px_0_rgba(34,197,94,0.45)]

    hover:from-green-400 hover:to-emerald-400
    transition-all duration-150 ease-in-out

    active:translate-y-[4px]
    active:shadow-[0_2px_0_rgba(34,197,94,0.45)]

    disabled:opacity-60
    disabled:cursor-not-allowed
    disabled:shadow-none
    disabled:translate-y-0
    `,
        className,
      )}
    >
      {loading ? <CircularProgress size={26} sx={{ color: "#fff" }} /> : label}
    </button>
  );
}
