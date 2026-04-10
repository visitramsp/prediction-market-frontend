"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import toast from "react-hot-toast";
import { CircularProgress } from "@mui/material";
import InputTextArea from "../../../../common/InputTextArea";
import {
  getFeedForFollowingList,
  getMyAllPost,
  imageUpload,
  userPost,
} from "@/components/service/apiService/user";
import { PostFeeBack, SetPosts, TabPanelProps } from "@/utils/typesInterface";
import IdeaTabsTwo from "../IdeaTabsTwo/page";
import { CreatePostSkeleton } from "@/utils/customSkeleton";
import socket from "@/components/socket";
import {
  countWords,
  delay,
  MAX_WORDS,
  timeAgoCompact,
  truncateValue,
} from "@/utils/Content";
import { Activity, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { GrCloudUpload } from "react-icons/gr";
import GiphyModal from "@/components/Modal/GiphyModal";
import { useSelector } from "react-redux";

type HandleComment = (post: PostFeeBack) => void;

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface IdeaTabsProps {
  allPosts: PostFeeBack[];
  fetchPostList: () => void;
  setAllPosts: SetPosts;
  handleComment: HandleComment;
  isLoader: boolean;
  handleUserDetails: (id: string) => void;
  paginationLoader: boolean;
  setMainTabs: (id: number) => void;
}

export default function IdeaTabs({
  allPosts,
  fetchPostList,
  setAllPosts,
  handleComment,
  isLoader,
  handleUserDetails,
  paginationLoader = false,
  setMainTabs,
}: IdeaTabsProps) {
  const [value, setValue] = React.useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = React.useState<string | null>("");
  const [isPostLoader, setIsPostLoader] = React.useState<boolean>(false);
  const [liveTrades, setLiveTrades] = useState<any>([]);
  const [isImageUploadLoader, setIsImageUploadLoader] = useState(false);
  const [gif, setGif] = useState(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const [myFeedList, setMyFeedList] = useState([]);
  const [isLoaderMyFeed, setIsLoaderMyFeed] = useState(false);

  const userDetails = useSelector((state: any) => state?.user?.user);
  const [myPost, setMyPost] = React.useState<PostFeeBack[]>([]);
  const [currentTabs, setCurrentTabs] = useState(0);

  // pagination for the my feed start

  const [offset, setOffset] = useState(0);
  const [pagination, setPagination] = useState<any>({});
  const [emptyData, setEmptyData] = useState([]);
  const [isPaginationLoader, setIsPaginationLoader] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    handleResize(); // initial
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    currentTabs == 1 && setOffset(0);
  }, [currentTabs]);
  // pagination for the my feed end

  useEffect(() => {
    value == 0 && fetchPostList();
  }, [value]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    setMainTabs(newValue);
  };

  const getListOfPost = useCallback(async () => {
    setIsLoaderMyFeed(true);
    try {
      const [response] = await Promise.all([
        getFeedForFollowingList(),
        delay(1000),
      ]);
      if (response?.data?.length > 0) {
        setMyFeedList(response.data ?? []);
      } else {
        setMyFeedList([]);
      }
    } catch {
      setMyFeedList([]);
    } finally {
      setIsLoaderMyFeed(false);
    }
  }, [value]);

  useEffect(() => {
    getListOfPost();
  }, [getListOfPost]);

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

  const postUserMessage = async (keyType: string) => {
    setIsPostLoader(true);
    try {
      const payload = {
        postType: keyType,
        metadata: {
          content: message,
          images: gif == null ? [] : [gif],
        },
      };
      const [response] = await Promise.all([userPost(payload), delay(1000)]);

      if (response?.reponse?.status) {
        setMessage("");
        if (currentTabs == 1) {
          setMyPost((prev: any[]) => {
            const newPost = {
              ...response?.reponse,
              User: {
                id: userDetails?.id,
                image_url: userDetails?.imageUrl,
                username: userDetails?.username,
              },
            };

            return [newPost, ...prev];
          });
        } else if (value == 0) {
          setAllPosts((prev: any[]) => {
            const newPost = {
              ...response?.reponse,
              User: {
                id: userDetails?.id,
                image_url: userDetails?.imageUrl,
                username: userDetails?.username,
              },
            };

            return [newPost, ...prev];
          });
        } else {
          setMyFeedList((prev: any[]) => {
            const newPost = {
              ...response?.reponse,
              User: {
                id: userDetails?.id,
                image_url: userDetails?.imageUrl,
                username: userDetails?.username,
              },
            };

            return [newPost, ...prev];
          });
        }
        setGif(null);
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
      setIsPostLoader(false);
    }
  };

  useEffect(() => {
    socket.emit("subscribeLiveTrade");
    const handleTradeLive = (payload: any) => {
      setLiveTrades((prev: any[]) => [payload, ...prev]);
    };
    socket.on("tradeLive", handleTradeLive);
    return () => {
      socket.emit("unsubscribeLiveTrade");
      socket.off("tradeLive", handleTradeLive);
    };
  }, []);

  const goToQuestionDetails = (id: string) => {
    router.push(`/markets/${id}`);
  };

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

  const fetchMyAllPost = async (newOffset = offset) => {
    setIsPaginationLoader(true);

    try {
      const [response] = await Promise.all([
        getMyAllPost("", 10, newOffset),
        delay(500),
      ]);

      const newItem = response?.feed?.posts ?? [];
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
  };
  React.useEffect(() => {
    if (currentTabs == 1) {
      setEmptyData([]);
      fetchMyAllPost(0);
    }
  }, [currentTabs]);

  useEffect(() => {
    if (currentTabs != 1) {
      return;
    }
    if (value == 1 && emptyData?.length === 0) {
      return;
    }
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= fullHeight - (width > 500 ? 200 : 1000)) {
        if (!isLoader && pagination?.limit) {
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
  }, [pagination?.offset, pagination?.limit, isLoader, offset]);

  return (
    <Box
      style={{ position: "relative", zIndex: "10" }}
      sx={{ width: "100%", position: "relative" }}
      className="md:border-r md:border-[#d0d0d3] md:dark:border-[#364153]"
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
          <Tab label="Ideas" {...a11yProps(0)} />
          <Tab label="Feed" {...a11yProps(2)} />
          <Tab label="Live Trades" {...a11yProps(1)} />
          {/* <Tab label="Market Builder" {...a11yProps(2)} /> */}
        </Tabs>
      </Box>

      <CustomTabPanel value={value} index={0}>
        <div className="">
          {isLoader ? (
            <CreatePostSkeleton />
          ) : (
            <div>
              <div className="flex items-start gap-4 w-full px-4 mt-0">
                {/* <div className="border border-gray-200 dark:border-gray-700 rounded-xl px-1">
                  <Image
                    src={userDetails?.imageUrl || "/img/user.png"}
                    alt="user"
                    width={60}
                    height={60}
                    className="rounded-md mt-1"
                  />
                </div> */}

                <InputTextArea
                  message={message || ""}
                  setMessage={setMessage}
                  image={gif || ""}
                  onRemoveImage={() => setGif("")}
                />
              </div>

              <div className=" flex flex-row pl-7 justify-between items-center">
                <div></div>

                <div className="flex items-center justify-end gap-8 mr-7">
                  <div className="right-3 text-xs text-gray-600 dark:text-gray-700">
                    {countWords(message)} / {MAX_WORDS} words
                  </div>
                  <div
                    ref={wrapperRef}
                    className={`relative inline-block ${gif ? "" : "group"} `}
                  >
                    <button
                      disabled={gif || isImageUploadLoader ? true : false}
                      type="button"
                      onClick={() => setShowUploadMenu((prev) => !prev)}
                      className={`text-sm relative font-medium ${gif || isImageUploadLoader ? "text-gray-400 dark:text-gray-700" : "text-gray-500 cursor-pointer  hover:text-[#d2b8fa]"}  
                    `}
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
                  <button
                    disabled={gif && String(message).trim().length <= 2}
                    onClick={() => postUserMessage("PUBLIC")}
                    className={`
                        py-1.5 px-4 w-16 flex items-center justify-center rounded-md
                        text-sm font-semibold
                        transition-all duration-200
                        ${
                          gif || String(message).trim().length > 2
                            ? `
                              bg-emerald-500
                              text-black
                              hover:bg-emerald-600
                              active:scale-95
                              cursor-pointer
                              shadow-[0_4px_14px_rgba(34,197,94,0.45)]
                            `
                            : `
                              bg-gray-300
                              text-gray-500
                              border border-gray-400 dark:bg-gray-600 dark:border-gray-700
                              cursor-not-allowed
                              shadow-none
                            `
                        }
                      `}
                  >
                    {isPostLoader ? (
                      <CircularProgress
                        size={18}
                        className="!text-white dark:!text-white"
                      />
                    ) : (
                      "Post"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="border-t  dark:border-gray-700 border-gray-200 mt-3">
            <IdeaTabsTwo
              handleComment={handleComment}
              postedList={allPosts}
              setAllPosts={setAllPosts}
              isBookMark={false}
              loader={isLoader}
              handleUserDetails={handleUserDetails}
              isYourPost={false}
              setCurrentTabs={setCurrentTabs}
              myPost={[]}
              setMyPost={() => null}
              paginationLoader={paginationLoader}
            />
          </div>
        </div>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        {liveTrades?.length > 0 ? (
          liveTrades?.map((row: any, index: number) => (
            <div
              key={index}
              className="p-3 border-b dark:border-gray-700 border-gray-200"
            >
              <div className="flex justify-between">
                <div className="md:flex justify-start gap-4">
                  <div>
                    {" "}
                    <Image
                      src={row?.imageUrl || "/img/user.png"}
                      alt="user"
                      width={70}
                      height={70}
                      className="rounded-md mt-1"
                    />
                  </div>
                  <div>
                    <p className="dark:text-gray-400 text-gray-800 text-sm">
                      {row?.username || "unknown"}
                    </p>
                    <p className="text-md mt-4">
                      <>
                        <span className="cursor-pointer text-[#c8aa76]">
                          {row?.option?.optionContent}:{" "}
                          <span
                            onClick={() =>
                              goToQuestionDetails(row?.question?.id)
                            }
                            className="dark:text-gray-200 hover:underline text-gray-800"
                          >
                            {row?.question?.question || "--"}
                          </span>{" "}
                        </span>
                      </>
                    </p>
                    <p className="text-sm dark:text-gray-500 text-gray-600">
                      ${truncateValue(row?.question?.liquidity || 0)}
                    </p>
                  </div>
                </div>
                <div className="dark:text-gray-500 text-gray-400 text-sm">
                  {timeAgoCompact(row?.ts)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
              <Activity className="text-3xl text-gray-500 dark:text-gray-400" />
            </div>

            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">
              No Live Trades Yet
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Trades will appear here as soon as market activity begins. Stay
              tuned for real-time updates.
            </p>
          </div>
        )}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <div className="">
          {isLoader ? (
            <CreatePostSkeleton />
          ) : (
            <div>
              <div className="flex items-start gap-4 w-full px-4">
                {/* <div className="border border-gray-200 dark:border-gray-700 rounded-xl px-1">
                  <Image
                    src={userDetails?.imageUrl || "/img/user.png"}
                    alt="user"
                    width={60}
                    height={60}
                    className="rounded-md mt-1"
                  />
                </div> */}

                <InputTextArea
                  message={message || ""}
                  setMessage={setMessage}
                  image={gif || ""}
                  onRemoveImage={() => setGif("")}
                />
              </div>

              <div className=" flex flex-row pl-7 justify-between items-center">
                <div></div>

                <div className="flex items-center justify-end gap-8 mr-7">
                  <div className="right-3 text-xs text-gray-600 dark:text-gray-700">
                    {countWords(message)} / {MAX_WORDS} words
                  </div>
                  <div
                    ref={wrapperRef}
                    className={`relative inline-block ${gif ? "" : "group"} `}
                  >
                    <button
                      disabled={gif || isImageUploadLoader ? true : false}
                      type="button"
                      onClick={() => setShowUploadMenu((prev) => !prev)}
                      className={`text-sm relative font-medium ${gif || isImageUploadLoader ? "text-gray-400 dark:text-gray-700" : "text-gray-500 cursor-pointer  hover:text-[#d2b8fa]"}  
                    `}
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
                  <button
                    disabled={gif && String(message).trim().length <= 3}
                    onClick={() => postUserMessage("PRIVATE")}
                    className={`
                        py-1.5 px-4 w-16 flex items-center justify-center rounded-md
                        text-sm font-semibold
                        transition-all duration-200
                        ${
                          gif || String(message).trim().length > 3
                            ? `
                              bg-emerald-500
                              text-black
                              hover:bg-emerald-600
                              active:scale-95
                              cursor-pointer
                              shadow-[0_4px_14px_rgba(34,197,94,0.45)]
                            `
                            : `
                              bg-gray-300
                              text-gray-500
                              border border-gray-400 dark:bg-gray-600 dark:border-gray-700
                              cursor-not-allowed
                              shadow-none
                            `
                        }
                      `}
                  >
                    {isPostLoader ? (
                      <CircularProgress
                        size={18}
                        className="!text-white dark:!text-white"
                      />
                    ) : (
                      "Post"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="border-t dark:border-gray-700 border-gray-200 mt-3">
            <IdeaTabsTwo
              handleComment={handleComment}
              postedList={myFeedList}
              setAllPosts={setMyFeedList}
              isBookMark={false}
              loader={isLoaderMyFeed}
              handleUserDetails={handleUserDetails}
              isYourPost={true}
              setCurrentTabs={setCurrentTabs}
              myPost={myPost}
              setMyPost={setMyPost}
              paginationLoader={isPaginationLoader}
            />
          </div>
        </div>
      </CustomTabPanel>
      <GiphyModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={setGif}
      />
    </Box>
  );
}
