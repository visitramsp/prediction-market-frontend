import { HiOutlineChevronDown } from "react-icons/hi";
import { MdOutlineListAlt } from "react-icons/md";
import { LuListFilter } from "react-icons/lu";
import {
  fetchWatchList,
  postQuestionBookUnBookMark,
} from "../service/apiService/user";
import { QuestionItem } from "@/utils/typesInterface";
import { useEffect, useState } from "react";
import moment from "moment";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion"; // 1. Framer motion import karein
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IoCloseCircleOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { removeWatchList, saveWatchList } from "../store/slice/watchList";

export default function WatchList() {
  const [loading, setLoading] = useState(true);
  const watchListData = useSelector(
    (state: any) => state?.watchlist?.watchlist,
  );
  const router = useRouter();
  const dispatch = useDispatch();

  const getWatchList = async () => {
    try {
      const response = await fetchWatchList();
      if (response.success) {
        const list = response?.data?.questions || [];

        dispatch(saveWatchList(list));
      } else {
        dispatch(saveWatchList([]));
      }
    } catch {
      dispatch(saveWatchList([]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWatchList();
  }, []);

  const handleRedirectMarket = (id) => {
    router.push(`/markets/${id}`);
  };

  const bookMarkUnBookMark = async (id: string, status: boolean) => {
    try {
      dispatch(removeWatchList(id));
      toast.success("Question removed from watchlist");
      const payload = { questionId: id };
      const response = await postQuestionBookUnBookMark(payload);
      if (response.success) {
        // toast.success("Question removed from watchlist");
      } else {
        toast.error(response.message || "Failed to remove item");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const locations = location.pathname;

  return (
    <div className="h-full  bg-white dark:bg-[#0F172A]">
      {/* Positions Section */}
      <div
        className={`p-4 ${locations == "/watchlist/" ? "mt-24 " : ""} border-b border-gray-100 dark:border-gray-800`}
      >
        <div className="flex items-center justify-between mb-8 cursor-pointer group">
          <h2 className="font-bold text-gray-900 dark:text-white globalFonts flex items-center gap-2">
            Positions{" "}
            <HiOutlineChevronDown className="text-gray-400 group-hover:text-gray-600" />
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-10">
          <MdOutlineListAlt className="text-4xl text-gray-300 mb-2" />
          <p className="text-sm text-gray-400 font-medium globalFonts">
            No markets
          </p>
        </div>
      </div>

      {/* Watchlist Section */}
      <div className="">
        <div className="flex border-b px-4 py-2 border-gray-100 dark:border-gray-800 items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center globalFonts gap-2">
            Watchlist <HiOutlineChevronDown className="text-gray-400" />
          </h2>
          <LuListFilter className="text-gray-500 cursor-pointer hover:text-black" />
        </div>

        <div className="px-4  hideScrollbar  custom-scrollbar pb-10  max-h-[calc(100vh-380px)]">
          {/* 2. AnimatePresence ka use karein list transition ke liye */}
          <AnimatePresence>
            {!loading && watchListData.length > 0
              ? watchListData.map((row, index) => {
                  const metaData = (() => {
                    if (!row?.metadata) return null;
                    if (typeof row?.metadata === "object") return row?.metadata;
                    try {
                      return JSON.parse(row?.metadata);
                    } catch (e) {
                      return null;
                    }
                  })();

                  return (
                    <motion.div
                      key={row.id || index} // Key zaroori hai
                      // 3. Slide effects define karein
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      transition={{
                        delay: index * 0.03, // Ek-ek karke aayenge (Stagger effect)
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      className="group cursor-pointer border-b border-gray-200 dark:border-gray-700 p-2 -mx-2 "
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-row">
                          {metaData?.imageUrl && (
                            <div
                              onClick={() => handleRedirectMarket(row?.id)}
                              className="mr-2 rounded-md w-[35px] h-[35px] flex items-center justify-center shrink-0"
                            >
                              <Image
                                src={
                                  metaData?.imageUrl ||
                                  "/img/opinionLogo-light.png"
                                }
                                width={35}
                                height={35}
                                alt="trending"
                                className="w-full h-full object-contain opacity-80 rounded"
                              />
                            </div>
                          )}
                          <div>
                            <div className="flex justify-between items-start">
                              <div
                                onClick={() => handleRedirectMarket(row?.id)}
                                className="line-clamp-1 globalFonts text-sm font-medium"
                                title={row?.question || "--"}
                              >
                                {row?.question || "--"}
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-400 uppercase globalFonts tracking-tight">
                              Resolves,{" "}
                              {moment(row?.endDate).format("MMM YYYY")}
                            </p>
                          </div>
                        </div>
                        <div className="flex pl-3 justify-end">
                          <IoCloseCircleOutline
                            onClick={() =>
                              bookMarkUnBookMark(row?.id, row?.isBookmark)
                            }
                            className="text-red-400"
                            size={18}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              : !loading && (
                  <p className="text-xs globalFonts text-center text-gray-400 py-4">
                    Watchlist is empty
                  </p>
                )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
