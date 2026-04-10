"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";
import Box from "@mui/material/Box";
import Dropdown from "@/components/Modal/popupDropdown/page";
import BlockImg from "../../../../public/img/blockimg1.jpg";
import {
  getCommonQuoteSell,
  getCurrentBalance,
  getCurrentShares,
  getOrdersQuoteDetails,
  getQuoteByBudget,
  submitOrder,
  submitOrdersTpAndSl,
} from "@/components/service/apiService/buySell";
import { TfiExchangeVertical } from "react-icons/tfi";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";
import { userBalance } from "@/components/service/apiService/user";
import { delay, truncateValue } from "@/utils/Content";
import { Minus, Plus } from "lucide-react";
import { CircularProgress } from "@mui/material";

interface UserPosition {
  shares: number;
  invested?: number;
  pnl?: number;
}

interface OptionItem {
  id: number;
  name: string;
  price: number;
  userPosition?: UserPosition;
  winningProbability: number;
}

interface QuoteDetails {
  shares?: number;
  grossCost?: number;
  grossProceeds?: number;
  netCost?: number;
  netProceeds?: number;
  fee?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface QuestionStats {
  totalVolume: number;
}

interface UserPosition {
  shares: number;
  invested?: number;
  pnl?: number;
}
interface QuestionItemSecond {
  id: number;
  question: {
    question: string;
    id: number;
  };
  options: OptionItem[];
  stats?: QuestionStats;
  user?: Record<number, UserPosition>;
}

interface BuySellProps {
  isOpen: boolean;
  onClose: () => void;
  rowDetailss: QuestionItemSecond | null;
  orderType: string;
  option: OptionItem | null;
  optionIndex: number;
  fetchOrders: () => void;
  handleChangeOrderType: (value: string) => void;
}

export default function BuySell({
  isOpen,
  onClose,
  rowDetailss,
  orderType,
  option,
  optionIndex,
  fetchOrders,
  handleChangeOrderType,
}: BuySellProps) {
  const [share, setShare] = useState<number | "">("");
  const [limitShare, setLimitShare] = useState<number | "">("");
  const [amount, setAmount] = useState<number | "">("");
  const [types, setTypes] = useState<string>("market");
  const token = localStorage.getItem("token");
  const { theme } = useTheme();
  const [activeField, setActiveField] = useState<"shares" | "amount" | null>(
    null,
  );
  const [shareDetailAmount, setShareDetailAmount] = useState<QuoteDetails>({});
  const [errorResponse, setErrorResponse] = useState<{
    success?: boolean;
    message?: string;
    errors?: [
      {
        message: string;
      },
    ];
  }>({});
  const [debouncedValue, setDebouncedValue] = useState<number>(0);
  const [totalCurrentBalance, setTotalCurrentBalance] = useState<number>(0);
  const [totalCurrentShare, setTotalCurrentShare] = useState<number>(0);

  const [isSubmit, setIsSubmit] = useState(false);
  // tpsl state manage

  const [tpslShare, setTpslShare] = useState<number>(0);
  const [takeProfit, setTakeProfit] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);

  const [tpTouched, setTpTouched] = useState(false);
  const [slTouched, setSlTouched] = useState(false);

