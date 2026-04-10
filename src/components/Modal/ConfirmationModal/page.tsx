import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  CircularProgress,
  DialogTitle,
} from "@mui/material";
import Image from "next/image";
import { truncateValue } from "@/utils/Content";
import { ConfirmationModalProps } from "@/utils/typesInterface";

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  selectedOrderDetails,
}) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && open) onConfirm();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, onConfirm]);

  const shares = selectedOrderDetails?.shares ?? 0;
  const maxCost = selectedOrderDetails?.maxCost ?? 0;
  const totalPrice = maxCost;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        className:
          "rounded-2xl shadow-xl dark:!bg-gray-900 dark:!text-gray-100",
      }}
    >
      <DialogTitle className="flex border-b border-gray-600 items-center space-x-2 ">
        {/* <MdWarningAmber className="w-7 h-7 text-red-500" /> */}
        <span className="text-xl font-semibold">Order Cancel</span>
      </DialogTitle>

      <DialogContent className="px-6 !pt-10 pb-4 text-center">
        {/* ICON */}
        <div className="flex justify-center mb-4">
          <Image
            src="/img/icon/cancelOrder.png"
            alt="Cancel Order"
            width={120}
            height={120}
          />
        </div>

        {/* TITLE */}
        <Typography className="text-[16px] font-semibold text-gray-900 dark:text-white">
          Do you really want to cancel orders?
        </Typography>

        {/* SUB TITLE */}
        <Typography className="text-sm text-gray-500 !mt-3">
          Cancelling orders worth{" "}
          <span className="font-semibold">
            ${truncateValue(Number(totalPrice))}
          </span>{" "}
          for a delivery order with a quantity of{" "}
          <span className="font-semibold ">{truncateValue(shares)}</span>.
        </Typography>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="normal-case h-9 border border-[#7b57f0] font-medium rounded-lg w-full transition-all duration-150 ease-in-out 
bg-[#fff] dark:bg-[#101828]
shadow-[0_3px_0_rgba(129,96,238,0.4)]
 cursor-pointer
active:translate-y-[2px]
active:shadow-[0_2px_0_rgba(129,96,238,0.4)]
text-[#7b57f0]"
          >
            No
          </button>

          <button
            // variant="contained"
            onClick={onConfirm}
            disabled={isLoading}
            className="normal-case font-medium rounded-lg w-full transition-all duration-150 ease-in-out 
bg-[#8160ee]
shadow-[0_3px_0_rgba(129,96,238,0.4)]
hover:bg-[#7b57f0]
active:translate-y-[2px]
active:shadow-[0_2px_0_rgba(129,96,238,0.4)]
dark:text-[#101828] text-white cursor-pointer"
          >
            {isLoading ? (
              <CircularProgress size={22} className="!text-white" />
            ) : (
              "Yes, cancel"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
