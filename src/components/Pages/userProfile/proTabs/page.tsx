import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Clock, DollarSign, HelpCircle, ShareIcon } from "lucide-react";
import Box from "@mui/material/Box";
import { PostFeeBack, TabPanelProps } from "@/utils/typesInterface";
import moment from "moment";
import {
  getMyAllPost,
  postBookmarkOrUnBookMark,
  postLikeOrUnlike,
  userPositions,
} from "@/components/service/apiService/user";
import { FaRegCommentAlt } from "react-icons/fa";
import PostList from "../../detail/component/postList";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { delay } from "@/utils/Content";

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

// @/utils/typesInterface.ts

export interface PositionOption {
  optionId: number;
  name: string;
  index: number;
  shares: number;
  currentPrice: number;
  positionValue: number;
}

export interface Position {
  marketId: number;
  question: string;
  questionType: string;
  status: string;
  endDate: string;
  option: PositionOption;
  allOptions: Array<{
    id: number;
    name: string;
    price: number;
    quantity: string;
  }>;
}

export interface PortfolioData {
  investedAmount?: number;
  currentValue?: number;
  totalPnL?: number;
}

export interface StatsData {
  activeMarkets?: string | number;
  totalTrades?: string | number;
}

export interface ProfileTabsProps {
  data: {
    portfolio?: PortfolioData;
    stats?: StatsData;
  };
}

