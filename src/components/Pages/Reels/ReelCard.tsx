"use client";
import React, { useRef, useEffect, useState } from "react";
import { ReelItem } from "@/utils/typesInterface";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaBookmark,
  FaRegBookmark,
  FaShare,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";
import {
  toggleReelLike,
  toggleReelBookmark,
  recordReelView,
} from "@/components/service/apiService/reels";
import { useDispatch } from "react-redux";
import {
  updateReelLike,
  updateReelBookmark,
} from "@/components/store/slice/reels";
import toast from "react-hot-toast";
import moment from "moment";

interface ReelCardProps {
  reel: ReelItem;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenComments: (reelId: number) => void;
  isAuth: boolean;
}

const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  isActive,
  isMuted,
  onToggleMute,
  onOpenComments,
  isAuth,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayPause, setShowPlayPause] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewRecorded, setViewRecorded] = useState(false);
  const [likeBounce, setLikeBounce] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const dispatch = useDispatch();
  const playPauseTimeout = useRef<NodeJS.Timeout | null>(null);
  const viewStartRef = useRef<number>(0);

  useEffect(() => {
    if (isActive) {
      const t = setTimeout(() => setShowOverlay(true), 200);
      return () => clearTimeout(t);
    } else {
      setShowOverlay(false);
    }
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      video.play().catch(() => {});
      setIsPlaying(true);
      viewStartRef.current = Date.now();
      setViewRecorded(false);
    } else {
      video.pause();
      setIsPlaying(false);
      if (viewStartRef.current && !viewRecorded) {
        const watchDuration = (Date.now() - viewStartRef.current) / 1000;
        if (watchDuration > 1) {
          recordReelView(reel.id, watchDuration);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      if (video.duration)
        setProgress((video.currentTime / video.duration) * 100);
      if (video.currentTime > 3 && !viewRecorded) {
        setViewRecorded(true);
        recordReelView(reel.id, video.currentTime);
      }
    };
    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, [reel.id, viewRecorded]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    setShowPlayPause(true);
    if (playPauseTimeout.current) clearTimeout(playPauseTimeout.current);
    playPauseTimeout.current = setTimeout(() => setShowPlayPause(false), 800);
  };

  const handleLike = async () => {
    if (!isAuth) return toast.error("Login to like");
    setLikeBounce(true);
    setTimeout(() => setLikeBounce(false), 400);
    const res = await toggleReelLike(reel.id);
    if (res?.success) {
      dispatch(
        updateReelLike({
          reelId: reel.id,
          liked: res.data.isLiked,
          likeCount: res.data.likeCount,
        }),
      );
    }
  };

  const handleBookmark = async () => {
    if (!isAuth) return toast.error("Login to bookmark");
    const res = await toggleReelBookmark(reel.id);
    if (res?.success) {
      dispatch(
        updateReelBookmark({
          reelId: reel.id,
          bookmarked: res.data.isBookmarked,
          bookmarkCount: res.data.bookmarkCount,
        }),
      );
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/reels?id=${reel.id}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: reel.caption || "Check out this reel!",
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
        () => fallbackCopy(text),
      );
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    toast.success("Link copied!");
  };

  const formatCount = (n: number): string => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return String(n);
  };

  const creatorName =
    reel.creator?.preferences?.username ||
    reel.creator?.email?.split("@")[0] ||
    "User";

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black snap-start overflow-hidden rounded-xl lg:rounded-2xl">
      {/* Styles — minimal: play/pause fade, like bounce, hover transitions */}
      <style>{`
        @keyframes rcPlayFade {
          0% { transform: scale(0.6); opacity: 0; }
          40% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes rcHeartBounce {
          0% { transform: scale(1); }
          30% { transform: scale(1.3); }
          60% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .rc-play-fade {
          animation: rcPlayFade 0.8s ease-out forwards;
        }
        .rc-heart-bounce {
          animation: rcHeartBounce 0.4s ease-out;
        }
        .rc-action-btn {
          transition: all 0.2s ease;
        }
        .rc-action-btn:hover {
          transform: scale(1.2);
          filter: drop-shadow(0 0 8px rgba(255,255,255,0.4));
        }
        .rc-action-btn:hover span {
          font-size: 12px;
          text-shadow: 0 0 8px rgba(255,255,255,0.4);
        }
        .rc-action-btn:active {
          transform: scale(0.9);
        }
      `}</style>

      {/* Video */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlayPause}
        preload="metadata"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none z-10" />

      {/* Play/Pause overlay */}
      {showPlayPause && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div
            className="rc-play-fade rounded-full p-5"
            style={{
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {isPlaying ? (
              <FaPause className="text-white text-3xl drop-shadow-lg" />
            ) : (
              <FaPlay className="text-white text-3xl ml-1 drop-shadow-lg" />
            )}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-30">
        <div
          className="h-full bg-gradient-to-r from-[#8160EE] to-[#a78bfa] transition-all duration-200 rounded-full"
          style={{ width: `${progress}%`, boxShadow: "0 0 6px rgba(129,96,238,0.4)" }}
        />
      </div>

      {/* Right sidebar: actions — MOBILE ONLY */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5 z-20 lg:hidden">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`rc-action-btn flex flex-col items-center ${likeBounce ? "rc-heart-bounce" : ""}`}
        >
          {reel.isLiked ? (
            <FaHeart className="text-red-500 text-[24px]" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
          ) : (
            <FaRegHeart className="text-white text-[24px]" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
          )}
          <span className="text-white text-[11px] mt-1.5 font-semibold" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
            {formatCount(reel.likeCount)}
          </span>
        </button>

        {/* Comment */}
        <button
          onClick={() => onOpenComments(reel.id)}
          className="rc-action-btn flex flex-col items-center"
        >
          <FaComment className="text-white text-[24px]" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
          <span className="text-white text-[11px] mt-1.5 font-semibold" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
            {formatCount(reel.commentCount)}
          </span>
        </button>

        {/* Bookmark */}
        <button onClick={handleBookmark} className="rc-action-btn flex flex-col items-center">
          {reel.isBookmarked ? (
            <FaBookmark className="text-[#8160EE] text-[24px]" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
          ) : (
            <FaRegBookmark className="text-white text-[24px]" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
          )}
          <span className="text-white text-[11px] mt-1.5 font-semibold" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
            {formatCount(reel.bookmarkCount)}
          </span>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="rc-action-btn flex flex-col items-center">
          <FaShare className="text-white text-[22px]" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
          <span className="text-white text-[10px] mt-1.5 font-semibold" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>Share</span>
        </button>

        {/* Mute/Unmute */}
        <button onClick={onToggleMute} className="rc-action-btn flex flex-col items-center mt-1">
          {isMuted ? (
            <FaVolumeMute className="text-white/80 text-[20px]" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
          ) : (
            <FaVolumeUp className="text-white/80 text-[20px]" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
          )}
        </button>
      </div>

      {/* Bottom overlay: creator + caption */}
      <div
        className={`absolute bottom-5 left-4 right-16 lg:right-4 z-20 transition-all duration-500 ${
          showOverlay
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #9070fa, #6031fa)",
              boxShadow: "0 3px 12px rgba(129,96,238,0.35), 0 0 0 2px rgba(255,255,255,0.12)",
            }}
          >
            {creatorName.charAt(0).toUpperCase()}
          </div>
          <span className="text-white font-bold text-sm drop-shadow-lg">
            @{creatorName}
          </span>
          <span className="text-white/50 text-xs">
            {moment(reel.createdAt).fromNow()}
          </span>
        </div>

        {reel.caption && (
          <p className="text-white/90 text-[13px] leading-[18px] drop-shadow line-clamp-2 ml-11">
            {reel.caption}
          </p>
        )}
      </div>
    </div>
  );
};

export default ReelCard;
