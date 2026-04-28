"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId, useWriteContract } from "wagmi";
import { parseUnits, isAddress } from "viem";
import CustomInput from "@/components/common/CustomInput";
import { MdEmail } from "react-icons/md";
import {
  addUserBalance,
  updateUserBalance,
  userAddBalanceWithQr,
} from "@/components/service/apiService/user";
import { decrypt, encrypt } from "@/utils/cryptoHelper";
import { FaDollarSign } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import QRCode from "react-qr-code";
import {
  Box,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  Paper,
} from "@mui/material";
import GlobalLoader from "@/components/common/Loader";
import { GrClose } from "react-icons/gr";
import socket from "@/components/socket";
import SuccessPopup from "@/components/Modal/SuccessPopup";
import { delay } from "@/utils/Content";

// const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const USDT_ADDRESS = "0x93Ddd86042Edd0F5738Ea8465E418a305A5BEF87"; //my wallet address

const erc20Abi = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

export default function AddFund({ userId, userListFin, isConnected }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const { address } = useAccount(); // ✅ wallet address
  const chainId = useChainId(); // ✅ chain id
  const { writeContractAsync } = useWriteContract();
  const [isQrLoader, setIsQrLoader] = useState(false);
  const [orderQrOrderDetails, setOrderQrOrderDetails] = useState<any>({});
  const [method, setMethod] = useState("wallet");
  const RECEIVER = "0x908E8c3243c0b0f9cE99c823B18CB6E7212dbF57"; // receiver address
  const [isSuccess, setIsSuccess] = useState(false);
  const [depositStatus, setDepositStatus] = useState<any>({});

  const updateFundUSer = async (trxToken, status = false, ordersValue = "") => {
    try {
      const encryptOrderId = await encrypt(ordersValue);
      const req = {
        amount: amount,
        orderId: encryptOrderId,
        status: status,
        trxHash: trxToken,
      };
      const response = await updateUserBalance(req);
      if (response.success) {
        userListFin();
        setOpen(false);
        setIsSuccess(true);
      } else {
        toast.error("Transaction Fails");
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleSend = async (ordersValue) => {
    try {
      // ✅ validations
      if (!address) {
        alert("Connect wallet first");
        return;
      }

      if (!amount || Number(amount) <= 0) {
        alert("Enter valid amount");
        return;
      }

      if (!isAddress(RECEIVER)) {
        alert("Invalid receiver address");
        return;
      }

      setLoading(true);

      // ✅ USDT Transfer
      const tx = await writeContractAsync({
        address: USDT_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [RECEIVER, parseUnits(amount, 18)], // USDT = 18 decimals
        account: address, // ✅ FIX
        chain: { id: chainId }, // ✅ FIX
      });

      console.log("TX Hash:", tx);

      updateFundUSer(tx, true, ordersValue);
      toast.success("Transaction sent!");
      setOpen(false);
      setAmount("");
    } catch (err) {
      updateFundUSer(null, false, ordersValue);
    } finally {
      setLoading(false);
    }
  };

  console.log(amount, "amount");

  const generate5Digit = (): string => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };
  const addFundUSer = async () => {
    try {
      const req = { amount: amount, dep_type: "wallet", address: address };
      const response = await addUserBalance(req);
      if (response.success) {
        const orderIdForRandom = await decrypt(response?.order_id);
        const start = generate5Digit();
        const end = generate5Digit();
        const finalOrderId = `${start}${orderIdForRandom}${end}`;
        handleSend(finalOrderId);
      } else {
        console.log(response, "responseErrr");
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const qrDeposit = async () => {
    try {
      setIsQrLoader(true);
      const req = {
        amount: amount,
        dep_type: "Qr",
      };
      const [response] = await Promise.all([
        userAddBalanceWithQr(req),
        delay(1000),
      ]);
      console.log(response, "response------==");
      if (response.success) {
        setOrderQrOrderDetails(response || {});
      } else {
        setOrderQrOrderDetails({});
      }
    } catch {
      setOrderQrOrderDetails({});
    } finally {
      setIsQrLoader(false);
    }
  };

  const closeModal = () => {
    setDepositStatus({});
    setOrderQrOrderDetails({});
    setOpen(false);
    setIsSuccess(false);
    setIsQrLoader(false);
  };

  useEffect(() => {
    let socketIdEvent: string;
    const init = async () => {
      socketIdEvent = await encrypt(userId);

      // 🔌 CONNECT HANDLER
      const onConnect = () => {
        console.log("✅ Connected:", socket.id);

        socket.emit("start:deposit", {
          Id: socketIdEvent,
          orderId: orderQrOrderDetails?.order_id,
          amount: amount,
        });
      };

      // 💰 STATUS HANDLER
      const onDepositStatus = (data: any) => {
        console.log("💰 Deposit Update:", data);
      };

      // attach listeners
      socket.on("connect", onConnect);
      socket.on("deposit:status", onDepositStatus);

      // ⚡ if already connected → run immediately
      if (socket.connected) {
        onConnect();
      }

      // cleanup
      return () => {
        socket.off("connect", onConnect);
        socket.off("deposit:status", onDepositStatus);
      };
    };

    const cleanupPromise = init();

    return () => {
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, [userId, amount, orderQrOrderDetails]);

  useEffect(() => {
    socket.emit(`deposit:update`, userId);
    const handleNotification = (payload: any) => {
      console.log(payload, "payload--------");
      setDepositStatus(payload);
      if (payload?.type === "ORDER_COMPLETED") {
        userListFin();
        closeModal();
      }
    };

    socket.on("deposit:update", handleNotification);

    return () => {
      // socket.emit("unsubscribeLiveTrade");
      socket.off("deposit:update", handleNotification);
    };
  }, [socket.connected]);

  const steps = [
    { key: "DEPOSIT_STARTED", label: "Watching 👀" },
    // { key: "FUND_DETECTED", label: "Fund Detected 💰" },
    { key: "BNB_SENT", label: "BNB Sent 🚀" },
    { key: "USDT_TRANSFERRED", label: "USDT Transferred 💸" },
    // { key: "BNB_RETURNED", label: "BNB Returned 🔄" },
    { key: "ORDER_COMPLETED", label: "Completed ✅" },
  ];
  const currentIndex = steps.findIndex(
    (step) => step.key === depositStatus?.type,
  );

  return (
    <>
      <button
        onClick={() => isConnected && setOpen(true)}
        disabled={!isConnected}
        className={`
    px-5 py-2 rounded-full text-white shadow-lg transition-all duration-300
    ${
      isConnected
        ? "cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105"
        : "cursor-not-allowed bg-gray-400 opacity-60"
    }
  `}
      >
        Add Fund
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center dark:bg-black/60 backdrop-blur-sm z-[10000] animate-fadeIn">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-2xl w-[420px] shadow-2xl animate-scaleIn text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-wide dark:text-gray-200 text-black">
                Add USDT
              </h2>
              <GrClose
                onClick={closeModal}
                className="cursor-pointer text-gray-300 hover:text-white transition"
              />
            </div>

            {isQrLoader && <GlobalLoader />}

            {orderQrOrderDetails?.success ? (
              <div className="flex flex-col items-center gap-5">
                {/* QR Box */}
                <div className="bg-white p-4 rounded-2xl shadow-xl hover:scale-105 transition">
                  <QRCode value={orderQrOrderDetails?.address} size={260} />
                </div>

                {/* Steps */}
                <div className="w-full mt-6">
                  <div className="flex items-center justify-between relative">
                    {/* Line (background) */}
                    <div
                      className="absolute top-4 left-0 right-0 h-[2px] 
      bg-gray-300 dark:bg-white/10 z-0"
                    />

                    {/* Active Line */}
                    <div
                      className="absolute top-4 left-0 h-[2px] 
      bg-gradient-to-r from-purple-500 to-indigo-500 
      z-0 transition-all duration-500"
                      style={{
                        width: `${(currentIndex / (steps.length - 1)) * 100}%`,
                      }}
                    />

                    {steps.map((step, index) => {
                      const isCompleted = index < currentIndex;
                      const isActive = index === currentIndex;

                      return (
                        <div
                          key={index}
                          className="relative z-10 flex flex-col items-center w-full"
                        >
                          {/* Circle */}
                          <div
                            className={`
              w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold
              transition-all duration-300

              ${
                isCompleted
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/40"
                  : isActive
                    ? "border-2 border-purple-500 text-purple-500 dark:text-purple-400 bg-white dark:bg-black/40 shadow-[0_0_10px_#a855f7]"
                    : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }
            `}
                          >
                            {isCompleted ? "✓" : index + 1}
                          </div>

                          {/* Label */}
                          <span
                            className={`
              mt-2 text-[11px] text-center whitespace-nowrap

              ${
                isCompleted
                  ? "text-purple-500 dark:text-purple-400"
                  : isActive
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
              }
            `}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center mx-auto items-center">
                  <FormControl>
                    <Typography
                      mb={2}
                      className="text-gray-600 dark:text-gray-300"
                    >
                      Select Method
                    </Typography>

                    <RadioGroup
                      row
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      sx={{
                        gap: 2,
                      }}
                    >
                      {/* Wallet */}
                      <FormControlLabel
                        value="wallet"
                        control={<Radio sx={{ display: "none" }} />}
                        label={
                          <Box
                            sx={{
                              p: 2,
                              width: 150,
                              borderRadius: "16px",
                              border:
                                method === "wallet"
                                  ? "2px solid #6366f1"
                                  : "1px solid #89909B",
                              background:
                                method === "wallet"
                                  ? "rgba(99,102,241,0.2)"
                                  : "rgba(255,255,255,0.05)",
                              cursor: "pointer",
                              textAlign: "center",
                              transition: "0.3s",
                              backdropFilter: "blur(10px)",
                              "&:hover": {
                                borderColor: "#6366f1",
                                transform: "scale(1.05)",
                              },
                            }}
                          >
                            💳
                            <Typography
                              mt={1}
                              className="dark:text-white text-black"
                            >
                              Wallet
                            </Typography>
                          </Box>
                        }
                      />

                      {/* QR */}
                      <FormControlLabel
                        value="qr"
                        control={<Radio sx={{ display: "none" }} />}
                        label={
                          <Box
                            sx={{
                              p: 2,
                              width: 150,
                              borderRadius: "16px",
                              border:
                                method === "qr"
                                  ? "2px solid #6366f1"
                                  : "1px solid #89909B",
                              background:
                                method === "qr"
                                  ? "rgba(99,102,241,0.2)"
                                  : "rgba(255,255,255,0.05)",
                              cursor: "pointer",
                              textAlign: "center",
                              transition: "0.3s",
                              backdropFilter: "blur(10px)",
                              "&:hover": {
                                borderColor: "#6366f1",
                                transform: "scale(1.05)",
                              },
                            }}
                          >
                            📱
                            <Typography
                              mt={1}
                              className="dark:text-white text-black"
                            >
                              QR Deposit
                            </Typography>
                          </Box>
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                </div>
                {/* Amount */}
                {method == "wallet" && (
                  <div className="mt-6">
                    <CustomInput
                      placeholder="Enter amount"
                      name="userName"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      startIcon={
                        <FaDollarSign size={20} className="text-green-400" />
                      }
                    />
                  </div>
                )}

                {/* Button */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={method == "wallet" ? addFundUSer : qrDeposit}
                    className="px-6 py-2 rounded-full bg-gradient-to-r cursor-pointer from-indigo-500 to-purple-600 text-white shadow-lg hover:scale-105 transition-all duration-300 active:scale-95"
                  >
                    {loading
                      ? "Processing..."
                      : method == "wallet"
                        ? "Add Funds"
                        : "Generate QR"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <SuccessPopup show={isSuccess} onClose={() => setIsSuccess(false)} />
    </>
  );
}
