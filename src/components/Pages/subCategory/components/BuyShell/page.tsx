"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Dropdown from "@/components/Modal/popupDropdown/page";
import BlockImg from "../../../../../../public/img/blockimg1.jpg";
import { Minus, Plus } from "lucide-react";
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
// import { useTheme } from "next-themes";
import { truncateValue } from "@/utils/Content";

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
  trading: {
    totalVolume: number;
  };
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
  rowDetailss: QuestionItemSecond | null;
  orderType: string;
  option: OptionItem | null;
  optionIndex: number | null;
  handleChangeOrderType: (value: string) => void;
}

export default function BuySell({
  rowDetailss,
  orderType,
  option,
  optionIndex,
  handleChangeOrderType,
}: BuySellProps) {
  const [share, setShare] = useState<number | "">("");
  const [limitShare, setLimitShare] = useState<number | "">("");
  const [amount, setAmount] = useState<number | "">("");
  const [types, setTypes] = useState<string>("market");
  const token = localStorage.getItem("token");
  // const { theme } = useTheme();
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

  // tpsl state manage

  const [tpslShare, setTpslShare] = useState<number>(0);
  const [takeProfit, setTakeProfit] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);

  const [tpTouched, setTpTouched] = useState(false);
  const [slTouched, setSlTouched] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);

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
            Number(optionIndex),
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
            Number(optionIndex),
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
          Number(optionIndex),
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

    if (types === "market") {
      orderDetailsGet();
    }
  }, [orderDetailsGet, rowDetailsId, debouncedValue, types]);

  const handleClose = () => {
    setAmount("");
    setShare("");
    setLimitShare("");
    setTpslShare(0);
    setTakeProfit(0);
    setStopLoss(0);
    setDebouncedValue(0);
  };

  const LimitFee = (Number(share) * Number(limitShare) * 2) / 100;
  const totalSharesBuy = Number(share) * Number(limitShare) + LimitFee;
  const totalSharesSell = Number(share) * Number(limitShare) - LimitFee;

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

    try {
      const response: ApiResponse<unknown> = await submitOrder(reqBody);
      if (response?.success) {
        toast.success(response.message || "");
        handleClose();
        currentShareDetails();
        currentBalanceDetails();
      } else {
      }
    } catch {
      toast.error("internal server error");
    }
  };

  const getTotalSharesDetails =
    Number(rowDetailss?.options?.[optionIndex || 0]?.trading?.totalVolume) || 0;

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
  }, [token]);

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
    currentShareDetails();
  }, [currentShareDetails, rowDetailsId, option?.id]);

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
    setBtnLoader(true);
    try {
      const response: ApiResponse<unknown> = await submitOrdersTpAndSl(payload);
      if (response?.success) {
        toast.success(response.message || "");
        handleClose();
        currentShareDetails();
        currentBalanceDetails();
      } else {
      }
    } catch {
      toast.error("internal server error");
    } finally {
      setBtnLoader(false);
    }
  };
  // const isSharesValid = tpslShare > 0;
  // const isTPValid = takeProfit > 0;
  // const isSLValid = stopLoss > 0;

  // const isTouched = tpTouched && slTouched;

  // const disabledTpslBtn =
  //   !isTouched || !isSharesValid || !isTPValid || !isSLValid;

  const STEP = 0.01;
  const MIN = 0;
  const MAX = 1;

  const hasShares = totalCurrentShare > 0;

  const isTakeProfitValid = takeProfit > 0 && takeProfit > currentPrice;

  const isStopLossValid = stopLoss > 0 && stopLoss < currentPrice;

  const tpslPriceIs = hasShares && isTakeProfitValid && isStopLossValid;

  const disabledTpslBtnNew =
    btnLoader ||
    tpslShare <= 0 ||
    tpslShare > totalCurrentShare ||
    !tpTouched ||
    !slTouched ||
    !tpslPriceIs;

  return (
    <>
      <div className="bg-white dark:bg-[#1D293D] mt-12 border border-gray-200 dark:border-gray-700 p-2 rounded-xl overflow-hidden shadow-lg w-full outline-none">
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
              <span className="text-lg text-white">
                $ {truncateValue(Number(option?.price || 0))}
              </span>
            </div>
          </div>
        </div>

        <div className="flex  text-wrap ml-14 mb-3 text-sm   gap-1">
          <span
            className={`${orderType === "buy" ? "text-green-600" : "text-[#E43A36]"} text-nowrap font-semibold`}
          >
            {orderType === "buy" ? "Buy" : "Sell"} Now
          </span>
          :
          <span className="text-gray-500 dark:text-gray-400">
            {option?.name || "--"}
          </span>
        </div>

        {/* Tabs */}
        <div className="border-b BG dark:border-gray-600/60 border-gray-200 mb-4 relative">
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
                  ? "border-b dark:border-[#ffffff] border-gray-500 dark:text-white text-gray-600 font-semibold"
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
                ? "border-b dark:border-[#ffffff] border-gray-500 dark:text-white text-gray-600 font-semibold"
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
                <div className="flex justify-between">
                  <span className="text-sm text-nowrap font-semibold text-gray-100 dark:text-gray-200 text-gray-700">
                    Total Buy Share
                  </span>
                  <span className="text-gray-800 dark:text-gray-300 font-semibold">
                    {truncateValue(Number(totalCurrentShare || 0))}
                  </span>
                </div>
                <div className="border dark:border-gray-700 border-gray-200 rounded ">
                  <div className="border-b dark:border-gray-600 border-gray-300 px-3 pt-2">
                    <label className="w-full flex flex-col gap-1">
                      <span className="text-xs flex justify-between items-center dark:text-gray-200 text-gray-700 font-medium">
                        <span>Take Profit</span>{" "}
                        {tpTouched && takeProfit < currentPrice && (
                          <span className="text-xs text-yellow-300">
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
                            e.target.value === "" ? 0 : Number(e.target.value);
                          setTakeProfit(value);
                        }}
                        onWheel={(e) => e.currentTarget.blur()}
                        className={`
                          w-full no-arrow px-3 py-2 text-2xl  text-right
                          bg-transparent border rounded-md outline-none
                          text-gray-900 dark:text-gray-100
                          ${
                            tpTouched && takeProfit < currentPrice
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
                        <span className="text-gray-400"> Current Price : </span>
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
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full no-arrow px-3 py-2 text-2xl text-start bg-transparent border border-gray-300 dark:border-gray-700 rounded-md  text-gray-900 dark:text-gray-100  focus:ring-1 focus:ring-gray-400  outline-none  "
                      />
                      <span className="absolute top-3 bg-gray-700/50 font-serif text-gray-300 rounded px-1.5 right-2 ">
                        Max
                      </span>
                    </div>
                  </label>

                  <div className="p-3 border-t dark:border-gray-600 border-gray-300">
                    <label className="w-full flex flex-col gap-1">
                      <span className="text-xs flex justify-between dark:text-gray-200 text-gray-700 font-medium">
                        <span>Stop Loss</span>{" "}
                        {slTouched && stopLoss > currentPrice && (
                          <span className="text-xs text-yellow-300">
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
                            e.target.value === "" ? 0 : Number(e.target.value);
                          setStopLoss(value);
                        }}
                        onWheel={(e) => e.currentTarget.blur()}
                        className={`
                          w-full no-arrow px-3 py-2 text-2xl text-right
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
                        <span className="dark:text-gray-300 text-gray-700 font-medium">
                          Fee
                        </span>
                        <span className="dark:text-gray-300 text-gray-700">
                          $ {truncateValue(Number(stopLossFee || 0))}
                        </span>
                      </div>
                      <div className="flex flex-row  items-center justify-between">
                        <span className="dark:text-gray-300 text-gray-700 font-medium">
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
                <label className="w-full flex flex-row items-center gap-10">
                  <span className="text-sm text-nowrap text-gray-100 font-semibold dark:text-gray-200 text-gray-700">
                    Limit Price
                  </span>

                  <div className="relative w-full">
                    <button
                      type="button"
                      onClick={() =>
                        setLimitShare((prev) =>
                          Math.max(MIN, Number((prev as number) - STEP)),
                        )
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
                        setLimitShare((prev) =>
                          Math.min(MAX, Number((prev as number) + STEP)),
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2
                        p-1 rounded-md cursor-pointer text-gray-300 hover:text-[#0099FF]
                        hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </label>

                <div className="border-t dark:border-gray-700 border-gray-200 pt-3">
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
                      <span className="dark:bg-gray-700 bg-gray-200 rounded shadow dark:hover:bg-gray-500 hover:bg-gray-300 cursor-pointer text-xs px-3 py-1 dark:text-gray-300  text-gray-700">
                        25%
                      </span>
                      <span className="dark:bg-gray-700 bg-gray-200 rounded shadow dark:hover:bg-gray-500 hover:bg-gray-300 cursor-pointer text-xs px-3 py-1 dark:text-gray-300  text-gray-700">
                        25%
                      </span>
                      <span className="dark:bg-gray-700 bg-gray-200 rounded shadow dark:hover:bg-gray-500 hover:bg-gray-300 cursor-pointer text-xs px-2 py-1 dark:text-gray-300  text-gray-700">
                        MAX
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : orderType === "buy" ? (
              <>
                <label className="w-full p-3 border dark:border-gray-700 border-gray-200 rounded-md flex justify-between items-center">
                  <span>
                    <span className="block text-sm text-gray-400">Shares</span>
                    <span className="block  text-nowrap text-sm dark:text-gray-100 text-gray-950">
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
                    className="border-none outline-none no-arrow text-gray-800 dark:text-gray-300 text-3xl text-right w-40 bg-transparent"
                  />
                </label>
                <div className="flex items-center justify-center text-gray-400">
                  <TfiExchangeVertical size={25} />
                </div>
                <label className="w-full p-3 border dark:border-gray-700 border-gray-200 rounded-md flex justify-between items-center">
                  <span>
                    <span className="block text-sm text-gray-400">Amount</span>
                    <span className="block  text-nowrap text-sm dark:text-gray-100 text-gray-950">
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
                    className="border-none outline-none text-gray-800 no-arrow dark:text-gray-300 text-3xl text-right w-40 bg-transparent"
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
                    <span className="block text-sm text-gray-400">Shares</span>
                    <span className="block text-nowrap text-sm text-[#0099FF]">
                      No Interest
                    </span>
                  </span>

                  <input
                    type="number"
                    placeholder="0"
                    min={0}
                    max={
                      option?.userPosition?.shares ?? getTotalSharesDetails ?? 0
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
              {/* <div className="bg-[#0099FF] font-semibold text-white px-2 py-1 rounded">
                {" "}
                IOC{" "}
              </div> */}
              <div className="text-xs font-normal text-red-500">
                {errorResponse?.message == "Invalid value"
                  ? ""
                  : errorResponse?.message || ""}
              </div>
            </div>
          )}

          {types !== "tpsl" && (
            <div className="flex text-black py-3 flex-col gap-2">
              <div className="text-sm text-nowrap text-gray-100 font-semibold dark:text-gray-200 text-gray-700">
                Share Details
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
                    <span className="dark:text-gray-300 text-gray-700 font-medium">
                      Fee
                    </span>
                    <span className="dark:text-gray-300">
                      $ {truncateValue(Number(LimitFee || 0))}
                    </span>
                  </div>
                  <div className="flex flex-row justify-between">
                    <span className="dark:text-gray-300 text-gray-700 font-medium">
                      Net Cost
                    </span>
                    <span className="dark:text-gray-300">
                      $ {truncateValue(Number(share) * Number(limitShare) || 0)}
                    </span>
                  </div>
                </>
              ) : types === "limit" && orderType == "sell" ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-sm text-nowrap text-gray-100 dark:text-gray-200 text-gray-700">
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
                      <span className="text-gray-400 font-medium">Receive</span>
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
                    <span className="text-gray-400 font-medium">Net Cost</span>
                    <span className="dark:text-gray-300">
                      $ {truncateValue(Number(shareDetailAmount?.netCost || 0))}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2   py-2 ">
                    <div className="flex justify-between">
                      <span className="text-sm text-nowrap font-semibold text-gray-100 dark:text-gray-200 text-gray-700">
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
                      <span className="text-gray-400 font-medium">Receive</span>
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
              disabled={disabledTpslBtnNew}
              onClick={handleTpspSubmit}
              className={`mt-4 py-3 text-lg font-bold ${
                disabledTpslBtnNew
                  ? "bg-[#c7ac77] text-black"
                  : "bg-[#c7ac77] hover:bg-[#0099FF]/60 cursor-pointer"
              }  rounded-xl w-full`}
            >
              Sell
            </button>
          ) : (
            <button
              disabled={buttonDisable}
              onClick={handleSubmit}
              className={`mt-4 w-full py-3 text-lg font-semibold
    rounded-full transition-all duration-200 ${
      buttonDisable
        ? `${orderType == "sell" ? "bg-red-300 text-white" : "bg-green-300 text-black"} cursor-not-allowed shadow-none`
        : `${orderType === "Sell" ? "bg-red-500 text-white" : "bg-green-500 text-black"}  hover:from-[#2cc0ff] hover:to-[#008ae6] active:scale-[0.98]  shadow-[0_8px_20px_rgba(0,153,255,0.35)] cursor-pointer`
    }  rounded-xl w-full`}
            >
              <span className="capitalize text-black">{orderType || "--"}</span>{" "}
              <span className="text-black">$</span>{" "}
              <span className="text-black !font-semibold">
                {types === "limit" && orderType === "buy"
                  ? truncateValue(Number(totalSharesBuy || 0), 3)
                  : types === "limit" && orderType === "sell"
                    ? truncateValue(Number(totalSharesSell || 0), 3)
                    : orderType == "buy"
                      ? truncateValue(
                          Number(shareDetailAmount?.grossCost || 0),
                          3,
                        )
                      : truncateValue(
                          Number(shareDetailAmount?.grossProceeds) || 0,
                          3,
                        )}
              </span>
            </button>
          )}
        </>
      </div>
    </>
  );
}
