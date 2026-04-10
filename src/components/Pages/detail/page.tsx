"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  commonQuestionFindById,
  questionDetails,
} from "@/components/service/apiService/category";
import socket from "@/components/socket";
import BuySell from "@/components/Modal/BuySell/page";
import {
  cancelOrder,
  getGraphData,
  getLeaderBoardMarket,
  getOrdersList,
} from "@/components/service/apiService/buySell";
import { useSelector } from "react-redux";
import MarketSkeleton from "@/components/common/CartDetailLoader";
import Authentication from "@/components/Pages/auth";
import MarketLeaderboard from "./component/MarketLeaderboard";
import ConfirmationModal from "@/components/Modal/ConfirmationModal/page";
import toast from "react-hot-toast";
import {
  CancelOrders,
  GraphData,
  LeaderboardItem,
  MarketData,
  OptionItem,
  OrderFlow,
  OrderFlowItem,
  OrderItem,
  QuestionItem,
  SellOrder,
  SocketOption,
  SocketOrderUpdatePayload,
  SocketPricePayload,
  SocketTradePayload,
  UserDetailsRootState,
} from "@/utils/typesInterface";
import {
  BASE_COLORS,
  delay,
  extractSingleMainKeyword,
  truncateValue,
} from "@/utils/Content";
import OrderList from "./component/OrderList";
import StackedAreaChart from "./component/realTimeChart";
import IdeasActivityTabs from "./component/ideaComment";
import { ArrowRight } from "lucide-react";
import MarketAccordion from "./component/optionsDropdown/page";
import { useRouter } from "next/navigation";

type OrderSide = "BUY" | "SELL";