export default function ProfileTabs({ data }: ProfileTabsProps) {
  const [value, setValue] = React.useState(0);
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [myPost, setMyPost] = React.useState<PostFeeBack[]>([]);

  const [offset, setOffset] = React.useState(0);
  const [pagination, setPagination] = React.useState<any>({});
  const [emptyData, setEmptyData] = React.useState([]);
  const [isPaginationLoader, setIsPaginationLoader] = React.useState(false);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    handleResize(); // initial
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await userPositions();

      if (response.success) {
        setPositions(response.data);
      } else {
        setPositions([]);
      }
    } catch {
      setPositions([]);
    }
  };
  React.useEffect(() => {
    fetchPositions();
  }, []);

  const fetchMyAllPost = async (newOffset = offset) => {
    setIsPaginationLoader(true);
    try {
      const [response] = await Promise.all([
        getMyAllPost("", 10, newOffset),
        delay(500),
      ]);

      const newItem = response.feed?.posts ?? [];
      setEmptyData(newItem);
      setPagination(response.feed);
      if (response.feed?.posts?.length > 0) {
        setMyPost((prev: any[]) => {
          if (newOffset === 0) return newItem;

          const map = new Map();
          prev.forEach((item) => map.set(item.id, item));
          newItem.forEach((item) => map.set(item.id, item));

          return Array.from(map.values());
        });
      } else {
        newOffset === 0 && setMyPost([]);
      }
    } catch {
      newOffset === 0 && setMyPost([]);
    } finally {
      setIsPaginationLoader(false);
    }
    // getMyAllPost
  };
  React.useEffect(() => {
    value == 2 && fetchMyAllPost();
  }, [value]);

  React.useEffect(() => {
    if (value == 2 && emptyData?.length === 0) {
      return;
    }
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= fullHeight - (width > 500 ? 200 : 1000)) {
        if (!isPaginationLoader && pagination?.limit) {
          const newOffset =
            (pagination?.offset || 0) + (pagination?.limit || 12);

          // ✅ stop duplicate calls
          if (newOffset > offset) {
            setOffset(newOffset);
            fetchMyAllPost(newOffset);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pagination?.offset, pagination?.limit, isPaginationLoader, offset]);

  const handleBookMarkOrUnBookMark = async (
    id: number,
    isBookmarked: number,
  ) => {
    try {
      setMyPost((prev) => {
        return prev.map((item) => {
          if (item.id === id) {
            const booked = item.isBookmarked === 1 ? 0 : 1;
            return {
              ...item,
              isBookmarked: booked,
            };
          }
          return item;
        });
      });

      if (isBookmarked == 1) {
        toast.success("Remove for bookmarks");
      } else {
        toast.success("Bookmark successfully");
      }
      const payload = {
        postId: id,
      };
      await postBookmarkOrUnBookMark(payload);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const handleLikeUnlike = async (id: number, isLike: number) => {
    try {
      if (isLike == 1) {
        toast.success("Unlike");
      } else {
        toast.success("like");
      }

      setMyPost((prev) =>
        prev.map((item) => {
          if (item.id == id) {
            const isLiked = item.isLiked === 1 ? 0 : 1;

            return {
              ...item,
              isLiked,
              likeCount: isLiked
                ? item.likeCount + 1
                : Math.max(item.likeCount - 1, 0),
            };
          }
          return item;
        }),
      );

      const payload = {
        postId: id,
      };

      await postLikeOrUnlike(payload);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "#495964" }}>
        <Tabs
          value={value}
          onChange={(_, v) => setValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            "& .MuiTab-root": {
              color: "#838383",
              textTransform: "none",

              // ✅ FIXED: readable font on all screens
              fontSize: {
                xs: "12px",
                sm: "14px",
              },

              // ✅ FIXED: reduce padding instead of font
              px: {
                xs: 1,
                sm: 2,
              },

              minHeight: "40px",
            },
            "& .Mui-selected": {
              color: "#0099ff",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#0099ff",
            },
          }}
        >
          <Tab label="Positions" {...a11yProps(0)} />
          <Tab label="Portfolio" {...a11yProps(1)} />
          <Tab label="Posts" {...a11yProps(2)} />
        </Tabs>
      </Box>

      <CustomTabPanel value={value} index={0}>
        {false ? (
          <div className="text-center text-gray-400 py-8">
            Loading positions...
          </div>
        ) : positions && positions?.length > 0 ? (
          <div className="space-y-2 mt-4">
            {positions?.length > 0 ? (
              positions?.map((position, i) => {
                const myOption = position.option;
                const currentValue = myOption.positionValue;

                return (
                  <div
                    key={i}
                    className="
    relative
    rounded-2xl p-5
    bg-gradient-to-br from-white to-gray-50
    dark:from-[#1D293D] dark:to-[#111827]
    border border-gray-200 dark:border-[#111A22]
    hover:border-gray-300 dark:hover:border-gray-500
    shadow-sm hover:shadow-md
    transition-all duration-200
  "
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* LEFT SIDE */}
                      <div className="flex-1 space-y-3">
                        {/* Question */}
                        <h3 className="font-bold text-base leading-snug text-black/80 dark:text-white">
                          {position.question}
                        </h3>

                        {/* Info rows */}
                        <div className="md:flex gap-2 items-center space-y-1 text-sm">
                          {/* Option */}
                          <div className="flex items-start gap-3">
                            <span className="w-16 dark:text-gray-400 text-gray-700 shrink-0 md:text-end">
                              <HelpCircle
                                size={14}
                                className="inline-block text-yellow-600 relative -top-[1px]"
                              />{" "}
                              Option
                            </span>
                            <span className="text-gray-400">:</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-200 break-words">
                              {myOption.name}
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-3">
                            <span className="w-16 dark:text-gray-400 text-gray-700 shrink-0 md:text-end">
                              <DollarSign
                                size={14}
                                className="inline-block relative -top-[1px] text-green-600"
                              />{" "}
                              Price
                            </span>
                            <span className="text-gray-400">:</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                              ${(myOption.currentPrice || 0).toFixed(2)}
                            </span>
                          </div>

                          {/* Shares */}
                          <div className="flex items-center gap-3">
                            <span className="w-16 dark:text-gray-400 text-gray-700 shrink-0 md:text-end">
                              <ShareIcon className="w-4 h-4 inline-block relative -top-[1px] text-blue-400" />{" "}
                              Shares
                            </span>
                            <span className="text-gray-400">:</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                              {Number(myOption.shares || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT SIDE – POSITION */}
                      <div className="flex flex-col items-start sm:items-end justify-between">
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-wide dark:text-gray-400 text-gray-700">
                            Position
                          </p>
                          <p className="text-3xl font-bold text-emerald-400">
                            {currentValue.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* FOOTER – RESOLVES */}
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-[#111A22] flex items-center gap-2 text-xs">
                      <span className="dark:text-gray-400 text-gray-700">
                        Resolves
                      </span>
                      <span className="text-gray-400">:</span>
                      <span className="font-semibold text-gray-600 dark:text-gray-300">
                        <Clock className="w-3 h-3 text-gray-400 inline-block" />{" "}
                        {moment(position?.endDate).format("DD MMM YYYY")}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No active positions yet</p>
                <p className="text-gray-600 text-sm mt-2">
                  Start trading to see your positions here
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            No active positions yet.
          </div>
        )}
      </CustomTabPanel>

      {/* Portfolio */}

      {/* Top Categories */}
      <CustomTabPanel value={value} index={1}>
        <div className="grid grid-cols-2 sm:grid-cols-4 mt-4 gap-3  border-gray-800 pb-3">
          {[
            [
              "Invested",
              `$ ${Number(data?.portfolio?.investedAmount || 0).toFixed(2)}`,
              "dark:text-white text-yellow-600",
            ],
            [
              "Current Value",
              `$ ${Number(data?.portfolio?.currentValue || 0).toFixed(2)}`,
              "text-green-400",
            ],
            [
              "P/L",
              `$ ${Number(data?.portfolio?.totalPnL || 0).toFixed(2)}`,
              Number(data?.portfolio?.totalPnL) >= 0
                ? "text-green-400"
                : "text-red-400",
            ],
            [
              "Active Bets",
              Number(data?.stats?.activeMarkets || 0),
              "dark:text-white text-black",
            ],
          ].map(([label, val, color], i) => (
            <div
              key={i}
              className="dark:bg-[#1D293D] border border-gray-400 p-3 rounded-lg"
            >
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`text-lg font-semibold ${color}`}>{val}</p>
            </div>
          ))}
        </div>
      </CustomTabPanel>

      <CustomTabPanel value={value} index={2}>
        {myPost?.length > 0 ? (
          <PostList
            isIdea={true}
            allPosts={myPost}
            handleBookMarkOrUnBookMark={handleBookMarkOrUnBookMark}
            handleLikeUnlike={handleLikeUnlike}
            setAllPosts={null}
            isPaginationLoader={isPaginationLoader}
            handleLoginCheck={null}
            token=""
          />
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
              <FaRegCommentAlt className="text-2xl text-gray-500 dark:text-gray-400" />
            </div>

            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">
              Activity content here
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Be the first to share your thoughts and spark a conversation.
            </p>
          </div>
        )}
      </CustomTabPanel>
    </Box>
  );
}
