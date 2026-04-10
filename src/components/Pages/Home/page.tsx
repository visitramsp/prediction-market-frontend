"use client";
import React, { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { useState } from "react";
import Authentication from "@/components/Pages/auth";
import { useDispatch, useSelector } from "react-redux";
import LoadingCard from "@/components/common/LoadingCard";
import BuySell from "@/components/Modal/BuySell/page";
import { commonQuestionFindById } from "@/components/service/apiService/category";
import { useRouter } from "next/navigation";
import { GiNinjaStar } from "react-icons/gi";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  FaArrowDown,
  FaArrowUp,
  FaBookmark,
  FaRegBookmark,
} from "react-icons/fa";

import {
  isWatchListInterface,
  OptionItem,
  QuestionItem,
  QuestionItemSecond,
  RootState,
} from "@/utils/typesInterface";
import { delay, truncateValue } from "@/utils/Content";
import {
  fetchWatchList,
  postQuestionBookUnBookMark,
} from "@/components/service/apiService/user";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";
import moment from "moment";
import GlobalLoader from "@/components/common/Loader";
import {
  addWatchList,
  removeWatchList,
  saveQuestion,
} from "@/components/store/slice/watchList";
import { distance } from "framer-motion";
import { useSidebar } from "@/components/TradingLayout";
import SubCategory from "../subCategory/page";

interface selectedSubCategory {
  category: {
    selectSubCategory: {
      id: number;
      isActive: Boolean;
      name: String;
      slug: String;
    };
  };
}
interface eventSubCategory {
  category: {
    isEvent: boolean;
  };
}

export interface HideFilter {
  sports: boolean;
  crypto: boolean;
  earnings: boolean;
}

export interface CategoryFilters {
  search: "";
  frequency: "All" | "Daily" | "Weekly" | "Monthly";
  status: "Active" | "Resolved";
  sortBy:
    | "Newest"
    | "24h Volume"
    | "Total Volume"
    | "Competitive"
    | "Ending Soon";
  hideFilter: HideFilter;
}

export interface CategoryState {
  category: Record<string, any>;
  subCategory: any[];
  eventCategory: any[];
  selectSubCategory: Record<string, any>;
  isEvent: boolean;
  filters: CategoryFilters;
}

export interface RootStateNewssss {
  category: CategoryState;
}