const Details = ({ marketId }) => {
  const [orderFlow, setOrderFlow] = useState<OrderFlow>({
    buys: [],
    sells: [],
  });
  const [isLoader, setIsLoader] = useState(false);
  const [data, setData] = useState<MarketData | null>(null);
  const [leaderBoard, setLeaderBoard] = useState<LeaderboardItem[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({
    series: [],
  });
  const [isOpenBuySell, setIsOpenBuySell] = useState(false);
  const [buyType, setBuyType] = useState<OrderSide | unknown>();
  const [options, setOptions] = useState<OptionItem | null>(null);
  const userDetails = useSelector((state: UserDetailsRootState) => state?.user);
  const processedOrderIdsRef = useRef<Set<number>>(new Set());
  const OrderHistoryIdsRef = useRef<Set<number>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const [optionIndex, setOptionIndex] = useState<number | null>(null);
  const [orderData, setOrderData] = useState<OrderItem[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [deleteResponse, setDeleteResponse] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [timeInterval, setTimeInterval] = useState("all");
  const [selectedOrderDetails, setSelectedOrderDetails] =
    useState<CancelOrders | null>(null);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageResponse, setOrderPageResponse] = useState({});
  const [orderStatus, setOrderStatus] = useState("NEW");

  const router = useRouter();
  // search data from question start
  const [questionData, setQuestionData] = useState<QuestionItem[]>([]);

  const fetchQuestions = async (searchValue: string) => {
    if (!searchValue) return;

    try {
      const response = await commonQuestionFindById(
        1, // page
        null, // limit
        null, // sort
        "", // filter
        "", // status
        searchValue, // Search Keyword
        null, // userId
      );

      if (response?.success) {
        // API structure ke hisaab se check karein: response.data.questions ya response.questions
        const questions = response.data?.questions || response.data || [];
        setQuestionData(questions);
      }
    } catch (error) {
      // console.error("API Call failed:", error);
    }
  };

  useEffect(() => {
    const sentence = data?.question?.question;
    if (sentence) {
      const keyword = extractSingleMainKeyword(sentence);

      // Agar keyword string hai aur "No keyword found" nahi hai, tabhi hit karein
      if (keyword && keyword !== "No keyword found") {
        fetchQuestions(keyword);
      }
    }
  }, [data?.question?.question]); // Jab question data load hoga, tabhi ye trigger hoga

  const sentence1 = "Trump nominate as the next Fed Chair?";

  const questionDetailsList = useCallback(async () => {
    setIsLoader(true);
    try {
      const [response] = await Promise.all([
        questionDetails(marketId as string, userDetails?.user?.id as number),
        delay(2000),
      ]);
      if (response?.success) {
        setOrderFlow({
          buys: response.data.orderFlow?.buys ?? [],
          sells: response.data.orderFlow?.sells ?? [],
        });
        setCurrentVolume(response?.data?.market?.totalMarketVolume);
        setData(response.data);
      } else {
        setOrderFlow({ buys: [], sells: [] });
        setData(null);
      }
    } finally {
      setIsLoader(false);
    }
  }, [marketId, userDetails?.user?.id]);

  useEffect(() => {
    questionDetailsList();
  }, [questionDetailsList, marketId]);

  const getGraphDetails = useCallback(async () => {
    const response = await getGraphData(marketId, timeInterval);
    if (response?.success) {
      setGraphData(response.data);
    } else {
      setGraphData({ series: [] });
    }
  }, [marketId, timeInterval]);

  useEffect(() => {
    getGraphDetails();
  }, [questionDetailsList, getGraphDetails, marketId]);

  const questionId = marketId;

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("subscribe:market", questionId);
      if (userDetails?.user?.id) {
        socket.emit("subscribe:user", userDetails?.user?.id);
      }
    });
    socket.on("market:prices", (payload: SocketPricePayload) => {
      if (!payload?.questionId || !payload?.timestamp) return;

      setGraphData((prev: any) => {
        if (!prev.series?.length) return prev;

        const updatedSeries = prev.series.map((series: any) => {
          const livePrice: any = payload?.options?.find(
            (p: SocketOption) => p?.optionId === series?.optionId,
          );
          if (!livePrice) return series;
          const lastPoint: {
            timestamp: string;
            price: number;
          } = series.data?.[series.data.length - 1];
          if (
            lastPoint &&
            lastPoint.timestamp === payload.timestamp &&
            lastPoint.price === livePrice.price
          ) {
            return series;
          }

          return {
            ...series,
            data: [
              ...series.data,
              {
                timestamp: payload.timestamp,
                price: livePrice.price,
              },
            ],
          };
        });

        return { series: updatedSeries };
      });
    });

    socket.on("trade", (payload: SocketTradePayload) => {
      if (payload?.type == "LIMIT" && payload?.share > 0) {
        const tradeRow: OrderFlowItem = {
          id: payload.orderId,
          optionId: payload.optionId,
          shares: Number(payload.share),
          saleAtPrice: Number(payload.share / payload.cash),
          createdAt: new Date(payload.ts).toISOString(),
        };
        if (OrderHistoryIdsRef.current.has(payload.orderId)) {
          return;
        }
        OrderHistoryIdsRef.current.add(payload.orderId);
        if (payload?.share) {
          setCurrentVolume((prev) => prev + Number(payload.share ?? 0));
        }

        setOrderFlow((prev) => ({
          buys: payload.side === "BUY" ? [tradeRow, ...prev.buys] : prev.buys,
          sells:
            payload.side === "SELL" ? [tradeRow, ...prev.sells] : prev.sells,
        }));
      } else {
        return;
      }
    });

    socket.on("order:update", (payload: SocketOrderUpdatePayload) => {
      if (payload?.type == "LIMIT") {
        return;
      } else {
        if (
          !payload?.questionId ||
          !payload?.optionId ||
          typeof payload?.orderId !== "number" ||
          typeof payload?.filled !== "number"
        ) {
          return;
        }
        if (processedOrderIdsRef.current.has(payload.orderId)) {
          return;
        }
        processedOrderIdsRef.current.add(payload.orderId);
        setData((prev): MarketData | null => {
          if (!prev || !Array.isArray(prev.options)) {
            return prev;
          }

          const updatedOptions: OptionItem[] = prev.options.map(
            (option: OptionItem, index: number) => {
              const newPrice = payload.prices?.[index];

              if (option.id === payload.optionId) {
                const prevPosition = option.userPosition ?? {
                  shares: 0,
                  invested: 0,
                  pnl: 0,
                };

                const updatedShares =
                  payload.side === "BUY"
                    ? prevPosition.shares + payload.filled
                    : prevPosition.shares - payload.filled;

                return {
                  ...option,
                  price:
                    typeof newPrice === "number" && !Number.isNaN(newPrice)
                      ? newPrice
                      : option.price,
                  winningProbability:
                    typeof newPrice === "number" && !Number.isNaN(newPrice)
                      ? newPrice
                      : option.winningProbability,
                  userPosition: {
                    shares: updatedShares,
                    invested: prevPosition.invested,
                    pnl: prevPosition.pnl,
                  },
                };
              }

              return {
                ...option,
                price:
                  typeof newPrice === "number" && !Number.isNaN(newPrice)
                    ? newPrice
                    : option.price,
                winningProbability:
                  typeof newPrice === "number" && !Number.isNaN(newPrice)
                    ? newPrice
                    : option.winningProbability,
              };
            },
          );

          return {
            ...prev,
            options: updatedOptions,
            lastOrderUpdatedAt: new Date().toISOString(),
          };
        });
      }
    });

    socket.on("connect_error", (err) => {});

    socket.on("disconnect", (reason) => {});
    return () => {
      // socket.emit("unsubscribe:market", questionId);
      // socket.off("connect");
      // socket.off("market:prices");
      // socket.off("trade");
      // socket.off("order:update");
      socket.offAny();
    };
  }, [questionId, userDetails?.user?.id]);

  const getToken =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const handleBuyNow = (row: OptionItem, type: string, idx: number) => {
    if (!getToken) {
      setIsOpen(true);
      return;
    }
    setOptionIndex(idx);
    setOptions(row);
    setBuyType(type);
    setIsOpenBuySell(true);
  };

  const getLeaderBoardMarketList = useCallback(async () => {
    try {
      const response = await getLeaderBoardMarket(marketId);

      if (response?.success) {
        setLeaderBoard(response.data.leaderboard as LeaderboardItem[]);
      } else {
        setLeaderBoard([]);
      }
    } catch {
      setLeaderBoard([]);
    }
  }, [marketId]);

  useEffect(() => {
    getLeaderBoardMarketList();
  }, [getLeaderBoardMarketList]);

  const ordersList = async () => {
    try {
      const response = await getOrdersList(marketId, orderPage, 5, orderStatus);

      if (response?.success) {
        setOrderData(response.data?.orders ?? []);
        setOrderPageResponse(response?.data?.pagination || {});
      } else {
        // setOrderPage(null);
        setOrderData([]);
      }
    } catch {
      setOrderData([]);
    }
  };
  useEffect(() => {
    ordersList();
  }, [orderPage, orderStatus]);

  const sellPrices =
    orderFlow?.sells?.map((i: SellOrder) => Number(i?.saleAtPrice) || 0) || [];
  const minSellPrice = Math.min(...sellPrices);
  const maxSellPrice = Math.max(...sellPrices);
  const getBarWidth = (price: number) => {
    const minWidth = 10;
    const maxWidth = 80;
    if (maxSellPrice === minSellPrice) return "45%";

    const width =
      minWidth +
      ((price - minSellPrice) / (maxSellPrice - minSellPrice)) *
        (maxWidth - minWidth);

    return `${Math.round(width)}%`;
  };

  const buyPrices =
    orderFlow?.buys?.map((i: SellOrder) => Number(i?.saleAtPrice) || 0) || [];

  const minBuyPrice = Math.min(...buyPrices);
  const maxBuyPrice = Math.max(...buyPrices);

  const getBuyBarWidth = (price: number) => {
    const minWidth = 10;
    const maxWidth = 80;
    if (maxBuyPrice === minBuyPrice) return "45%";

    const width =
      minWidth +
      ((price - minBuyPrice) / (maxBuyPrice - minBuyPrice)) *
        (maxWidth - minWidth);

    return `${Math.round(width)}%`;
  };

  const prices = Array.isArray(data?.options)
    ? data.options.map((o: OptionItem) => Number(o?.price ?? 0))
    : [];

  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 1;

  const getIntensity = (price: number) => {
    if (!prices.length || maxPrice === minPrice) return 0.5;
    return (price - minPrice) / (maxPrice - minPrice);
  };

  const handleDelete = (row: number) => {
    setSelected(row);
    setDeleteOpen(true);

    const ordersFilter = orderData?.find((item) => item.id == row);

    setSelectedOrderDetails(
      ordersFilter
        ? {
            maxCost:
              ordersFilter?.tpslLeg == "TP_OR_SL"
                ? ordersFilter?.triggerPrice
                : ordersFilter?.side == "SELL"
                  ? ordersFilter.minProceeds
                  : ordersFilter.maxCost,
            shares: ordersFilter.shares,
          }
        : null,
    );
  };
  const closeDeleteModal = () => {
    setDeleteOpen(false);
    setSelected(null);
  };

  const confirmDelete = async () => {
    if (selected) {
      setDeleteResponse(true);
      try {
        const response = await cancelOrder(selected);
        if (response?.success) {
          toast.success(response.message);
          setDeleteOpen(false);
          setSelected(null);
          ordersList();
        } else {
          toast.error(response.message);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong");
        }
      } finally {
        setDeleteResponse(false);
      }
    }
  };

  // const metaData = data?.question?.metadata
  //   ? JSON.parse(data?.question?.metadata)
  //   : "";
  const metaData = { imageUrl: "" };

  const questionImages = (() => {
    if (!data?.question?.metadata) return null;
    if (typeof data?.question?.metadata === "object") {
      return data?.question?.metadata;
    }
    try {
      return JSON.parse(data?.question?.metadata);
    } catch (e) {
      return null;
    }
  })();

  const handleLoginCheck = () => {
    if (!getToken) {
      setIsOpen(true);
      return;
    }
  };

  return (
    <div>
      {isLoader ? (
        <MarketSkeleton />
      ) : (
        <div>
          <div className="max-w-[1450px] mx-auto px-4 md:mt-18 mt-14">
            <div className="container mx-auto pb-6">
              <div className="flex md:mb-6">
                {questionImages?.imageUrl && (
                  <div className=" h-16 w-16 flex items-center justify-center   dark:bg-gray-600 rounded mr-2">
                    <Image
                      src={
                        questionImages?.imageUrl || "/img/opinionLogo-light.png"
                      }
                      alt="NYC Flag"
                      width={80}
                      height={80}
                      className={`rounded ${metaData ? "" : "opacity-45"} `}
                    />
                  </div>
                )}
                <div className="w-full">
                  <h1 className=" text-lg sm:text-xl  lg:text-2xl font-semibold globalFonts text-black dark:text-white">
                    {data?.question?.question}
                  </h1>
                  <p className="text-sm text-[#7F90A7] dark:text-gray-300 globalFonts">
                    $ {truncateValue(Number(currentVolume || 0)) || 0} Vol.
                  </p>

                  <div className="hidden md:block">
                    <div className="flex flex-wrap w-full  gap-4 mt-1 text-sm">
                      {data?.options?.map((item: OptionItem, index: number) => (
                        <div key={index} className="w-fit items-center flex">
                          <span
                            className="rounded-full inline-block mr-2"
                            style={{
                              width: "10px",
                              height: "10px",
                              background: BASE_COLORS[index],
                            }}
                          ></span>

                          <span className="text-[#7F90A7] font-medium globalFonts dark:text-gray-400">
                            {item?.name || "--"},{" "}
                            {truncateValue(item?.price * 100, 1)} %
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex md:hidden mb-6 flex-wrap space-x-2 text-sm">
                {data?.options?.map((item: OptionItem, index: number) => (
                  <div key={index} className=" text-wrap items-center">
                    <span
                      className={`rounded-full  inline-block mr-2`}
                      style={{
                        width: "10px",
                        height: "10px",
                        background: BASE_COLORS[index],
                      }}
                    ></span>
                    <span className="text-[#7F90A7] font-semibold globalFonts dark:text-gray-300">
                      {item?.name || "--"},{" "}
                      {truncateValue(item?.price * 100, 1)} %
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-visible">
                <div className="md:col-span-2 space-y-6">
                  <div className="h-64  mb-20  flex">
                    <span className="text-gray-500  w-full ">
                      <StackedAreaChart
                        data={graphData?.series}
                        setTimeIntervalValue={setTimeInterval}
                        timeIntervalValue={timeInterval}
                      />
                    </span>
                  </div>

                  <div>
                    <MarketAccordion
                      data={data?.options}
                      handleBuySell={handleBuyNow}
                    />
                  </div>

                  <div className="flex flex-col gap-4 lg:col-span-3  overflow-visible">
                    <MarketLeaderboard data={leaderBoard} />

                    {orderData?.length > 0 && (
                      <OrderList
                        data={orderData}
                        cancelOrders={handleDelete}
                        page={orderPage}
                        setOrderPage={setOrderPage}
                        orderPageResponse={orderPageResponse}
                        status={orderStatus}
                        setOrderStatus={setOrderStatus}
                      />
                    )}
                  </div>
                  <div className="mt-4">
                    <h1 className="md:text-xl font-semibold tracking-wide text-black/80 dark:text-white md:mb-5 mb-4">
                      People are also buying
                    </h1>
                    {questionData
                      ?.filter(
                        (item) => item?.question !== data?.question?.question,
                      )
                      ?.slice(0, 3)
                      ?.map((item, index) => {
                        const metaData = (() => {
                          if (!item?.metadata) return null;
                          if (typeof item?.metadata === "object")
                            return item?.metadata;
                          try {
                            return JSON.parse(item?.metadata);
                          } catch (e) {
                            return null;
                          }
                        })();

                        return (
                          <div
                            key={item?.id || index}
                            onClick={() => router.push(`/market/${item?.id}`)}
                            className="flex justify-start gap-1 items-center p-2 hover:bg-gray-200/40 cursor-pointer dark:hover:bg-gray-600/10"
                          >
                            {metaData?.imageUrl && (
                              <div>
                                <Image
                                  src={
                                    metaData?.imageUrl ||
                                    "/img/opinionLogo-light.png"
                                  }
                                  alt="Market Logo"
                                  width={50}
                                  height={50}
                                  className="mr-4 rounded-lg object-cover h-[50px] w-[50px]"
                                />
                              </div>
                            )}
                            <div>
                              <p className="dark:text-gray-300 text-black/80 text-md font-normal line-clamp-2">
                                {item?.question || "--"}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                    <div className="mt-5 md:mt-10">
                      <IdeasActivityTabs
                        marketId={marketId}
                        handleLoginCheck={handleLoginCheck}
                        token={getToken}
                      />
                    </div>
                  </div>
                </div>

                <div className="md:block hidden">
                  <div className="md:col-span-1 h-[440px] border border-gray-200 dark:border-[#111A22] rounded-lg p-3 lg-p-6 sticky top-32">
                    <div className="flex justify-between pr-3 items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                        Shares
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-200">
                        Price
                      </span>
                    </div>

                    <div className=" mt-2 w-full rounded-md overflow-hidden">
                      <div className="divide-y dark:bg-[#0c1118]  bg-gray-100/50 h-[160px] hideScrollbar overflow-y-auto dark:divide-[#1c1f26] divide-[#d6d6d6]">
                        {orderFlow?.sells?.length > 0 ? (
                          orderFlow.sells.map((item: OrderFlowItem) => {
                            const price = Number(item?.saleAtPrice) || 0;

                            return (
                              <div
                                key={item?.id}
                                className="relative flex justify-between px-2 py-1 text-sm text-red-400 font-medium overflow-hidden"
                              >
                                {/* Background bar */}
                                <div
                                  className="absolute right-0 top-0 h-full bg-red-500 opacity-10 z-0 transition-all duration-300"
                                  style={{ width: getBarWidth(price) }}
                                ></div>

                                <span className="z-10">
                                  {truncateValue(Number(item?.shares || 0)) ||
                                    "0.00"}
                                </span>
                                <span className="z-10">
                                  ${truncateValue(price || 0)}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-6 text-gray-400 text-sm ">
                            No sell orders yet
                          </div>
                        )}
                      </div>

                      <div className="text-center dark:text-white text-black font-bold py-2 text-base border-y dark:border-[#1c1f26] border-[#d6d6d6]">
                        $ {truncateValue(Number(currentVolume || 0)) || 0} Vol.
                        <span className="text-green-500 text-xs align-top">
                          ▲
                        </span>
                      </div>

                      <div className="divide-y dark:bg-[#0c1118]  bg-gray-100/50 h-[160px] hideScrollbar overflow-y-auto dark:divide-[#2e3139] divide-[#d6d6d6]">
                        {orderFlow?.buys?.length > 0 ? (
                          orderFlow.buys.map((item: OrderFlowItem) => {
                            const price = Number(item?.saleAtPrice) || 0;
                            return (
                              <div
                                key={item?.id}
                                className="relative flex justify-between px-2 py-1 text-sm text-green-400 font-medium"
                              >
                                <div
                                  className="absolute right-0 top-0 h-full bg-green-500 opacity-10 z-0 transition-all duration-300"
                                  style={{ width: getBuyBarWidth(price) }}
                                ></div>
                                <span className="z-10">
                                  {truncateValue(Number(item?.shares || 0)) ||
                                    "0.00"}
                                </span>
                                <span className="z-10">
                                  $ {truncateValue(price || 0)}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-6 text-gray-400 text-sm ">
                            No buy orders yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Authentication
        isLogin
        isOpen={isOpen}
        handleClose={() => setIsOpen(false)}
      />
      <BuySell
        rowDetailss={data as null}
        isOpen={isOpenBuySell}
        onClose={() => setIsOpenBuySell(false)}
        orderType={buyType as string}
        handleChangeOrderType={setBuyType}
        option={options}
        optionIndex={optionIndex as number}
        fetchOrders={ordersList}
      />

      <ConfirmationModal
        open={deleteOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isLoading={deleteResponse}
        selectedOrderDetails={selectedOrderDetails}
      />
    </div>
  );
};

export default Details;