  const [percentageValue, setPercentageValue] = useState(null);
  // const [btnLoader, setBtnLoader] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      if (activeField === "shares") {
        const value = Number(share);
        if (!isNaN(value)) {
          setDebouncedValue(value);
        }
      }

      if (activeField === "amount") {
        const value = Number(amount);
        if (!isNaN(value)) {
          setDebouncedValue(value);
        }
      }
    }, 300);

    return () => clearTimeout(t);
  }, [share, amount, activeField]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (activeField === "shares" && share !== "") {
        setDebouncedValue(Number(share));
      }
      if (activeField === "amount" && amount !== "") {
        setDebouncedValue(Number(amount));
      }
    }, 300);

    return () => clearTimeout(t);
  }, [share, amount, activeField]);

  const rowDetailsId =
    Number(rowDetailss?.question?.id) || (rowDetailss?.id as number);
  const orderDetailsGet = useCallback(async () => {
    if (orderType == "buy") {
      if (activeField == "shares") {
        try {
          const response = await getOrdersQuoteDetails(
            rowDetailsId,
            optionIndex,
            debouncedValue,
          );
          if (response?.success) {
            setAmount(Number(response?.data?.grossCost) || 0);
            setShareDetailAmount(response?.data || {});
          } else {
            setAmount("");
            setShareDetailAmount({});
          }
        } catch {
          setAmount("");
          setShareDetailAmount({});
        }
      }
      if (activeField == "amount") {
        try {
          const response = await getQuoteByBudget(
            rowDetailsId,
            optionIndex,
            debouncedValue,
          );
          if (response?.success) {
            setShare(response?.data?.shares || 0);
            setShareDetailAmount(response?.data || {});
          } else {
            setShare("");
            setShareDetailAmount({});
          }
        } catch {
          setShare("");
          setShareDetailAmount({});
        }
      }
    }

    if (orderType == "sell") {
      try {
        const response = await getCommonQuoteSell(
          rowDetailsId,
          optionIndex,
          debouncedValue,
        );
        if (response?.success) {
          setErrorResponse({});
          setAmount(Number(response?.data?.fee || 0));
          setShareDetailAmount(response?.data || {});
        } else {
          setErrorResponse(response || {});
          setAmount("");
          setShareDetailAmount({});
        }
      } catch {
        setErrorResponse({});
        setAmount("");
        setShareDetailAmount({});
      }
    }
  }, [rowDetailsId, optionIndex, debouncedValue, orderType, activeField]);

  useEffect(() => {
    if (!rowDetailsId) return;

    if (types === "market" && isOpen === true) {
      orderDetailsGet();
    }
  }, [orderDetailsGet, rowDetailsId, debouncedValue, types, isOpen]);

  const handleClose = () => {
    setAmount("");
    setShare("");
    setTypes("market");
    setLimitShare("");
    handleChangeOrderType("buy");
    setTpslShare(0);
    setTakeProfit(0);
    setStopLoss(0);
    setDebouncedValue(0);
    onClose();
  };

  const LimitFee = (Number(share) * Number(limitShare) * 2) / 100;
  const totalSharesBuy = Number(share) * Number(limitShare) + LimitFee;
  const totalSharesSell = Number(share) * Number(limitShare) - LimitFee;

  const getUserBalance = async () => {
    try {
      const response = await userBalance();
      if (response?.success) {
        localStorage.setItem("balance", response?.data?.balance);
      } else {
        localStorage.removeItem("balance");
      }
    } catch {
      localStorage.removeItem("balance");
    }
  };

  const handleSubmit = async () => {
    const orderId = crypto.randomUUID();
    const reqBody = {
      questionId: rowDetailsId,
      outcomeIndex: optionIndex,
      side: orderType,
      type: types,
      idempotencyKey: orderId,
      shares:
        types === "limit" && orderType === "buy"
          ? share
          : types === "limit" && orderType === "sell"
            ? share
            : shareDetailAmount?.shares || "", //shares

      ...(types === "limit" && orderType === "buy"
        ? { maxCost: totalSharesBuy }
        : {}), // order type is limit adn buy

      ...(types === "limit" && orderType === "sell"
        ? { minProceeds: totalSharesSell }
        : {}), // order type is limit adn sell
      timeInForce: "IOC",
    };

    setIsSubmit(true);
    try {
      const [response] = await Promise.all([submitOrder(reqBody), delay(500)]);
      if (response?.success) {
        toast.success(response.message || "");
        if (types == "limit") {
          fetchOrders();
        }
        getUserBalance();
        handleClose();
      } else {
      }
    } catch {
      toast.error("internal server error");
    } finally {
      setIsSubmit(false);
    }
  };

  const getTotalSharesDetails =
    Number(rowDetailss?.user?.[optionIndex]?.shares) || 0;

  const maxShares = option?.userPosition?.shares ?? 0;
  const currentBalanceDetails = async () => {
    try {
      const response = await getCurrentBalance();

      if (response?.success) {
        setTotalCurrentBalance(response?.data || 0);
      } else {
        setTotalCurrentBalance(response?.data || 0);
      }
    } catch {
      setTotalCurrentBalance(0);
    }
  };

  useEffect(() => {
    token && currentBalanceDetails();
  }, [isOpen]);

  const currentShareDetails = async () => {
    try {
      const response = await getCurrentShares(rowDetailsId, Number(option?.id));

      if (response?.success) {
        setTotalCurrentShare(response?.data || 0);
      } else {
        setTotalCurrentShare(response?.data || 0);
      }
    } catch {
      setTotalCurrentShare(0);
    }
  };
  useEffect(() => {
    isOpen && currentShareDetails();
  }, [currentShareDetails, isOpen]);

  const sharesInput = Number(share);
  const amountInput = Number(amount);
  const balanceAmount = Number(totalCurrentBalance);

  const availableShares = maxShares > 0 ? maxShares : getTotalSharesDetails;

  const buttonDisable =
    debouncedValue <= 0 ||
    (orderType === "buy" &&
      types === "limit" &&
      balanceAmount <= Number(totalSharesBuy)) ||
    (orderType === "sell" && sharesInput > availableShares) ||
    (orderType === "buy" && types === "market" && balanceAmount < amountInput);

  const takeProfitFee = (Number(tpslShare) * takeProfit * 2) / 100;
  const takeProfitReceive = tpslShare - takeProfitFee;

  const stopLossFee = (Number(tpslShare) * stopLoss * 2) / 100;
  const stopLossReceive = tpslShare - stopLossFee;

  const currentPrice = option?.price || 0;

  const handleTpspSubmit = async () => {
    const orderId = crypto.randomUUID();
    const payload = {
      questionId: rowDetailsId,
      outcomeIndex: optionIndex,
      shares: tpslShare,
      takeProfitPrice: takeProfit,
      stopLossPrice: stopLoss,
      side: orderType,
      type: types,
      timeInForce: "IOC",
      idempotencyKey: orderId,
    };
    setIsSubmit(true);
    try {
      const [response] = await Promise.all([
        submitOrdersTpAndSl(payload),
        delay(500),
      ]);
      if (response?.success) {
        toast.success(response.message || "");
        if (types == "tpsl") {
          fetchOrders();
        }
        handleClose();
      } else {
      }
    } catch {
      toast.error("internal server error");
    } finally {
      setIsSubmit(false);
    }
  };
  // const isSharesValid = tpslShare > 0;
  // const isTPValid = takeProfit > 0;
  // const isSLValid = stopLoss > 0;

  // const isTouched = tpTouched && slTouched;

  // const disabledTpslBtn =
  //   !isSharesValid || !isTouched || !isTPValid || !isSLValid;

  // console.log(
  //   disabledTpslBtn,
  //   isTouched,
  //   isTPValid,
  //   isSLValid,
  //   "disabledTpslBtn",
  // );

  const hasShares = totalCurrentShare > 0;

  const isTakeProfitValid = takeProfit > 0 && takeProfit > currentPrice;

  const isStopLossValid = stopLoss > 0 && stopLoss < currentPrice;

  const tpslPriceIs = hasShares && isTakeProfitValid && isStopLossValid;

  const disabledTpslBtn =
    // btnLoader ||
    tpslShare <= 0 ||
    tpslShare > totalCurrentShare ||
    !tpTouched ||
    !slTouched ||
    !tpslPriceIs;

  const MIN = 0;
  const MAX = 1;
  const STEP = 0.1;

  const handleSetValue = (currentValue) => {
    setPercentageValue(currentValue);

    // SELL CASE
    if (orderType === "sell") {
      const totalShareSell = totalCurrentShare || 0;

      let calculatedValue = 0;
      if (currentValue === "Max") {
        calculatedValue = totalShareSell;
      } else {
        calculatedValue = (totalShareSell * currentValue) / 100;
      }

      setShare(Number(calculatedValue.toFixed(2)));
    }

    // BUY CASE
    else {
      const price = Number(limitShare) || 0; // upper input
      const balance = Number(totalCurrentBalance) || 0;

      if (price <= 0) {
        setShare(0);
        return;
      }

      const maxShares = balance / price;

      let calculatedValue = 0;
      if (currentValue === "Max") {
        calculatedValue = maxShares;
      } else {
        calculatedValue = (maxShares * currentValue) / 100;
      }

      setShare(Number(calculatedValue.toFixed(2))); // lower input
    }
  };
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500, // ✅ backdrop open/close duration
        sx: {
          backdropFilter: "blur(10px)",
          backgroundColor:
            theme === "dark"
              ? "rgba(15, 23, 42, 0.7)"
              : "rgba(255, 255, 255, 0.7)",
        },
      }}
    >
      <Fade in={isOpen}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          className="border border-[var(--color-borderlight)]
           dark:border-[var(--color-borderdark)]
           bg-[var(--boxbg2)] dark:bg-[var(--boxbg1)]  p-6 lg:p-10 rounded-xl overflow-hidden shadow-lg w-full max-w-[370px] lg:max-w-[430px] outline-none"
        >
          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 cursor-pointer text-gray-900 dark:text-gray-200 hover:text-gray-500"
          >
            ✕
          </button>

          <div className="flex flex-row gap-2 w-full justify-between mb-0">
            <Image
              src={BlockImg}
              alt="Block"
              width={60}
              height={60}
              className="rounded-lg max-h-[45px]"
            />
            <div className="w-full">
              <div className="text-sm w-[85%] text-black truncate   dark:text-white">
                {typeof rowDetailss?.question === "string"
                  ? rowDetailss.question
                  : (rowDetailss?.question?.question ?? "--")}
              </div>
              <div className="flex items-center gap-1 font-semibold text-gray-400">
                <span className="text-sm">Price</span> :
                <span className="text-sm text-green-500">
                  {truncateValue(Number(option?.price || 0))}
                </span>
              </div>
            </div>
          </div>

          <div className="flex  text-wrap ml-14 mb-3 text-sm gap-3">
            <span className="dark:text-gray-200 text-gray-700 text-nowrap font-semibold">
              {orderType === "buy" ? "Buy" : "Sell"} Now
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              - {option?.name || "--"}
            </span>
          </div>

          {/* Tabs */}
          <div className="border-b dark:border-gray-700 border-gray-200 mb-4 relative">
            <div className="absolute right-0 top-0">
              <Dropdown
                onSelect={(v: string) => {
                  setLimitShare("");
                  setShare("");
                  setTypes(v);
                  if (v === "tpsl") {
                    handleChangeOrderType("sell");
                  }
                }}
              />
            </div>

            {types !== "tpsl" && (
              <button
                onClick={() => {
                  handleChangeOrderType("buy");
                  setShareDetailAmount({});
                  setErrorResponse({});
                  setDebouncedValue(0);
                  setAmount("");
                  setShare("");
                }}
                className={`py-2 mr-6 font-medium ${
                  orderType === "buy"
                    ? "border-b-2 dark:border-gray-200 border-gray-800 dark:text-white text-black"
                    : "text-gray-600 dark:text-gray-300 cursor-pointer"
                }`}
              >
                Buy
              </button>
            )}

            <button
              onClick={() => {
                handleChangeOrderType("sell");
                setErrorResponse({});
                setShareDetailAmount({});
                setDebouncedValue(0);
                setAmount("");
                setShare("");
              }}
              className={`py-2 font-medium ${
                orderType === "sell"
                  ? "border-b-2 dark:border-gray-200 border-gray-800 dark:text-white text-black"
                  : "text-gray-600 dark:text-gray-300 cursor-pointer"
              }`}
            >
              Sell
            </button>
          </div>

          <>
            <div className="flex flex-col gap-3">
              {types === "tpsl" ? (
                <>
                  <div className="flex justify-between text-lg">
                    <span className="dark:text-gray-200 text-gray-700 font-medium">
                      Total Buy Share
                    </span>
                    <span className="text-gray-800 dark:text-gray-300 font-semibold">
                      {truncateValue(Number(totalCurrentShare || 0))}
                    </span>
                  </div>
                  <div className="border dark:border-gray-800 border-gray-300 rounded ">
                    <div className="border-b dark:border-gray-800 border-gray-300 px-3 pt-2">
                      <label className="w-full flex flex-col gap-1">
                        <span className="text-xs md:flex justify-between items-center dark:text-gray-200 text-gray-700 font-medium">
                          <span className="md:inline-block block">
                            Take Profit
                          </span>{" "}
                          {tpTouched && takeProfit < currentPrice && (
                            <span className="text-xs text-red-500">
                              ⚠ Up to current market price (
                              {truncateValue(currentPrice)})
                            </span>
                          )}
                        </span>
                        <input
                          placeholder="0.00"
                          type="number"
                          value={takeProfit || ""}
                          onChange={(e) => {
                            setTpTouched(true);
                            const value =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            setTakeProfit(value);
                          }}
                          onWheel={(e) => e.currentTarget.blur()}
                          className={`
                          w-full no-arrow px-3 py-2 text-2xl text-right
                          bg-transparent border dark:border-gray-700 border-gray-300 rounded-md outline-none
                          text-gray-900 dark:text-gray-100
                          ${
                            tpTouched && takeProfit < currentPrice
                              ? "border-red-500 "
                              : "border-gray-300 dark:border-gray-700"
                          }
                          focus:ring-none
                        `}
                        />
                      </label>

                      <div className="space-y-0  text-sm py-2 ">
                        <div className="flex flex-row justify-between">
                          <span className="text-gray-400 font-medium">Fee</span>
                          <span className="text-gray-400">
                            ${truncateValue(Number(takeProfitFee || 0))}
                          </span>
                        </div>
                        <div className="flex flex-row items-center justify-between">
                          <span className="text-gray-400 font-medium">
                            Receive
                          </span>
                          <span className="text-green-500 text-lg">
                            $ {truncateValue(Number(takeProfitReceive || 0))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <label className="w-full p-3 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm dark:text-gray-200 text-gray-700 font-medium">
                          Shares
                        </span>
                        <div className="text-xs flex gap-3">
                          <span className="text-gray-400">
                            {" "}
                            Current Price :{" "}
                          </span>
                          <span className="text-amber-500">
                            {truncateValue(Number(option?.price || 0), 5)}
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          placeholder="0.00"
                          type="number"
                          value={tpslShare || ""}
                          onChange={(e) =>
                            setTpslShare(
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                            )
                          }
                          onWheel={(e) => e.currentTarget.blur()}
                          className="w-full no-arrow px-3 py-2 text-2xl text-start bg-transparent border border-gray-300 dark:border-gray-700 rounded-md  text-gray-900 dark:text-gray-100  focus:ring-gray-400  outline-none  "
                        />
                        <span
                          onClick={() => setTpslShare(totalCurrentShare)}
                          className="absolute top-3 bg-gray-700/50 font-serif hover:bg-gray-500 hover:text-gray-100 text-gray-200 cursor-pointer rounded px-1.5 right-2 "
                        >
                          Max
                        </span>
                      </div>
                    </label>

                    <div className="p-3 border-t dark:border-gray-800 border-gray-300 px-3 pt-2">
                      <label className="w-full flex flex-col gap-1">
                        <span className="text-sm flex items-center justify-between dark:text-gray-200 text-gray-700 font-medium">
                          <span>Stop Loss</span>{" "}
                          {slTouched && stopLoss > currentPrice && (
                            <span className="text-xs text-end text-yellow-300">
                              ⚠ Down to current market price (
                              {truncateValue(currentPrice)})
                            </span>
                          )}
                        </span>

                        <input
                          placeholder="0.00"
                          type="number"
                          value={stopLoss || ""}
                          onChange={(e) => {
                            setSlTouched(true);
                            const value =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            setStopLoss(value);
                          }}
                          onWheel={(e) => e.currentTarget.blur()}
                          className={`
                          w-full no-arrow px-3 py-2 text-2xl font-semibold text-right
                          bg-transparent border rounded-md outline-none
                          text-gray-900 dark:text-gray-100
                          ${
                            slTouched && stopLoss > currentPrice
                              ? "border-yellow-400 ring-1 focus:ring-yellow-400"
                              : "border-gray-300 dark:border-gray-700 focus:ring-gray-400"
                          }
                          focus:ring-1
                        `}
                        />
                      </label>

                      <div className="space-y-0  text-sm py-2 ">
                        <div className="flex flex-row justify-between">
                          <span className="text-gray-400 font-medium">Fee</span>
                          <span className="text-gray-400">
                            $ {truncateValue(Number(stopLossFee || 0))}
                          </span>
                        </div>
                        <div className="flex flex-row  items-center justify-between">
                          <span className="text-gray-400 font-medium">
                            Receive
                          </span>
                          <span className="text-red-500 text-lg">
                            - $ {truncateValue(Number(stopLossReceive || 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : types === "limit" ? (
                <>
                  {/* <label className="w-full flex flex-col gap-1">
                    <span className="text-xs text-gray-400 font-medium">
                      {orderType === "sell" ? "Sell" : "Buy"} at price
                    </span>
                    <input
                      placeholder="0.00"
                      type="number"
                      value={limitShare}
                      onChange={(e) =>
                        setLimitShare(
                          e.target.value === "" ? 0 : Number(e.target.value),
                        )
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      className="w-full no-arrow px-3 py-2 text-2xl font-semibold text-right bg-transparent border border-gray-200 dark:border-gray-700 rounded-md  text-gray-900 dark:text-gray-100  focus:ring-1 focus:ring-gray-400 outline-none  "
                    />
                  </label> */}
                  <label className="w-full flex flex-row items-center gap-10">
                    <span className="text-sm text-nowrap text-gray-100 font-semibold dark:text-gray-200 text-gray-700">
                      Limit Price
                    </span>

                    <div className="relative w-full">
                      <button
                        type="button"
                        onClick={() =>
                          setLimitShare((prev) => {
                            const current = Number(prev) || 0;
                            const newVal = Math.max(MIN, current - STEP);
                            return Number(newVal.toFixed(1));
                          })
                        }
                        className="absolute w-fit left-2 top-1/2 -translate-y-1/2
                                p-1 rounded-md text-gray-300 hover:text-[#0099FF]
                                hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Minus size={18} />
                      </button>

                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={limitShare || ""}
                        onWheel={(e) => e.currentTarget.blur()}
                        onChange={(e) => {
                          let val = Number(e.target.value);
                          if (isNaN(val)) val = 0;
                          val = Math.min(Math.max(val, MIN), MAX);
                          setLimitShare(Number(val.toFixed(2)));
                        }}
                        className="w-full no-arrow px-10 py-2 text-2xl text-center
                                bg-transparent border border-gray-300 dark:border-gray-700 rounded-md
                                text-gray-900 dark:text-gray-100 
                                focus:ring-1 focus:ring-gray-400 outline-none"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setLimitShare((prev) => {
                            const current = Number(prev) || 0;
                            const newVal = Math.min(MAX, current + STEP);
                            return Number(newVal.toFixed(1));
                          })
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2
                        p-1 rounded-md cursor-pointer text-gray-300 hover:text-[#0099FF]
                        hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </label>

                  <div className="border-t border-b pb-3 dark:border-gray-700 border-gray-200 pt-3">
                    <label className="w-full flex flex-row items-center gap-10 gap-1">
                      <span className="text-sm text-nowrap text-gray-100 font-semibold dark:text-gray-200 text-gray-700">
                        Shares
                      </span>

                      <input
                        type="number"
                        placeholder="0.00"
                        onFocus={() => setActiveField("shares")}
                        value={share || ""}
                        onChange={(e) =>
                          setShare(
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full no-arrow px-10 py-2 text-2xl text-center
                                bg-transparent border border-gray-300 dark:border-gray-700 rounded-md
                                text-gray-900 dark:text-gray-100 
                                focus:ring-1 focus:ring-gray-400 outline-none"
                      />
                    </label>
                    <div className="flex flex-row mt-2 justify-between ">
                      <div className="w-12"></div>
                      <div className="  flex items-center justify-between gap-1">
                        {[25, 50, 75, "Max"].map((val) => (
                          <span
                            key={val}
                            onClick={() => handleSetValue(val)}
                            className={`
      rounded shadow cursor-pointer text-xs px-3 py-1
      ${
        percentageValue == val
          ? "bg-blue-500 text-white dark:bg-blue-600"
          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
      }
    `}
                          >
                            {val} {val == "Max" ? "" : "%"}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : orderType === "buy" ? (
                <>
                  <label className="w-full p-3 border dark:border-gray-700 border-gray-200 rounded-md flex justify-between gap-2 items-center">
                    <span>
                      <span className="block text-sm text-gray-400">
                        Shares
                      </span>
                      <span className="block text-nowrap text-sm text-gray-950 dark:text-gray-200">
                        No Interest
                      </span>
                    </span>

                    <input
                      type="number"
                      placeholder="0"
                      value={share || ""}
                      onFocus={() => setActiveField("shares")}
                      onChange={(e) =>
                        setShare(
                          e.target.value === "" ? 0 : Number(e.target.value),
                        )
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      className="border-none outline-none no-arrow text-gray-800 dark:text-gray-300 md:text-3xl text-xl text-right w-full md:w-56 bg-transparent"
                    />
                  </label>
                  <div className="flex items-center justify-center text-gray-400">
                    <TfiExchangeVertical size={25} />
                  </div>
                  <label className="w-full p-3 border dark:border-gray-700 border-gray-200 rounded-md flex justify-between gap-2 items-center">
                    <span>
                      <span className="block text-sm text-gray-400">
                        Amount
                      </span>
                      <span className="block text-nowrap text-sm text-gray-950 dark:text-gray-200">
                        No Interest
                      </span>
                    </span>

                    <input
                      type="number"
                      placeholder="0"
                      value={amount || ""}
                      onFocus={() => setActiveField("amount")}
                      onChange={(e) =>
                        setAmount(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      className="border-none outline-none text-gray-800 no-arrow dark:text-gray-300 md:text-3xl text-xl text-right md:w-56 bg-transparent"
                    />
                  </label>
                </>
              ) : (
                <>
                  {" "}
                  <label
                    className={`w-full p-3 border ${
                      errorResponse?.success == false
                        ? "border-red-400"
                        : "border-gray-200"
                    }  rounded-md flex justify-between items-center`}
                  >
                    <span>
                      <span className="block text-sm text-gray-400">
                        Shares
                      </span>
                      <span className="block text-sm dark:text-gray-200 text-gray-700">
                        No Interest
                      </span>
                    </span>

                    <input
                      type="number"
                      placeholder="0"
                      min={0}
                      max={
                        option?.userPosition?.shares ??
                        getTotalSharesDetails ??
                        0
                      }
                      value={share || ""}
                      onFocus={() => setActiveField("shares")}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setShare(value);
                      }}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="border-none outline-none no-arrow text-gray-800 dark:text-gray-300 text-3xl text-right w-56 bg-transparent"
                    />
                  </label>
                </>
              )}
            </div>

            {types !== "tpsl" && (
              <div className="flex flex-row justify-between gap-2 mt-2">
                {" "}
                <div className="dark:bg-white bg-black font-semibold dark:text-black text-white px-2 py-1 rounded">
                  {" "}
                  IOC{" "}
                </div>
                <div className="text-xs font-normal text-red-500">
                  {errorResponse?.message == "Invalid value"
                    ? ""
                    : errorResponse?.message || ""}
                </div>
              </div>
            )}

            {types !== "tpsl" && (
              <div className="flex text-black py-3 text-sm flex-col gap-2">
                <div className="dark:text-gray-200 text-gray-950 font-semibold text-lg">
                  Share Details :
                </div>
                {types === "limit" && orderType == "buy" ? (
                  <>
                    {token && (
                      <div className="flex flex-row justify-between">
                        <span className="text-gray-400 font-medium">
                          Available Balance
                        </span>
                        <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                          $ {truncateValue(Number(totalCurrentBalance || 0))}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-row justify-between">
                      <span className="text-gray-400 font-medium">Fee</span>
                      <span className="dark:text-gray-300">
                        $ {truncateValue(Number(LimitFee || 0))}
                      </span>
                    </div>
                    <div className="flex flex-row justify-between">
                      <span className="text-gray-400 font-medium">
                        Net Cost
                      </span>
                      <span className="dark:text-gray-300">
                        ${" "}
                        {truncateValue(Number(share) * Number(limitShare) || 0)}
                      </span>
                    </div>
                  </>
                ) : types === "limit" && orderType == "sell" ? (
                  <>
                    <div className="space-y-2  ">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 font-medium">
                          Total Buy Share
                        </span>
                        <span className="text-gray-800 dark:text-gray-300 font-semibold">
                          {truncateValue(Number(totalCurrentShare || 0))}
                        </span>
                      </div>

                      <div className="flex flex-row justify-between">
                        <span className="text-gray-400 font-medium">Fee</span>
                        <span className="dark:text-gray-300">
                          $ {LimitFee == 0 ? "" : "-"}{" "}
                          {truncateValue(Number(LimitFee || 0))}
                        </span>
                      </div>
                      <div className="flex flex-row justify-between">
                        <span className="text-gray-400 font-medium">
                          Receive
                        </span>
                        <span className="dark:text-gray-300">
                          $ {truncateValue(Number(totalSharesSell || 0))}
                        </span>
                      </div>
                    </div>
                  </>
                ) : orderType === "buy" ? (
                  <>
                    {token && (
                      <div className="flex flex-row justify-between">
                        <span className="text-gray-400 font-medium">
                          Available Balance
                        </span>
                        <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                          $ {truncateValue(Number(totalCurrentBalance || 0))}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-row justify-between">
                      <span className="text-gray-400 font-medium">Fee</span>
                      <span className="dark:text-gray-300">
                        $ {truncateValue(Number(shareDetailAmount?.fee || 0))}
                      </span>
                    </div>
                    <div className="flex flex-row justify-between">
                      <span className="text-gray-400 font-medium">
                        Net Cost
                      </span>
                      <span className="dark:text-gray-300">
                        ${" "}
                        {truncateValue(Number(shareDetailAmount?.netCost || 0))}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2   py-2 ">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 font-medium">
                          Total Buy Share
                        </span>
                        <span className="text-gray-800 dark:text-gray-300 font-semibold">
                          {truncateValue(Number(totalCurrentShare || 0))}
                        </span>
                      </div>

                      <div className="flex flex-row justify-between">
                        <span className="text-gray-400 font-medium">Fee</span>
                        <span className="dark:text-gray-300">
                          $ {truncateValue(Number(shareDetailAmount?.fee || 0))}
                        </span>
                      </div>
                      <div className="flex flex-row justify-between">
                        <span className="text-gray-400 font-medium">
                          Receive
                        </span>
                        <span className="dark:text-gray-300">
                          ${" "}
                          {truncateValue(
                            Number(shareDetailAmount?.netProceeds || 0),
                          )}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {types === "tpsl" ? (
              <button
                disabled={disabledTpslBtn}
                onClick={handleTpspSubmit}
                className={`mt-4 py-3 text-lg text-white font-bold ${
                  disabledTpslBtn
                    ? "bg-red-600/40 text-white"
                    : "bg-red-500 text-white shadow-[0_6px_0_rgba(239,68,68,0.5)] hover:bg-red-600 active:translate-y-[4px]  active:shadow-[0_2px_0_rgba(239,68,68,0.5)]"
                }  rounded-xl w-full`}
              >
                {isSubmit ? (
                  <CircularProgress className="!text-white" size={22} />
                ) : (
                  "Sell"
                )}
              </button>
            ) : (
              <button
                disabled={isSubmit || buttonDisable}
                onClick={handleSubmit}
                className={`
    mt-4 w-full rounded-xl py-3 text-lg font-bold
    transition-all duration-150 ease-in-out

    ${
      buttonDisable
        ? `
        ${
          orderType === "sell"
            ? "bg-red-600/40 text-white"
            : "bg-green-600/40 text-black"
        }
        cursor-not-allowed
        shadow-none
      `
        : `
        ${
          orderType === "sell"
            ? `
            bg-red-500 text-white
            shadow-[0_6px_0_rgba(239,68,68,0.5)]
            hover:bg-red-600
            active:translate-y-[4px]
            active:shadow-[0_2px_0_rgba(239,68,68,0.5)]
          `
            : `
            bg-green-500 text-black
            shadow-[0_6px_0_rgba(34,197,94,0.5)]
            hover:bg-green-600
            active:translate-y-[4px]
            active:shadow-[0_2px_0_rgba(34,197,94,0.5)]
          `
        }
        cursor-pointer
      `
    }
  `}
              >
                {isSubmit ? (
                  <CircularProgress className="!text-white" size={22} />
                ) : (
                  <>
                    <span className="capitalize text-white">
                      {orderType || "--"}
                    </span>{" "}
                    <span className="text-white">$</span>{" "}
                    <span className="text-white">
                      {types === "limit" && orderType === "buy"
                        ? truncateValue(Number(totalSharesBuy || 0), 3)
                        : types === "limit" && orderType === "sell"
                          ? truncateValue(Number(totalSharesSell || 0), 3)
                          : orderType === "buy"
                            ? truncateValue(
                                Number(shareDetailAmount?.grossCost || 0),
                                3,
                              )
                            : truncateValue(
                                Number(shareDetailAmount?.grossProceeds) || 0,
                                3,
                              )}
                    </span>
                  </>
                )}
              </button>
            )}
          </>
        </Box>
      </Fade>
    </Modal>
  );
}
