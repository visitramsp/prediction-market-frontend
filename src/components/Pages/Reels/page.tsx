"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ReelItem, LinkedQuestion, RootState } from "@/utils/typesInterface";

import {
  setReels,
  appendReels,
  setHasMore,
  setPage,
  setLoading,
  setCurrentIndex,
  updateReelLike,
  updateReelBookmark,
} from "@/components/store/slice/reels";
import ReelCard from "./ReelCard";
import CommentsDrawer from "./CommentsDrawer";
import CreateReelModal from "./CreateReelModal";
import {
  FaPlus,
  FaVideo,
  FaHeart,
  FaRegHeart,
  FaComment,
  FaBookmark,
  FaRegBookmark,
  FaShare,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";
import { MdQuiz } from "react-icons/md";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  getReelsFeed,
  toggleReelBookmark,
  toggleReelLike,
} from "@/components/service/apiService/reels";
import { questionDetails } from "@/components/service/apiService/category";
import BuySell from "@/components/Modal/BuySell/page";
import Authentication from "@/components/Pages/auth";

const ReelsPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const getActiveContainer = () => {
    const d = desktopContainerRef.current;
    if (d && d.offsetHeight > 0) return d;
    return mobileContainerRef.current;
  };

  const { reels, hasMore, page, isLoading, currentIndex } = useSelector(
    (state: {
      reels: {
        reels: ReelItem[];
        hasMore: boolean;
        page: number;
        isLoading: boolean;
        currentIndex: number;
      };
    }) => state.reels,
  );
  const isAuth = useSelector(
    (state: RootState) =>
      !!(state as Record<string, unknown> & { user: { isAuth: boolean } })?.user
        ?.isAuth,
  );

  const [isMuted, setIsMuted] = useState(true);
  const [commentsReelId, setCommentsReelId] = useState<number | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [likeBounce, setLikeBounce] = useState(false);
  const [marketOptions, setMarketOptions] = useState<
    { id: number; name: string; price: number }[]
  >([]);

  // Buy/sell state
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );
  const [buySellOpen, setBuySellOpen] = useState(false);
  const [buySellOrderType, setBuySellOrderType] = useState<string>("buy");
  const [loginOpen, setLoginOpen] = useState(false);

  const currentReel: ReelItem | undefined = reels[currentIndex];

  // Fetch feed
  const fetchFeed = useCallback(
    async (p: number, reset = false) => {
      dispatch(setLoading(true));
      const res = await getReelsFeed(p, 10);
      if (res?.success) {
        if (reset) {
          dispatch(setReels(res.data.reels));
        } else {
          dispatch(appendReels(res.data.reels));
        }
        dispatch(setHasMore(res.data.hasMore));
      }
      dispatch(setLoading(false));
    },
    [dispatch],
  );

  useEffect(() => {
    fetchFeed(1, true);
    dispatch(setPage(1));
  }, [fetchFeed, dispatch]);

  useEffect(() => {
    setSelectedOptionIndex(null);
  }, [currentIndex]);

  useEffect(() => {
    const qId = currentReel?.linkedQuestion?.id;
    if (!qId) {
      setMarketOptions([]);
      return;
    }
    let cancelled = false;
    questionDetails(String(qId), 0).then((res) => {
      if (cancelled) return;
      if (res?.success && Array.isArray(res.data?.options)) {
        setMarketOptions(
          res.data.options.map((o: Record<string, unknown>) => ({
            id: Number(o.id),
            name: String(o.name || ""),
            price: Number(o.price || 0),
          })),
        );
      } else {
        setMarketOptions([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentReel?.linkedQuestion?.id]);

  useEffect(() => {
    const id = searchParams?.get("id");
    if (id) {
      const numId = parseInt(id);
      const idx = reels.findIndex((r) => r.id === numId);
      if (idx >= 0) {
        dispatch(setCurrentIndex(idx));
        scrollToIndex(idx);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reels, searchParams]);

  useEffect(() => {
    const containers = [
      desktopContainerRef.current,
      mobileContainerRef.current,
    ].filter(Boolean) as HTMLDivElement[];
    const observers: IntersectionObserver[] = [];

    for (const container of containers) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const idx = Number(entry.target.getAttribute("data-index"));
              if (!isNaN(idx)) {
                dispatch(setCurrentIndex(idx));
                if (idx >= reels.length - 3 && hasMore && !isLoading) {
                  const nextPage = page + 1;
                  dispatch(setPage(nextPage));
                  fetchFeed(nextPage);
                }
              }
            }
          });
        },
        { root: container, threshold: 0.6 },
      );
      const items = container.querySelectorAll("[data-index]");
      items.forEach((el) => observer.observe(el));
      observers.push(observer);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, [reels, hasMore, isLoading, page, dispatch, fetchFeed]);

  const scrollToIndex = (idx: number) => {
    const container = getActiveContainer();
    if (!container) return;
    const child = container.children[idx] as HTMLElement;
    child?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpenComments = (reelId: number) => {
    setCommentsReelId(reelId);
    setCommentsOpen(true);
  };

  const handleReelCreated = () => {
    fetchFeed(1, true);
    dispatch(setPage(1));
  };

  const handleDesktopLike = async () => {
    if (!currentReel) return;
    if (!isAuth) return toast.error("Login to like");
    setLikeBounce(true);
    setTimeout(() => setLikeBounce(false), 500);
    const res = await toggleReelLike(currentReel.id);
    if (res?.success) {
      dispatch(
        updateReelLike({
          reelId: currentReel.id,
          liked: res.data.isLiked,
          likeCount: res.data.likeCount,
        }),
      );
    }
  };

  const handleDesktopBookmark = async () => {
    if (!currentReel) return;
    if (!isAuth) return toast.error("Login to bookmark");
    const res = await toggleReelBookmark(currentReel.id);
    if (res?.success) {
      dispatch(
        updateReelBookmark({
          reelId: currentReel.id,
          bookmarked: res.data.isBookmarked,
          bookmarkCount: res.data.bookmarkCount,
        }),
      );
    }
  };

  const handleDesktopShare = async () => {
    if (!currentReel) return;
    const shareUrl = `${window.location.origin}/reels?id=${currentReel.id}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: currentReel.caption || "Check out this reel!",
          url: shareUrl,
        });
      } catch {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => toast.success("Link copied!"),
        () => {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
          toast.success("Link copied!");
        },
      );
    }
  };

  const formatCount = (n: number): string => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return String(n);
  };

  const handleOptionClick = (index: number) => {
    setSelectedOptionIndex((prev) => (prev === index ? null : index));
  };

  const handleBuySell = (index: number, type: string) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setLoginOpen(true);
      return;
    }
    setSelectedOptionIndex(index);
    setBuySellOrderType(type);
    setBuySellOpen(true);
  };

  const buySellRowDetails = currentReel?.linkedQuestion
    ? {
        id: currentReel.linkedQuestion.id,
        question: {
          question: currentReel.linkedQuestion.question,
          id: currentReel.linkedQuestion.id,
        },
        options: marketOptions.map((o) => ({
          id: o.id,
          name: o.name,
          price: o.price,
          winningProbability: o.price,
        })),
      }
    : null;

  const buySellOption =
    selectedOptionIndex !== null && marketOptions[selectedOptionIndex]
      ? {
          id: marketOptions[selectedOptionIndex].id,
          name: marketOptions[selectedOptionIndex].name,
          price: marketOptions[selectedOptionIndex].price,
          winningProbability: marketOptions[selectedOptionIndex].price,
        }
      : null;

  // ── Left panel (rendered as JSX, NOT as <Component />) ──
  const renderLeftPanel = () => {
    const linkedQ = currentReel?.linkedQuestion;

    return (
      <div className="w-[320px] mt-16 flex-shrink-0 h-full flex flex-col p-4 gap-4 overflow-hidden">
        {linkedQ ? (
          <div
            className="bg-white dark:bg-[#1a1f2e] rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-4 space-y-3 flex-shrink-0"
            style={{
              boxShadow:
                "0 4px 6px rgba(0,0,0,0.07), 0 10px 30px rgba(129,96,238,0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 bg-gradient-to-br from-[#8160EE] to-[#6235f8] rounded-xl flex items-center justify-center"
                style={{
                  boxShadow:
                    "0 6px 16px rgba(129,96,238,0.35), 0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <MdQuiz className="text-white text-lg" />
              </div>
              <div>
                <p className="text-[11px] text-[#8160EE] font-bold uppercase tracking-wider">
                  Linked Market
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {linkedQ.status === "active" || linkedQ.status === "OPEN"
                    ? "Active"
                    : linkedQ.status}
                  {linkedQ.endDate &&
                    ` · Ends ${new Date(linkedQ.endDate).toLocaleDateString()}`}
                </p>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
              {linkedQ.question}
            </h3>

            {linkedQ.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {linkedQ.description}
              </p>
            )}

            {/* Market options */}
            {marketOptions.length > 0 && (
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto scrollbar-hide">
                {marketOptions.map((opt, idx) => (
                  <div key={opt.id}>
                    <button
                      onClick={() => handleOptionClick(idx)}
                      className={`reel-option-btn w-full flex items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-200 ${
                        selectedOptionIndex === idx
                          ? "bg-[#8160EE]/12 dark:bg-[#8160EE]/18 ring-1 ring-[#8160EE]/40"
                          : "bg-gray-50 dark:bg-[#0f1520] hover:bg-gray-100 dark:hover:bg-[#151c2e]"
                      }`}
                      style={{
                        boxShadow:
                          selectedOptionIndex === idx
                            ? "0 4px 15px rgba(129,96,238,0.2), inset 0 1px 0 rgba(255,255,255,0.05)"
                            : "0 1px 3px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.03)",
                      }}
                    >
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate mr-3">
                        {opt.name}
                      </span>
                      <span className="text-xs font-bold text-[#8160EE] flex-shrink-0 tabular-nums">
                        {Math.round(opt.price * 100)}%
                      </span>
                    </button>

                    {/* Buy/Sell buttons */}
                    {selectedOptionIndex === idx && (
                      <div className="flex gap-3 px-0.5 mt-2 mb-3">
                        <button
                          onClick={() => handleBuySell(idx, "buy")}
                          className="reel-buy-btn flex-1 bg-emerald-500 text-white text-[13px] font-bold py-2 rounded-xl"
                          style={{
                            boxShadow:
                              "0 3px 10px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                          }}
                        >
                          Buy {Math.round(opt.price * 100)}¢
                        </button>
                        <button
                          onClick={() => handleBuySell(idx, "sell")}
                          className="reel-sell-btn flex-1 bg-red-500 text-white text-[13px] font-bold py-2 rounded-xl"
                          style={{
                            boxShadow:
                              "0 3px 10px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                          }}
                        >
                          Sell {Math.round(opt.price * 100)}¢
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => router.push(`/market/${linkedQ.id}`)}
              className="reel-predict-btn relative w-full text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-xs overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #8160EE 0%, #6235f8 100%)",
                boxShadow:
                  "0 6px 20px rgba(129,96,238,0.4), 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.1)",
              }}
            >
              Predict Now
            </button>
          </div>
        ) : (
          <div
            className="rounded-2xl border border-gray-700/30 p-5 text-center flex-shrink-0"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-3"
              style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.3)" }}
            >
              <MdQuiz className="text-gray-600 text-xl" />
            </div>
            <p className="text-gray-500 text-sm font-medium">
              No linked market
            </p>
            <p className="text-gray-600 text-xs mt-1">
              This reel isn&apos;t linked to a prediction market
            </p>
          </div>
        )}

        {/* More Markets */}
        <div className="flex flex-col min-h-0">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2 flex-shrink-0">
            More Markets
          </h4>
          <div className="space-y-2 overflow-y-auto scrollbar-hide flex-1">
            {reels
              .filter(
                (r) =>
                  r.linkedQuestion &&
                  r.linkedQuestion.id !== currentReel?.linkedQuestion?.id,
              )
              .reduce((acc: LinkedQuestion[], r) => {
                if (
                  r.linkedQuestion &&
                  !acc.find((q) => q.id === r.linkedQuestion!.id)
                )
                  acc.push(r.linkedQuestion);
                return acc;
              }, [])
              .slice(0, 10)
              .map((q) => (
                <button
                  key={q.id}
                  onClick={() => router.push(`/market/${q.id}`)}
                  className="reel-market-card w-full bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-200 dark:border-gray-700/50 p-3 text-left transition-all duration-200"
                  style={{
                    boxShadow:
                      "0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug">
                    {q.question}
                  </p>
                  <p className="text-[11px] text-[#8160EE] mt-1 font-medium">
                    {q.status === "active" || q.status === "OPEN"
                      ? "Active"
                      : q.status}
                    {q.endDate &&
                      ` · Ends ${new Date(q.endDate).toLocaleDateString()}`}
                  </p>
                </button>
              ))}

            {reels.filter((r) => r.linkedQuestion).length === 0 && (
              <p className="text-gray-600 text-xs px-1">
                No markets available yet
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Desktop action buttons (rendered as JSX, NOT as <Component />) ──
  const renderDesktopActions = () => {
    if (!currentReel) return null;

    return (
      <div className="flex flex-col items-center gap-5 py-4">
        {/* Like */}
        <button
          onClick={handleDesktopLike}
          className={`reel-action-btn flex flex-col items-center ${likeBounce ? "reel-like-bounce" : ""}`}
        >
          {currentReel.isLiked ? (
            <FaHeart className="text-red-500 text-[22px]" />
          ) : (
            <FaRegHeart className="text-gray-500 dark:text-gray-400 text-[22px]" />
          )}
          <span className="text-[11px] mt-1.5 font-medium text-gray-600 dark:text-gray-400">
            {formatCount(currentReel.likeCount)}
          </span>
        </button>

        {/* Comment */}
        <button
          onClick={() => handleOpenComments(currentReel.id)}
          className="reel-action-btn flex flex-col items-center"
        >
          <FaComment
            className={`text-[22px] ${commentsOpen ? "text-[#8160EE]" : "text-gray-500 dark:text-gray-400"}`}
          />
          <span className="text-[11px] mt-1.5 font-medium text-gray-600 dark:text-gray-400">
            {formatCount(currentReel.commentCount)}
          </span>
        </button>

        {/* Bookmark */}
        <button
          onClick={handleDesktopBookmark}
          className="reel-action-btn flex flex-col items-center"
        >
          {currentReel.isBookmarked ? (
            <FaBookmark className="text-[#8160EE] text-[22px]" />
          ) : (
            <FaRegBookmark className="text-gray-500 dark:text-gray-400 text-[22px]" />
          )}
          <span className="text-[11px] mt-1.5 font-medium text-gray-600 dark:text-gray-400">
            {formatCount(currentReel.bookmarkCount)}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={handleDesktopShare}
          className="reel-action-btn flex flex-col items-center"
        >
          <FaShare className="text-gray-500 dark:text-gray-400 text-[20px]" />
          <span className="text-[11px] mt-1.5 text-gray-500">Share</span>
        </button>

        {/* Mute */}
        <button
          onClick={() => setIsMuted((prev) => !prev)}
          className="reel-action-btn flex flex-col items-center"
        >
          {isMuted ? (
            <FaVolumeMute className="text-gray-500 dark:text-gray-400 text-[20px]" />
          ) : (
            <FaVolumeUp className="text-gray-500 dark:text-gray-400 text-[20px]" />
          )}
        </button>

        {/* Create */}
        {isAuth && (
          <button
            onClick={() => setCreateOpen(true)}
            className="reel-create-btn w-11 h-11 rounded-full flex items-center justify-center mt-2"
            title="Create Reel"
            style={{
              background: "linear-gradient(135deg, #9070fa 0%, #6235f8 100%)",
              boxShadow:
                "0 6px 20px rgba(129,96,238,0.4), 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.15)",
            }}
          >
            <FaPlus className="text-white text-sm" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#0a0e1a]">
      {/* Styles */}
      <style>{`
        @keyframes reelLikeBounce {
          0% { transform: scale(1); }
          25% { transform: scale(1.3); }
          50% { transform: scale(0.9); }
          75% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .reel-like-bounce {
          animation: reelLikeBounce 0.4s ease-out;
        }
        /* Action icons — no circle, just icon + glow on hover */
        .reel-action-btn {
          transition: all 0.2s ease;
        }
        .reel-action-btn:hover {
          transform: scale(1.2);
          filter: drop-shadow(0 0 8px rgba(129,96,238,0.5));
        }
        .reel-action-btn:hover span {
          font-size: 12px;
        }
        .reel-action-btn:active {
          transform: scale(0.9);
        }
        /* Create FAB */
        .reel-create-btn {
          transition: all 0.2s ease;
        }
        .reel-create-btn:hover {
          transform: translateY(-3px) scale(1.08);
          box-shadow: 0 10px 28px rgba(129,96,238,0.5), 0 0 12px rgba(129,96,238,0.3), inset 0 1px 0 rgba(255,255,255,0.25) !important;
        }
        .reel-create-btn:active {
          transform: translateY(1px) scale(0.95);
        }
        /* Predict Now button */
        .reel-predict-btn {
          transition: all 0.2s ease;
        }
        .reel-predict-btn:hover {
          transform: scale(1.03);
          font-size: 12.5px;
          box-shadow: 0 8px 25px rgba(129,96,238,0.45), 0 0 10px rgba(129,96,238,0.2), inset 0 1px 0 rgba(255,255,255,0.2) !important;
          text-shadow: 0 0 8px rgba(255,255,255,0.4);
        }
        .reel-predict-btn:active {
          transform: scale(0.97);
        }
        /* Buy/Sell — scale only, no translateY */
        .reel-buy-btn {
          transition: all 0.15s ease;
        }
        .reel-buy-btn:hover {
          transform: scale(1.06);
          font-size: 13.5px;
          box-shadow: 0 0 14px rgba(16,185,129,0.4), 0 4px 12px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.3) !important;
          text-shadow: 0 0 6px rgba(255,255,255,0.3);
        }
        .reel-buy-btn:active {
          transform: scale(0.96);
        }
        .reel-sell-btn {
          transition: all 0.15s ease;
        }
        .reel-sell-btn:hover {
          transform: scale(1.06);
          font-size: 13.5px;
          box-shadow: 0 0 14px rgba(239,68,68,0.4), 0 4px 12px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,0.3) !important;
          text-shadow: 0 0 6px rgba(255,255,255,0.3);
        }
        .reel-sell-btn:active {
          transform: scale(0.96);
        }
        /* Market options */
        .reel-option-btn {
          transition: all 0.2s ease;
        }
        .reel-option-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 0 10px rgba(129,96,238,0.12), 0 4px 12px rgba(129,96,238,0.08) !important;
        }
        .reel-option-btn:hover span {
          text-shadow: 0 0 6px rgba(129,96,238,0.3);
        }
        /* More Markets cards */
        .reel-market-card {
          transition: all 0.2s ease;
        }
        .reel-market-card:hover {
          transform: scale(1.02);
          border-color: rgba(129,96,238,0.3) !important;
          box-shadow: 0 0 12px rgba(129,96,238,0.1), 0 4px 14px rgba(129,96,238,0.08) !important;
        }
        .reel-market-card:hover p {
          text-shadow: 0 0 6px rgba(129,96,238,0.2);
        }
        .reel-market-card:active {
          transform: scale(0.98);
        }
      `}</style>

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:flex w-full h-full items-center justify-center gap-4 px-4">
        {renderLeftPanel()}

        {/* Video */}
        <div
          className="relative w-[380px] flex-shrink-0 h-[calc(100%-32px)] max-h-[780px] bg-black rounded-2xl overflow-hidden"
          style={{
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.4), 0 0 15px rgba(129,96,238,0.1)",
          }}
        >
          <div
            ref={desktopContainerRef}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            style={{ scrollSnapStop: "always" } as React.CSSProperties}
          >
            {reels.map((reel, idx) => (
              <div
                key={reel.id}
                data-index={idx}
                className="w-full h-full snap-start"
                style={{ scrollSnapStop: "always" } as React.CSSProperties}
              >
                <ReelCard
                  reel={reel}
                  isActive={idx === currentIndex}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted((prev) => !prev)}
                  onOpenComments={handleOpenComments}
                  isAuth={isAuth}
                />
              </div>
            ))}

            {isLoading && (
              <div className="w-full h-full snap-start flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-3 border-[#8160EE] border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-400 text-sm">
                    Loading reels...
                  </span>
                </div>
              </div>
            )}

            {!isLoading && reels.length === 0 && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-black via-[#0f172a] to-black text-white px-6">
                <div
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#8160EE]/20 to-[#8160EE]/5 flex items-center justify-center mb-6"
                  style={{ boxShadow: "0 10px 30px rgba(129,96,238,0.2)" }}
                >
                  <FaVideo className="text-[#8160EE] text-3xl" />
                </div>
                <p className="text-xl font-bold mb-2">No reels yet</p>
                <p className="text-gray-400 text-sm text-center max-w-[280px] leading-relaxed">
                  Be the first to share your market insights!
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 h-[calc(100%-32px)] max-h-[780px] flex flex-col items-center justify-center">
          {renderDesktopActions()}
        </div>

        {commentsOpen && (
          <div className="w-[340px] flex-shrink-0 h-[calc(100%-32px)] max-h-[780px]">
            <CommentsDrawer
              reelId={commentsReelId}
              isOpen={commentsOpen}
              onClose={() => setCommentsOpen(false)}
              sidePanel
            />
          </div>
        )}
      </div>

      {/* MOBILE LAYOUT */}
      <div className="flex lg:hidden w-full h-full bg-black">
        <div className="relative w-full h-full max-w-[420px] mx-auto bg-black">
          <div
            ref={mobileContainerRef}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            style={{ scrollSnapStop: "always" } as React.CSSProperties}
          >
            {reels.map((reel, idx) => (
              <div
                key={reel.id}
                data-index={idx}
                className="w-full h-full snap-start"
                style={{ scrollSnapStop: "always" } as React.CSSProperties}
              >
                <ReelCard
                  reel={reel}
                  isActive={idx === currentIndex}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted((prev) => !prev)}
                  onOpenComments={handleOpenComments}
                  isAuth={isAuth}
                />
              </div>
            ))}

            {isLoading && (
              <div className="w-full h-full snap-start flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-3 border-[#8160EE] border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-400 text-sm">
                    Loading reels...
                  </span>
                </div>
              </div>
            )}

            {!isLoading && reels.length === 0 && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-black via-[#0f172a] to-black text-white px-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#8160EE]/20 to-[#8160EE]/5 flex items-center justify-center mb-6">
                  <FaVideo className="text-[#8160EE] text-3xl" />
                </div>
                <p className="text-xl font-bold mb-2">No reels yet</p>
                <p className="text-gray-400 text-sm text-center max-w-[280px] leading-relaxed">
                  Be the first to share your market insights!
                </p>
                {isAuth && (
                  <button
                    onClick={() => setCreateOpen(true)}
                    className="reel-predict-btn relative mt-6 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, #8160EE 0%, #6235f8 100%)",
                      boxShadow:
                        "0 6px 20px rgba(129,96,238,0.4), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.1)",
                    }}
                  >
                    <FaPlus className="text-sm" />
                    Create First Reel
                  </button>
                )}
              </div>
            )}
          </div>

          {isAuth && reels.length > 0 && (
            <button
              onClick={() => setCreateOpen(true)}
              className="reel-create-btn absolute bottom-6 right-4 z-30 rounded-full flex items-center justify-center"
              title="Create Reel"
              style={{
                width: "52px",
                height: "52px",
                background: "linear-gradient(135deg, #9070fa 0%, #6235f8 100%)",
                boxShadow:
                  "0 8px 24px rgba(129,96,238,0.4), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.15)",
              }}
            >
              <FaPlus className="text-white text-base" />
            </button>
          )}
        </div>

        <CommentsDrawer
          reelId={commentsReelId}
          isOpen={commentsOpen}
          onClose={() => setCommentsOpen(false)}
        />
      </div>

      <CreateReelModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleReelCreated}
      />
      <BuySell
        isOpen={buySellOpen}
        onClose={() => setBuySellOpen(false)}
        rowDetailss={buySellRowDetails}
        orderType={buySellOrderType}
        handleChangeOrderType={setBuySellOrderType}
        option={buySellOption}
        optionIndex={selectedOptionIndex ?? 0}
        fetchOrders={() => {}}
      />
      <Authentication
        isLogin
        isOpen={loginOpen}
        handleClose={() => setLoginOpen(false)}
      />
    </div>
  );
};

export default ReelsPage;
