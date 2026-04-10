import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Image from "next/image";
import { LuUpload } from "react-icons/lu";
import {
  FaRegCommentAlt,
  FaRegBookmark,
  FaRegHeart,
  FaBookmark,
} from "react-icons/fa";
import { HighlightTexts, isGifImage, timeAgoCompact } from "@/utils/Content";
import { FcLike } from "react-icons/fc";
import toast from "react-hot-toast";
import { PostFeeBack, SetPosts } from "@/utils/typesInterface";
import {
  getMyAllPost,
  postBookmarkOrUnBookMark,
  postLikeOrUnlike,
  userPositions,
} from "@/components/service/apiService/user";
import { PostLoaderSkeleton, PostSkeleton } from "@/utils/customSkeleton";
import { Position } from "@/components/Pages/userProfile/proTabs/page";
import ViewImage from "@/components/common/ViewImage";
import { CircularProgress } from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

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
type HandleComment = (post: PostFeeBack) => void;
// const [currentTabs, setCurrentTabs] = useState(0);

const isGif = (url = "") => url.includes("giphy") || /\.gif($|\?)/i.test(url);
export default function IdeaTabsTwo({
  postedList,
  setAllPosts,
  handleComment,
  isBookMark = false,
  loader = false,
  handleUserDetails,
  isYourPost,
  setCurrentTabs,
  setMyPost,
  myPost,
  paginationLoader = false,
}: {
  postedList: PostFeeBack[];
  setAllPosts: SetPosts;
  handleComment: HandleComment;
  isBookMark: boolean;
  loader: boolean;
  handleUserDetails: (id: string) => void;
  isYourPost: boolean;
  setCurrentTabs: (id: number) => void;
  setMyPost: SetPosts;
  myPost: PostFeeBack[];
  paginationLoader: boolean;
}) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setCurrentTabs(newValue);
  };

  const handleLikeUnlike = async (id: number, isLike: number) => {
    try {
      if (isLike == 1) {
        toast.success("Unlike");
      } else {
        toast.success("like");
      }
      if (value == 1) {
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
      } else {
        setAllPosts((prev) =>
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
      }

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

  const handleBookMarkOrUnBookMark = async (
    id: number,
    isBookmarked: number,
  ) => {
    try {
      if (value == 1) {
        setMyPost((prev) => {
          if (isBookMark === true) {
            return prev.filter((item) => item.id !== id);
          } else {
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
          }
        });
      } else {
        setAllPosts((prev) => {
          if (isBookMark === true) {
            return prev.filter((item) => item.id !== id);
          } else {
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
          }
        });
      }

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

  const locationUrl = window.location?.pathname;

  return (
    <>
      <Box
        style={{ position: "relative", zIndex: "10" }}
        sx={{ width: "100%", position: "relative" }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "var(--color-borderdark)",
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="time filter tabs"
            sx={{
              "& .MuiTab-root": {
                color: "#80899b",
                textTransform: "none",
                fontWeight: 500,
              },
              "& .Mui-selected": {
                color: "#8160ee",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#8160ee",
              },
            }}
          >
            <Tab label="Now" {...a11yProps(0)} />
            {locationUrl != "/ideas/bookmark/" && isYourPost && (
              <Tab label="Your Post" {...a11yProps(1)} />
            )}
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <div className="p-3 border-b  dark:border-gray-700 border-gray-200">
            {loader ? (
              <PostSkeleton />
            ) : postedList?.length > 0 ? (
              postedList?.map((row: PostFeeBack, index: number) => {
                const contentForPost = (() => {
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

                const imageUrl = contentForPost?.images?.[0];
                return (
                  <div
                    key={row?.id}
                    className={`md:flex ${
                      index > 0 &&
                      "pt-4 border-t border-gray-200 dark:border-gray-700"
                    }  border-gray-300 pb-2 items-start sm:gap-2 w-full md:px-4 px-0`}
                  >
                    <div className=" flex items-center gap-2  rounded  w-fit">
                      <div className="bg-gray-100 h-10 w-10 rounded-full dark:bg-gray-600 p-0.5">
                        <Image
                          onClick={() => handleUserDetails(`${row?.User?.id}`)}
                          src={
                            row?.User?.image_url ||
                            "https://cdn.vectorstock.com/i/500p/98/17/gray-man-placeholder-portrait-vector-23519817.jpg"
                          }
                          alt="user"
                          width={50}
                          height={50}
                          className="rounded-full h-9 w-9   cursor-pointer"
                        />
                      </div>
                      <div className="sm:hidden block">
                        <div className="flex flex-row items-center gap-2">
                          <div
                            onClick={() =>
                              handleUserDetails(`${row?.User?.id}`)
                            }
                            className="dark:text-gray-300  cursor-pointer hover:underline font-semibold text-gray-700"
                          >
                            {row?.User?.username || "Unknown"}
                          </div>{" "}
                          <span className="text-xs dark:text-gray-500 text-gray-500">
                            {timeAgoCompact(row?.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="hidden sm:block">
                        <div className="flex flex-row items-center gap-2">
                          <div
                            onClick={() =>
                              handleUserDetails(`${row?.User?.id}`)
                            }
                            className="dark:text-gray-300  cursor-pointer hover:underline font-semibold text-gray-700"
                          >
                            {row?.User?.username || "Unknown"}
                          </div>{" "}
                          <span className="text-xs dark:text-gray-500 text-gray-500">
                            {timeAgoCompact(row?.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-md mt-2 dark:text-gray-400 text-gray-800">
                        {contentForPost?.content && (
                          <HighlightTexts
                            key={index}
                            text={contentForPost?.content}
                          />
                        )}
                        <br />

                        {imageUrl && <ViewImage imageUrl={imageUrl} />}
                      </p>

                      <div className="mt-4">
                        <div className="flex justify-between">
                          <div className="flex gap-3 items-center">
                            <span
                              className="
                              p-2
                              rounded
                              inline-block
                              text-gray-500
                              dark:text-gray-400
                              hover:bg-gray-400/30
                              transition-all
                              duration-200
                              ease-in-out text-lg cursor-pointer
                            "
                            >
                              <FaRegCommentAlt
                                onClick={() => handleComment(row)}
                              />
                            </span>
                            <span className="inline-block relative -left-3 font-light text-gray-400">
                              {row?.commentCount || 0}
                            </span>

                            <div
                              className="
                                p-2
                                rounded
                                inline-block
                                text-gray-500
                                dark:text-gray-400
                                hover:bg-gray-400/30
                                transition-all
                                duration-200
                                ease-in-out text-xl cursor-pointer
                              "
                              onClick={() =>
                                handleLikeUnlike(row?.id, row?.isLiked)
                              }
                            >
                              {/* FcLike  */}
                              {row?.isLiked == 1 ? <FcLike /> : <FaRegHeart />}
                            </div>
                            <span className="inline-block relative -left-3 font-light text-gray-400">
                              {row?.likeCount || 0}
                            </span>
                            <span
                              className="
                              p-2
                              rounded
                              inline-block
                              text-gray-500
                              dark:text-gray-400
                              hover:bg-gray-400/30
                              transition-all
                              duration-200
                              ease-in-out text-lg cursor-pointer
                            "
                              onClick={() =>
                                handleBookMarkOrUnBookMark(
                                  row?.id,
                                  row?.isBookmarked,
                                )
                              }
                            >
                              {row?.isBookmarked == 1 ? (
                                <FaBookmark className="text-[#156bf7]" />
                              ) : (
                                <FaRegBookmark />
                              )}
                            </span>
                            <span className="inline-block relative -left-3 font-light text-gray-400"></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                  <FaRegCommentAlt className="text-2xl text-gray-500 dark:text-gray-400" />
                </div>

                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">
                  No Post yet
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                  Be the first to share your thoughts and spark a conversation.
                </p>
              </div>
            )}
            <div className="text-center mx-auto">
              {paginationLoader && (
                <>
                  <PostLoaderSkeleton />
                </>
              )}
            </div>
          </div>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <div className="p-3 border-b  dark:border-gray-700 border-gray-200">
            {loader ? (
              <PostSkeleton />
            ) : myPost?.length > 0 ? (
              myPost?.map((row: any, index: number) => {
                const contentForPost = (() => {
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

                const imageUrl = contentForPost?.images?.[0];

                return (
                  <div
                    key={row?.id}
                    className={`md:flex ${
                      index > 0 &&
                      "pt-4 border-t border-gray-200 dark:border-gray-700"
                    }  border-gray-300 pb-2 items-start sm:gap-2 w-full md:px-4 px-0`}
                  >
                    <div className=" flex items-center gap-2   rounded  w-fit">
                      <div className="bg-gray-100 h-10 w-10 rounded-full dark:bg-gray-600 p-0.5">
                        <Image
                          onClick={() => handleUserDetails(`${row?.User?.id}`)}
                          src={
                            row?.User?.image_url ||
                            "https://cdn.vectorstock.com/i/500p/98/17/gray-man-placeholder-portrait-vector-23519817.jpg"
                          }
                          alt="user"
                          width={50}
                          height={50}
                          className="rounded-full h-9 w-9   cursor-pointer"
                        />
                      </div>
                      <div className="sm:hidden block">
                        <div className="flex flex-row items-center gap-2">
                          <div
                            onClick={() =>
                              handleUserDetails(`${row?.User?.id}`)
                            }
                            className="dark:text-gray-300  cursor-pointer hover:underline font-semibold text-gray-700"
                          >
                            {row?.User?.username || "Unknown"}
                          </div>{" "}
                          <span className="text-xs dark:text-gray-500 text-gray-500">
                            {timeAgoCompact(row?.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="">
                      <div className="hidden   sm:block">
                        <div className="flex flex-row items-center gap-2">
                          <div
                            onClick={() =>
                              handleUserDetails(`${row?.User?.id}`)
                            }
                            className="dark:text-gray-300  cursor-pointer hover:underline font-semibold text-gray-700"
                          >
                            {row?.User?.username || "Unknown"}
                          </div>{" "}
                          <span className="text-xs dark:text-gray-500 text-gray-500">
                            {timeAgoCompact(row?.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-md mt-2 dark:text-gray-400 text-gray-800">
                        {contentForPost?.content && (
                          <HighlightTexts
                            key={index}
                            text={contentForPost?.content}
                          />
                        )}
                        <br />

                        {imageUrl && <ViewImage imageUrl={imageUrl} />}
                      </p>

                      <div className="mt-4">
                        <div className="flex justify-between">
                          <div className="flex gap-3 items-center">
                            <span
                              className="
                              p-2
                              rounded
                              inline-block
                              text-gray-500
                              dark:text-gray-400
                              hover:bg-gray-400/30
                              transition-all
                              duration-200
                              ease-in-out text-lg cursor-pointer
                            "
                            >
                              <FaRegCommentAlt
                                onClick={() => handleComment(row)}
                              />
                            </span>
                            <span className="inline-block relative -left-3 font-light text-gray-400">
                              {row?.commentCount || 0}
                            </span>

                            <div
                              className="
                                p-2
                                rounded
                                inline-block
                                text-gray-500
                                dark:text-gray-400
                                hover:bg-gray-400/30
                                transition-all
                                duration-200
                                ease-in-out text-xl cursor-pointer
                              "
                              onClick={() =>
                                handleLikeUnlike(row?.id, row?.isLiked)
                              }
                            >
                              {/* FcLike  */}
                              {row?.isLiked == 1 ? <FcLike /> : <FaRegHeart />}
                            </div>
                            <span className="inline-block relative -left-3 font-light text-gray-400">
                              {row?.likeCount || 0}
                            </span>
                            <span
                              className="
                              p-2
                              rounded
                              inline-block
                              text-gray-500
                              dark:text-gray-400
                              hover:bg-gray-400/30
                              transition-all
                              duration-200
                              ease-in-out text-lg cursor-pointer
                            "
                              onClick={() =>
                                handleBookMarkOrUnBookMark(
                                  row?.id,
                                  row?.isBookmarked,
                                )
                              }
                            >
                              {row?.isBookmarked == 1 ? (
                                <FaBookmark className="text-[#156bf7]" />
                              ) : (
                                <FaRegBookmark />
                              )}
                            </span>
                            <span className="inline-block relative -left-3 font-light text-gray-400"></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                  <FaRegCommentAlt className="text-2xl text-gray-500 dark:text-gray-400" />
                </div>

                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">
                  No Post yet
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                  Be the first to share your thoughts and spark a conversation.
                </p>
              </div>
            )}
            <div className="text-center mx-auto">
              {paginationLoader && (
                <>
                  <PostLoaderSkeleton />
                </>
              )}
            </div>
          </div>
        </CustomTabPanel>
      </Box>
    </>
  );
}