const Home = () => {
  const [loader, setLoader] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buyType, setBuyType] = useState<string | null>(null);
  const [options, setOptions] = useState<OptionItem | null>(null);
  const [rowDetails, setRowDetails] = useState<QuestionItemSecond | null>(null);
  const [optionIndex, setOptionIndex] = useState<number | null>(null);
  const [eventSubCategoryId, setEventSubCategoryId] = useState<any>(null);

  // pagination start
  const listRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [pagination, setPagination] = useState<any>({});
  const [emptyData, setEmptyData] = useState([]);
  const [isLoader, setIsLoader] = useState(false);
  const [width, setWidth] = useState(0);
  const { isSidebarOpen } = useSidebar();
  const questionData = useSelector(
    (state: any) => state?.watchlist?.questionList || [],
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    handleResize(); // initial
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // pagination end
  const getToken = localStorage.getItem("token");
  const router = useRouter();
  const categoryDetails = useSelector(
    (state: RootState) => state?.category?.category,
  );
  const selectedSubCategory = useSelector(
    (state: selectedSubCategory) => state?.category?.selectSubCategory,
  );
  const isEvent = useSelector(
    (state: eventSubCategory) => state?.category?.isEvent,
  );

  //
  const filtersForCategory = useSelector(
    (state: RootStateNewssss) => state?.category?.filters,
  );
  const isWatchList = useSelector(
    (state: isWatchListInterface) => state?.category?.isWatchList,
  );
  const userDetails = useSelector((state: RootState) => state?.user);
  const isFilterQuestion = useSelector(
    (state: isWatchListInterface) => state?.category?.isFilterQuestion,
  );
  const { search, sortBy, frequency, status, hideFilter } = filtersForCategory;
  const CATEGORY_MAP: Record<string, number> = {
    earnings: 18,
    sports: 7,
    crypto: 14,
  };

  const eventCategory = useSelector(
    (state: any) => state?.category?.eventCategory,
  );

  const hiddenCategories = Object.entries(hideFilter)
    .filter(([_, value]) => value === true)
    .map(([key]) => CATEGORY_MAP[key]);

  const questionAllList = async (newOffset = 0) => {
    newOffset === 0 ? setLoader(true) : setIsLoader(true);

    try {
      const ids = isEvent ? eventSubCategoryId : selectedSubCategory?.id;

      const [response] = await Promise.all([
        commonQuestionFindById(
          categoryDetails?.id || 1,
          ids,
          sortBy,
          frequency,
          status,
          search,
          hiddenCategories,
          12,
          newOffset,
        ),
        delay(newOffset === 0 ? 1000 : 500),
      ]);

      if (response?.success) {
        const newData = response?.data?.questions || [];
        setEmptyData(newData);

        dispatch(
          saveQuestion({
            newData: newData,
            newOffset: newOffset,
          }),
        );

        setPagination(response?.data || {});
      }
    } catch (error) {
      // console.error("Error fetching questions:", error);
    } finally {
      setLoader(false);
      setIsLoader(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    questionAllList(0);
  }, [
    isWatchList,
    categoryDetails?.id,
    userDetails?.user?.id,
    selectedSubCategory?.id,
    eventSubCategoryId,
    isEvent,
    sortBy,
    frequency,
    status,
    search,
    hiddenCategories.join(","),
  ]);

  useEffect(() => {
    if (emptyData?.length === 0) {
      return;
    }
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= fullHeight - (width > 500 ? 200 : 1000)) {
        if (!isLoader && pagination?.limit) {
          const newOffset =
            (pagination?.offset || 0) + (pagination?.limit || 12) + 1;

          // ✅ stop duplicate calls
          if (newOffset > offset) {
            setOffset(newOffset);
            questionAllList(newOffset);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pagination?.offset, pagination?.limit, isLoader, offset]);

  const handleBuyNow = (
    row: QuestionItemSecond,
    item: OptionItem,
    type: string,
    idx: number,
  ) => {
    if (!getToken) {
      setIsOpen(true);
      return;
    }
    setOptionIndex(idx);
    setRowDetails(row);
    setOptions(item);
    setBuyType(type);
    setIsModalOpen(true);
  };

  const goToDetails = (questionId: string) => {
    router.push(`/markets/${questionId}`);
  };

  const bookMarkUnBookMark = async (id: string, row: any) => {
    try {
      if (!row?.isBookmark) {
        dispatch(addWatchList(row));
      } else {
        dispatch(removeWatchList(id));
      }

      // isBookmark
      const payload = { questionId: id };
      const response = await postQuestionBookUnBookMark(payload);
      if (response.success) {
        toast.success(
          response.data?.bookmarked
            ? "Question added to watchlist"
            : "Question removed from watchlist",
        );
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.success("");
    }
  };

  const questionListFilter = questionData;

  return (
    <>
      <div
        className={`max-w-[1450px]  min-h-[calc(100vh-300px)] mx-auto px-4 pb-10 ${
          eventCategory?.length > 0 && isFilterQuestion
            ? "pt-8 lg:pt-32"
            : eventCategory?.length > 0
              ? "pt-8 lg:pt-20"
              : selectedSubCategory == null && isFilterQuestion
                ? "pt-44 lg:pt-2"
                : "pt-8 sm:pt-10 md:pt-5 lg:pt-16 "
        }`}
      >
        <div
          className={`grid  grid-cols-1 ${isEvent ? "grid-cols-1" : isSidebarOpen ? "lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-3"}  gap-4 pt-10 lg:pt-0`}
        >
          {isEvent ? (
            <SubCategory
              eventSubCategoryId={eventSubCategoryId}
              setEventSubCategoryId={setEventSubCategoryId}
              questionData={questionListFilter}
              isSidebarOpen={isSidebarOpen}
              bookMarkUnBookMark={bookMarkUnBookMark}
              getToken={getToken}
              setIsOpen={setIsOpen}
              loader={loader}
            />
          ) : loader ? (
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]?.map((row) => (
              <LoadingCard key={row} />
            ))
          ) : questionListFilter && questionListFilter.length > 0 ? (
            questionListFilter?.map((row: QuestionItem, index) => {
              const metaData = (() => {
                if (!row?.metadata) return null;
                if (typeof row?.metadata === "object") {
                  return row?.metadata;
                }
                try {
                  return JSON.parse(row?.metadata);
                } catch (e) {
                  return null;
                }
              })();
              const prices = row?.options?.map((opt) => opt.price) || [];
              const maxPrice = Math.max(...prices);
              const minPrice = Math.min(...prices);
              const isAllEqual = maxPrice === minPrice;
              return (
                <div
                  key={index}
                  className="border relative border-[var(--color-borderlight)]
                        dark:border-[var(--color-borderdark)]
                        bg-[var(--boxbg2)] dark:bg-[var(--boxbg1)]
                        relative rounded-xl px-4 py-2
                        transform transition-all duration-300 ease-in-out
                        hover:scale-106 hover:shadow-md
                        z-0 hover:z-8
                        "
                >
                  <div className="flex mb-2">
                    {metaData?.imageUrl && (
                      <div
                        className=" mr-2 rounded-md bg-gray-100 dark:bg-gray-700
             w-[44px] h-[44px] flex items-center justify-center shrink-0 "
                      >
                        <Image
                          src={
                            metaData?.imageUrl || "/img/opinionLogo-light.png"
                          }
                          width={40}
                          height={40}
                          alt="trending"
                          className="w-full h-full object-contain opacity-80 rounded"
                        />
                      </div>
                    )}

                    <h2 className="font-semibold text-sm cursor-pointer dark:text-[var(--color-text)] text-[var(--color-text)] flex-1">
                      <div onClick={() => goToDetails(row.id)}>
                        <div className="block text-primary">
                          <div
                            className="line-clamp-1 globalFonts"
                            title={row?.question || "--"}
                          >
                            {row?.question || "--"}
                          </div>
                        </div>
                        <span className=" text-gray-400 globalFonts text-[11px]  ">
                          Resolves, {moment(row?.endDate).format("MMM YYYY")}
                        </span>
                      </div>
                    </h2>
                  </div>

                  {row?.options?.length > 0 && (
                    <div className="text-xs mt-2  h-[130px]  hideScrollbar overflow-y-auto space-y-2">
                      {row?.options?.map((item: OptionItem, idx: number) => {
                        const percentage = item?.price * 100;
                        const isTopOption = item?.price === maxPrice;
                        const gapPercent = maxPrice
                          ? ((maxPrice - item.price) / maxPrice) * 100
                          : 0;
                        const diffPercent = maxPrice
                          ? ((item.price - maxPrice) / maxPrice) * 100
                          : 0;

                        return (
                          <div key={idx}>
                            <div
                              key={idx}
                              className="w-full rounded-xl flex flex-row justify-between gap-3   my-2 "
                            >
                              <div className="flex flex-col  w-[60%] sm:w-[70%] ">
                                <div className="flex items-center justify-between mb-2 gap-2">
                                  <span className="flex-1 min-w-0 dark:text-gray-300   text-[14px] truncate  globalFonts tracking-wide">
                                    {item?.name || "--"}
                                  </span>
                                </div>

                                <div className="h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-2">
                                  <div
                                    className={`h-full ${
                                      isTopOption
                                        ? "bg-gradient-to-r from-teal-400 to-cyan-400"
                                        : "bg-gradient-to-r from-yellow-400 to-red-400"
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                              <div className="flex flex-row justify-end w-[35%] sm:w-[30%] gap-2 items-center">
                                <div
                                  className={`flex items-center gap-1 font-medium ${
                                    isAllEqual
                                      ? "text-gray-400"
                                      : isTopOption
                                        ? "text-gray-400"
                                        : "text-gray-400"
                                  }`}
                                >
                                  <span className="flex text-xs font-normal flex-row text-nowrap">
                                    {truncateValue(1 / item?.price, 1)}x
                                  </span>
                                </div>
                                <div className="border border-green-400 w-16 text-center py-1.5 rounded-full">
                                  <span className="shrink-0 globalFonts text-sm font-semibold">
                                    {percentage.toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex mt-3  align-baseline justify-between text-xs font-normal text-muted">
                    <div className="flex flex-row gap-2 items-center">
                      <div className="flex gap-4 items-center">
                        <span className="flex items-center gap-1">
                          {row?.stats?.totalVolume > 0 ? (
                            <>
                              <span className="text-yellow-500 font-semibold">
                                $
                              </span>
                              <span className="text-gray-400">
                                {Number(row?.stats?.totalVolume || 0).toFixed(
                                  2,
                                )}{" "}
                                Vol
                              </span>
                            </>
                          ) : (
                            <span className="text-yellow-500 flex items-center gap-1">
                              <GiNinjaStar size={12} className="rotate-45" />
                              New
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row items-center gap-3 pr-2">
                      <span>{row?.options?.length || "0"} market</span>

                      <span
                        className="cursor-pointer inline-flex
             transition-transform duration-200 ease-in-out
             hover:scale-125"
                      >
                        {!row?.isBookmark ? (
                          <FaRegBookmark
                            onClick={() =>
                              !getToken
                                ? setIsOpen(true)
                                : bookMarkUnBookMark(row?.id, row)
                            }
                            className="text-sky-400"
                          />
                        ) : (
                          <FaBookmark
                            onClick={() =>
                              !getToken
                                ? setIsOpen(true)
                                : bookMarkUnBookMark(row?.id, row)
                            }
                            className="text-sky-400"
                          />
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">
                No questions found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                There are no active premium questions available right now.
                Please check back later or explore other markets.
              </p>
            </div>
          )}

          {!isEvent &&
            isLoader &&
            [1, 2, 3, 4, 5, 6]?.map((row) => <LoadingCard key={row} />)}
        </div>
      </div>
      <Authentication
        isLogin
        isOpen={isOpen}
        handleClose={() => setIsOpen(false)}
      />

      <BuySell
        rowDetailss={rowDetails as null}
        isOpen={isModalOpen}
        onClose={() => {
          setOptionIndex(null);
          setIsModalOpen(false);
        }}
        orderType={buyType as string}
        handleChangeOrderType={setBuyType}
        option={options}
        optionIndex={optionIndex as number}
        fetchOrders={() => null}
      />
    </>
  );
};
export default Home;
