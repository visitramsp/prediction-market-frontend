import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Gift } from "lucide-react";
import { PostFeeBack, userIdInterFace } from "@/utils/typesInterface";
import {
  getFeed,
  getMyAllPost,
  imageUpload,
  postBookmarkOrUnBookMark,
  postLikeOrUnlike,
  userPost,
} from "@/components/service/apiService/user";
import toast from "react-hot-toast";
import InputTextArea from "../../../common/InputTextArea";
import { CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { countWords, delay, MAX_WORDS } from "@/utils/Content";
import { FaRegCommentAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import PostList from "./postList";
import GiphyModal from "../../../Modal/GiphyModal";
import { GrCloudUpload } from "react-icons/gr";

export default function IdeasActivityTabs({
  marketId,
  handleLoginCheck,
  token,
}) {
  const [activeTab, setActiveTab] = useState("ideas");
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = React.useState<string | null>("");
  const [isPostLoader, setIsPostLoader] = React.useState<boolean>(false);
  const [allPosts, setAllPosts] = useState<PostFeeBack[]>([]);
  const [isImageUploadLoader, setIsImageUploadLoader] = useState(false);
  const [gif, setGif] = useState(null);
  const [myPost, setMyPost] = useState<PostFeeBack[]>([]);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);

  // pagination pending start
  const [offset, setOffset] = useState(0);
  const [pagination, setPagination] = useState<any>({});
  const [emptyData, setEmptyData] = useState([]);
  const [isPaginationLoader, setIsPaginationLoader] = useState(false);
  // pagination pending end

  const router = useRouter();
  const userId = useSelector((state: userIdInterFace) => state.user.user?.id);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowUploadMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const getListOfPost = async (newOffset = 0) => {
    setIsPaginationLoader(true);

    try {
      const [response] = await Promise.all([
        getFeed(marketId, 10, newOffset),
        delay(1000),
      ]);
      setPagination(response.data ?? {});
      const newData = response?.data?.posts || [];
      setEmptyData(newData);
      if (response?.success) {
        setAllPosts((prev: any[]) => {
          if (newOffset === 0) return newData;

          const map = new Map();
          prev.forEach((item) => map.set(item.id, item));
          newData.forEach((item) => map.set(item.id, item));

          return Array.from(map.values());
        });
      } else {
        if (newOffset === 0) setAllPosts([]);
      }
    } catch {
      if (newOffset === 0) setAllPosts([]);
    } finally {
      setIsPaginationLoader(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    getListOfPost(0);
  }, [userId]);

  const handleChangePage = () => {
    if (emptyData?.length === 0) return;
    const newOffset = (pagination?.offset || 0) + (pagination?.limit || 12);
    if (newOffset > offset) {
      setOffset(newOffset);
      getListOfPost(newOffset);
    }
  };

  const chooseImages = async (file: File) => {
    setShowUploadMenu(false);
    setIsImageUploadLoader(true);

    try {
      const formData = new FormData();
      formData.append("images", file);
      const [response] = await Promise.all([
        imageUpload(formData),
        delay(1000),
      ]);
      if (response?.success) {
        setGif(response?.data?.[0]?.url);
      } else {
        toast.error(response?.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsImageUploadLoader(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    chooseImages(file);
  };
  const postUserMessage = async () => {
    setIsPostLoader(true);
    try {
      const payload = {
        questionId: Number(marketId),
        postType: "PUBLIC",
        metadata: {
          content: message,
          images: gif == null ? [] : [gif],
        },
      };
      const [response] = await Promise.all([userPost(payload), delay(1000)]);

      getListOfPost();
      if (response?.reponse?.status) {
        setMessage("");
        setGif(null);
        setIsPostLoader(false);
      } else {
        toast.error(response?.reponse?.status);

        setMessage("");
        setGif(null);
        setIsPostLoader(false);
      }
    } catch (error: unknown) {
      setIsPostLoader(false);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const handleLikeUnlike = async (
    id: number,
    isLike: number,
    isIdeas = Boolean,
  ) => {
    try {
      if (isLike == 1) {
        toast.success("Unlike");
      } else {
        toast.success("like");
      }
      if (!isIdeas) {
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
      } else {
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
    isIdeas = Boolean,
  ) => {
    try {
      if (!isIdeas) {
        setAllPosts((prev) => {
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
      } else {
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

  const fetchMyAllPost = async () => {
    try {
      const response = await getMyAllPost(marketId);
      if (response.feed?.length > 0) {
        setMyPost(response?.feed);
      } else {
        setMyPost([]);
      }
    } catch {
      setMyPost([]);
    }
    // getMyAllPost
  };
  useEffect(() => {
    activeTab == "activity" && fetchMyAllPost();
  }, [activeTab]);
  const handleRedirectAllPost = () => {
    router.push("/ideas");
  };

  const hasText = String(message).trim().length > 1;
  const hasGif = !!gif;

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="border-b border-[var(--color-borderlight)] dark:border-[var(--color-borderdark)]">
        <div className="flex items-center justify-between py-3">
          {/* Tabs */}
          <div className="flex items-center gap-6 text-lg font-medium">
            <button
              onClick={() =>
                token ? setActiveTab("ideas") : handleLoginCheck()
              }
              className={`pb-1 ${
                activeTab === "ideas"
                  ? "dark:text-white text-black border-b-2 dark:border-white/60 border-black"
                  : "text-gray-400 cursor-pointer text-lg"
              }`}
            >
              Ideas
            </button>

            <button
              onClick={() =>
                token ? setActiveTab("activity") : handleLoginCheck()
              }
              className={`pb-1 ${
                activeTab === "activity"
                  ? "dark:text-white text-black border-b-2 dark:border-white/60 border-black"
                  : "text-gray-400 cursor-pointer text-lg"
              }`}
            >
              Activity
            </button>
          </div>

          {/* Right Controls */}
          <div>
            {/* {activeTab === "ideas" && (
              <div className="flex items-center gap-2">
                <button
                  className=" flex items-center gap-2
      relative cursor-pointer
      px-4 pt-2 pb-1 rounded-full
      bg-gray-100 dark:bg-gray-500 dark:text-gray-200 text-gray-700 text-sm font-medium

      shadow-[0_4px_0_rgb(209,213,219)]
      transition-all duration-150 ease-in-out

      hover:bg-gray-200 dark:hover:bg-gray-600
      active:translate-y-[3px]
      active:shadow-[0_1px_0_rgb(209,213,219)]
       dark:shadow-[0_4px_0_rgb(17,24,39)]
       dark:active:shadow-[0_1px_0_rgb(17,24,39)]

    "
                >
                  All
                  <ChevronDown
                    size={16}
                    className={`transition-transform -rotate-90 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            )} */}

            {/* {activeTab === "activity" && ( */}
            <div className="relative">
              <button
                onClick={() =>
                  token ? handleRedirectAllPost() : handleLoginCheck()
                }
                className=" flex items-center gap-2
      relative cursor-pointer
      px-4 pt-1.5 pb-1.5 rounded-full
      bg-gray-100 dark:bg-gray-500 dark:text-gray-200 text-gray-700 text-sm font-medium

      shadow-[0_4px_0_rgb(209,213,219)]
      transition-all duration-150 ease-in-out

      hover:bg-gray-200 dark:hover:bg-gray-600
      active:translate-y-[3px]
      active:shadow-[0_1px_0_rgb(209,213,219)]
       dark:shadow-[0_4px_0_rgb(17,24,39)]
       dark:active:shadow-[0_1px_0_rgb(17,24,39)]

    "
              >
                All
                <ChevronDown
                  size={16}
                  className={`transition-transform -rotate-90 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
            {/* )} */}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === "ideas" && (
          <>
            <div className="border border-[var(--color-borderlight)] dark:border-[var(--color-borderdark)] rounded-2xl pb-3">
              <div className="flex items-start gap-4 w-full px-4 mt-1">
                <InputTextArea
                  message={message || ""}
                  setMessage={setMessage}
                  image={gif || ""}
                  onRemoveImage={() => setGif("")}
                />
              </div>

              <div className=" flex flex-row pl-7 justify-between items-center">
                <div className="flex justify-between w-full items-center  gap-4 mr-7">
                  <div className="flex flex-row items-center gap-4">
                    <div
                      ref={wrapperRef}
                      className={`relative inline-block ${gif ? "" : "group"} `}
                    >
                      <button
                        disabled={gif || isImageUploadLoader ? true : false}
                        type="button"
                        onClick={() =>
                          token
                            ? setShowUploadMenu((prev) => !prev)
                            : handleLoginCheck()
                        }
                        className={`text-sm relative font-medium ${gif || isImageUploadLoader ? "text-gray-400 dark:text-gray-700" : "text-gray-500 cursor-pointer hover:text-[#d2b8fa]"}`}
                      >
                        {isImageUploadLoader && (
                          <div className="absolute left-3 flex items-center justify-center">
                            <CircularProgress
                              className="!text-gray-400 dark:!text-white/50"
                              size={25}
                            />
                          </div>
                        )}
                        UPLOAD
                      </button>
                      <div
                        className={`
                  absolute -left-8 mt-2 w-32
                  rounded-xl bg-white dark:bg-[#0F172A]
                  shadow-xl border border-gray-200 dark:border-gray-700
                  transition-all duration-200 z-50
                  ${
                    showUploadMenu
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible translate-y-2"
                  }
                `}
                      >
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-b border-gray-200 dark:border-gray-600 flex cursor-pointer items-center gap-2 text-left px-4 py-2 text-sm
                     text-gray-700 dark:text-gray-200
                     hover:bg-gray-100 dark:hover:bg-gray-800
                     rounded-t-xl"
                        >
                          <GrCloudUpload className="text-sky-500" /> Image
                        </button>

                        <button
                          onClick={() => setOpen(true)}
                          className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm
                     text-gray-700 dark:text-gray-200
                     hover:bg-gray-100 dark:hover:bg-gray-800
                     rounded-b-xl"
                        >
                          <Gift size={18} className="!text-[#8160EE]" /> GIF
                        </button>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                      />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="flex flex-row items-center gap-8">
                    <div className="right-3 text-xs text-gray-600 dark:text-gray-700">
                      {countWords(message)} / {MAX_WORDS} words
                    </div>
                    <button
                      disabled={!hasText && !hasGif}
                      onClick={() =>
                        token ? postUserMessage() : handleLoginCheck()
                      }
                      className={`
    py-1.5 px-4 w-16 flex items-center justify-center rounded-md
    text-sm font-semibold
    transition-all duration-200
    ${
      !hasText && !hasGif
        ? `
          bg-gray-300
          text-gray-500
          border border-gray-400 dark:bg-gray-600 dark:border-gray-700
          cursor-not-allowed
          shadow-none
        `
        : `
          bg-emerald-500
          text-black
          hover:bg-emerald-600
          active:scale-95
          cursor-pointer
          shadow-[0_4px_14px_rgba(34,197,94,0.45)]
        `
    }
  `}
                    >
                      {isPostLoader ? (
                        <CircularProgress size={22} className="!text-white " />
                      ) : (
                        "Post"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Extra content after PredictionBox */}
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {allPosts?.length > 0 ? (
                <PostList
                  isIdea={false}
                  allPosts={allPosts}
                  handleBookMarkOrUnBookMark={handleBookMarkOrUnBookMark}
                  handleLikeUnlike={handleLikeUnlike}
                  setAllPosts={setAllPosts}
                  isPaginationLoader={false}
                  handleLoginCheck={handleLoginCheck}
                  token={token}
                />
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                    <FaRegCommentAlt className="text-2xl text-gray-500 dark:text-gray-400" />
                  </div>

                  <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">
                    No Post yet
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    Be the first to share your thoughts and spark a
                    conversation.
                  </p>
                </div>
              )}
            </div>

            {isPaginationLoader && (
              <div className="flex items-center justify-center pt-5">
                <CircularProgress
                  size={30}
                  className="!text-gray-500 dark:!text-gray-300 "
                />
              </div>
            )}

            {!isPaginationLoader && emptyData?.length > 9 && (
              <div
                onClick={() => handleChangePage()}
                className="text-end mt-2 text-sm dark:text-gray-400 cursor-pointer"
              >
                show more...
              </div>
            )}
          </>
        )}

        {activeTab === "activity" && (
          <div className="text-gray-500 text-sm">
            {myPost?.length > 0 ? (
              <PostList
                isIdea={true}
                allPosts={myPost}
                handleBookMarkOrUnBookMark={handleBookMarkOrUnBookMark}
                handleLikeUnlike={handleLikeUnlike}
                setAllPosts={setAllPosts}
                isPaginationLoader={false}
                handleLoginCheck={handleLoginCheck}
                token={token}
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
          </div>
        )}
      </div>
      <GiphyModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={setGif}
      />
    </div>
  );
}
