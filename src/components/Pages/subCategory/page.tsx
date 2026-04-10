import React, { useEffect, useState } from "react";
import SubList from "./components/SubList/page";
import { FaBookmark, FaFootballBall, FaRegBookmark } from "react-icons/fa";
import play from "../../../../public/img/play.png";
import FilterDropdown from "./components/CogDropdown/page";
import Image from "next/image";
import {
  OptionItem,
  QuestionItem,
  QuestionItemSecond,
} from "@/utils/typesInterface";
import { useRouter } from "next/navigation";
import BuySell from "./components/BuyShell/page";
import { truncateValue } from "@/utils/Content";
import moment from "moment";
import { GiNinjaStar } from "react-icons/gi";
import LoadingCard from "@/components/common/LoadingCard";
export default function SubCategory({
  eventSubCategoryId,
  setEventSubCategoryId,
  questionData,
  isSidebarOpen,
  getToken,
  setIsOpen,
  bookMarkUnBookMark,
  loader,
}: {
  eventSubCategoryId: number | null;
  setEventSubCategoryId: (id: number | null) => void;
  questionData: QuestionItem[];
  isSidebarOpen: boolean;
  getToken: string;
  setIsOpen: any;
  bookMarkUnBookMark: any;
  loader: boolean;
}) {
  const router = useRouter();
  const goToDetails = (userId: string) => {
    router.push(`/market/${userId}`);
  };

  return (
    <>
      <div className=" w-full   text-gray-800 dark:text-gray-200 min-h-screen">
        <div className="max-w-[1450px] mx-auto px-4 pb-16  ">
          <div className="md:flex justify-between">
            <div className="md:w-[15%]  md:sticky md:top-28 h-fit">
              <SubList
                eventSubCategoryId={eventSubCategoryId}
                setEventSubCategoryId={setEventSubCategoryId}
              />
            </div>
            <div className="md:w-[85%] md:ml-[2%]">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h1 className="text-xl md:text-xl font-bold dark:text-gray-300 text-gray-700">
                    Sports
                  </h1>
                </div>

                <div>
                  <FilterDropdown />
                </div>
              </div>

              <div
                className={`grid  ${isSidebarOpen ? "grid-cols-1  xl:grid-cols-2" : "grid-cols-1 sm:grid-cols-2"} gap-5`}
              >
                {loader ? (
                  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]?.map((row) => (
                    <LoadingCard key={row} />
                  ))
                ) : questionData?.length > 0 ? (
                  questionData?.map((row) => {
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
                        key={row?.id}
                        className="border border-gray-200 dark:border-gray-700 dark:hover:border-[#c9ae79]/50 hover:border-gray-300 p-3 rounded-lg mb-3"
                      >
                        {/* <p
                          className="text-gray-400 cursor-pointer hover:text-gray-200 text-sm mb-4"
                          onClick={() => goToDetails(row?.id)}
                        >
                          <FaFootballBall className="inline-block" />{" "}
                          {row?.question || ""}
                        </p> */}
                        <div className="flex mb-2">
                          {metaData?.imageUrl && (
                            <div
                              className=" mr-2 rounded-md bg-gray-100 dark:bg-gray-700
                                     w-[44px] h-[44px] flex items-center justify-center shrink-0 "
                            >
                              <Image
                                src={
                                  metaData?.imageUrl ||
                                  "/img/opinionLogo-light.png"
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
                                Resolves,{" "}
                                {moment(row?.endDate).format("MMM YYYY")}
                              </span>
                            </div>
                          </h2>
                        </div>
                        <div className="text-xs mt-4 mb-5 h-[110px] hideScrollbar overflow-y-auto space-y-2">
                          {row?.options?.length > 0 &&
                            row?.options?.map((item, idx) => {
                              const percentage = item?.price * 100;
                              const isTopOption = item?.price === maxPrice;
                              const gapPercent = maxPrice
                                ? ((maxPrice - item.price) / maxPrice) * 100
                                : 0;
                              const diffPercent = maxPrice
                                ? ((item.price - maxPrice) / maxPrice) * 100
                                : 0;
                              return (
                                <>
                                  {/* <div
                                key={item?.id}
                                className="flex justify-between  items-center mb-2"
                              >
                                <div className="text-[16px] dark:text-gray-300 text-gray-800 flex items-center gap-1 min-w-0">
                                  <Image
                                    src={play}
                                    alt="Play Icon"
                                    width={20}
                                    height={20}
                                    className="inline-block"
                                  />
                                  <span className="block truncate w-[180px] md:w-full">
                                    {item?.name || "--"}
                                  </span>
                                </div>
                                <div>
                                  <button
                                    onClick={() =>
                                      handleSelectedQuestion(row, item, idx)
                                    }
                                    className={`py-1.5 bg-green-600/40 text-green-700 dark:text-green-400 font-semibold rounded-xs px-4 cursor-pointer
                                ${isActiveButton && isOptionActive ? "bg-[#c7ac77] " : "dark:text-[#c7ac77] bg-red-500/40 text-red-700 dark:text-red-400"}
                                 border-gray-600  text-gray-700 font-semibold rounded-md text-md`}
                                  >
                                    {truncateValue(item?.price * 100)}%
                                  </button>
                                </div>
                              </div> */}
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
                                </>
                              );
                            })}
                        </div>
                        {/* <span className="text-gray-500 text-xs">
                          $ {truncateValue(row?.stats?.totalVolume || 0)}
                        </span> */}
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
                                      {Number(
                                        row?.stats?.totalVolume || 0,
                                      ).toFixed(2)}{" "}
                                      Vol
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-yellow-500 flex items-center gap-1">
                                    <GiNinjaStar
                                      size={12}
                                      className="rotate-45"
                                    />
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
                            {/* <button
                                                  onClick={() => goToDetails(row.id)}
                                                  className="bg-[#8160ee] cursor-pointer rounded-md py-1.5 px-5 text-[14px] text-white font-semibold text-center"
                                                >
                                                  Trade
                                                </button> */}
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
              </div>
            </div>
            {/* <div className="md:w-[30%] md:sticky md:top-28 h-fit">
              <BuySell
                rowDetailss={selectedQuestion as null}
                handleChangeOrderType={setBuyType}
                option={options}
                optionIndex={optionIndex}
                orderType={buyType}
              />
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}
