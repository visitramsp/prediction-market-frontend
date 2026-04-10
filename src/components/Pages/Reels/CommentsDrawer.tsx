"use client";
import React, { useState, useEffect, useRef } from "react";
import { ReelComment as ReelCommentType } from "@/utils/typesInterface";
import {
  getReelComments,
  addReelComment,
  deleteReelComment,
} from "@/components/service/apiService/reels";
import { useDispatch, useSelector } from "react-redux";
import {
  incrementCommentCount,
  decrementCommentCount,
} from "@/components/store/slice/reels";
import { FaTimes, FaPaperPlane, FaTrash } from "react-icons/fa";
import moment from "moment";
import toast from "react-hot-toast";

interface CommentsDrawerProps {
  reelId: number | null;
  isOpen: boolean;
  onClose: () => void;
  /** Render as an inline side panel (desktop) instead of a bottom drawer */
  sidePanel?: boolean;
}

const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  reelId,
  isOpen,
  onClose,
  sidePanel = false,
}) => {
  const [comments, setComments] = useState<ReelCommentType[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sending, setSending] = useState(false);
  const dispatch = useDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUser = useSelector(
    (state: { user: { user: { id?: number } } }) => state?.user?.user,
  );

  useEffect(() => {
    if (isOpen && reelId) {
      setComments([]);
      setPage(1);
      setHasMore(true);
      fetchComments(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reelId]);

  const fetchComments = async (p: number) => {
    if (!reelId) return;
    setLoading(true);
    const res = await getReelComments(reelId, p);
    if (res?.success) {
      if (p === 1) {
        setComments(res.data.comments);
      } else {
        setComments((prev) => [...prev, ...res.data.comments]);
      }
      setHasMore(res.data.hasMore);
    }
    setLoading(false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage);
  };

  const handleSend = async () => {
    if (!text.trim() || !reelId || sending) return;
    setSending(true);
    const res = await addReelComment(reelId, text.trim());
    if (res?.success) {
      setComments((prev) => [res.data, ...prev]);
      setText("");
      dispatch(incrementCommentCount(reelId));
    } else {
      toast.error(res?.message || "Failed to add comment");
    }
    setSending(false);
  };

  const handleDelete = async (commentId: number) => {
    if (!reelId) return;
    const res = await deleteReelComment(commentId);
    if (res?.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      dispatch(decrementCommentCount(reelId));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  const commentsList = (
    <>
      {comments.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <span className="text-xl">💬</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            No comments yet
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            Be the first to share your thoughts!
          </p>
        </div>
      )}

      {loading && comments.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-[#8160EE] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {comments.map((c) => {
        const name =
          (c.commenter?.preferences as Record<string, string>)?.username ||
          c.commenter?.email?.split("@")[0] ||
          "User";
        return (
          <div key={c.id} className="flex gap-3 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8160EE] to-[#673bf7] flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ring-2 ring-[#c8aa76]/20">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {name}
                </span>
                <span className="text-[11px] text-gray-400">
                  {moment(c.createdAt).fromNow()}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
                {c.content}
              </p>

              {c.replies && c.replies.length > 0 && (
                <div className="mt-3 ml-2 pl-3 border-l-2 border-[#8160EE]/20 space-y-2.5">
                  {c.replies.map((r) => {
                    const rName =
                      (r.commenter?.preferences as Record<string, string>)
                        ?.username ||
                      r.commenter?.email?.split("@")[0] ||
                      "User";
                    return (
                      <div key={r.id} className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8160EE]/60 to-[#8160EE]/60 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {rName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {rName}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {r.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {currentUser?.id && currentUser.id === c.userId && (
              <button
                onClick={() => handleDelete(c.id)}
                className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 self-start mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FaTrash className="text-xs" />
              </button>
            )}
          </div>
        );
      })}

      {hasMore && comments.length > 0 && (
        <button
          onClick={handleLoadMore}
          className="text-[#8160EE] hover:text-[#6335f8] text-sm w-full text-center py-2 font-medium transition-colors"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-[#6235f8] border-t-transparent rounded-full animate-spin" />
              Loading...
            </span>
          ) : (
            "Load more comments"
          )}
        </button>
      )}
    </>
  );

  const inputBar = (
    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700/50 flex gap-2 items-center">
      <input
        className="flex-1 bg-gray-100 dark:bg-[#0f1520] text-sm text-gray-900 dark:text-white rounded-full px-4 py-2.5 outline-none border border-transparent focus:border-[#8160EE]/30 transition-colors"
        placeholder="Add a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || sending}
        className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c57f8] to-[#6235f8] flex items-center justify-center disabled:opacity-30 transition-opacity"
      >
        {sending ? (
          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <FaPaperPlane className="text-white text-xs" />
        )}
      </button>
    </div>
  );

  // ── Desktop: inline side panel ──
  if (sidePanel) {
    return (
      <div className="w-full h-full flex flex-col bg-white dark:bg-[#1a1f2e] rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
            Comments
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <FaTimes className="text-gray-500 dark:text-gray-400 text-xs" />
          </button>
        </div>
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-4"
        >
          {commentsList}
        </div>
        {inputBar}
      </div>
    );
  }

  // ── Mobile: bottom drawer ──
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1f2e] rounded-t-3xl max-h-[70vh] flex flex-col animate-slide-up shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700/50">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">
            Comments
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <FaTimes className="text-gray-500 dark:text-gray-400 text-sm" />
          </button>
        </div>
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-5"
        >
          {commentsList}
        </div>
        {inputBar}
      </div>
    </div>
  );
};

export default CommentsDrawer;
