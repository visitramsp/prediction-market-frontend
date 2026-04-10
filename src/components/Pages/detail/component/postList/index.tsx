import {
  getCommentsList,
  postUserCommentLikeOrUnlike,
  replyComments,
} from "@/components/service/apiService/user";
import { delay, HighlightTexts, timeAgoCompact } from "@/utils/Content";
import { CommentListSkeleton } from "@/utils/customSkeleton";
import { CommentInterface, IReply } from "@/utils/typesInterface";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaBookmark } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import ReplyModal from "../../../../Modal/ReplyModal";
import SubComment from "@/components/Modal/SubComment";
import ViewImage from "@/components/common/ViewImage";
import { CircularProgress } from "@mui/material";

interface PostListProps {
  isIdea?: boolean;
  allPosts?: any[];
  handleLikeUnlike?: any;
  handleBookMarkOrUnBookMark?: any;
  setAllPosts: any;
  isPaginationLoader: boolean;
  token: string;
  handleLoginCheck: any;
}

interface CommentState {
  open: boolean;
  loading: boolean;
  isReply: boolean;
  comments: CommentInterface[];
}

export default function PostList({
  isIdea = false,
  allPosts = [],
  handleLikeUnlike = () => {},
  handleBookMarkOrUnBookMark = () => {},
  setAllPosts = () => {},
  isPaginationLoader = false,
  token = "",
  handleLoginCheck = () => null,
}: PostListProps) {
  const [commentMap, setCommentMap] = useState<Record<number, CommentState>>(
    {},
  );
  const [mixText, setMixText] = useState("");
  const [imageGif, setImageGif] = useState(null);
  const [open, setOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [postId, setPostId] = useState(null);
  const [commentIds, setCommentIds] = useState(null);
  const [rowDetails, setRowDetails] = useState({});
  const [isSendMessageLoader, setIsSendMessageLoader] = useState(false);
  const userDetails = useSelector((state: any) => state?.user?.user);
  const router = useRouter();

  const handleCloseComment = () => {
    setMixText("");
    setOpen(false);
    setPostId(null);
    setCommentIds(null);
    setRowDetails({});
    setImageGif(null);
    setCommentOpen(false);
  };
  const toggleComments = async (postId: number) => {
    setCommentMap((prev: any) => {
      const isOpen = prev?.[postId]?.open ?? false;

      const updated: any = {};

      Object.keys(prev).forEach((key) => {
        const id = Number(key);

        updated[id] = {
          ...prev[id],

          isReply: false,
          open: id === postId ? !isOpen : prev[id]?.open,
          loading:
            id === postId ? !isOpen && !prev[id]?.comments?.length : false,
          comments: prev[id]?.comments || [],
        };
      });

      // if postId not exists yet
      if (!updated[postId]) {
        updated[postId] = {
          open: true,
          loading: true,
          comments: [],
          isReply: false,
        };
      }

      return updated;
    });

    // if (commentMap[postId]?.comments?.length) return;

    try {
      const [response] = await Promise.all([
        getCommentsList(postId),
        delay(1000),
      ]);

      setCommentMap((prev: any) => {
        const isOpen = prev?.[postId]?.open ?? false;

        return {
          ...prev,
          [postId]: {
            open: isOpen,
            loading: false,
            comments: response?.success ? response.data : [],
          },
        };
      });
    } catch {
      setCommentMap((prev: any) => ({
        ...prev,
        [postId]: {
          open: true,
          loading: false,
          comments: [],
        },
      }));
    }
  };

  const handleCommentLikeUnlike = async (
    id: number,
    isLike: number,
    postId: number,
  ) => {
    setCommentMap((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        comments: prev[postId].comments.map((comment) => {
          if (comment.id === id) {
            return {
              ...comment,
              isUserLike: isLike === 1 ? 0 : 1,
              likeCount:
                isLike === 1 ? comment.likeCount - 1 : comment.likeCount + 1,
            };
          }

          if (comment.replies?.length) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === id
                  ? {
                      ...reply,
                      isUserLike: isLike === 1 ? 0 : 1,
                      likeCount:
                        isLike === 1
                          ? reply.likeCount - 1
                          : reply.likeCount + 1,
                    }
                  : reply,
              ),
            };
          }

          return comment;
        }),
      },
    }));
    try {
      if (isLike == 1) {
        toast.success("Unlike");
      } else {
        toast.success("like");
      }
      const payload = {
        commentId: id,
      };
      const response = await postUserCommentLikeOrUnlike(payload);
      if (!response.success) {
        toast.success(response?.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const handleCommentToCommentLikeUnlike = async (
    postId: number,
    commentId: number,
    replyId: number,
    isLike: number,
  ) => {
    setCommentMap((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        comments: prev[postId].comments.map((comment) => {
          // ✅ Sirf parent comment match karo
          if (comment.id !== commentId) return comment;

          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === replyId
                ? {
                    ...reply,
                    isUserLike: isLike === 1 ? 0 : 1,
                    likeCount:
                      isLike === 1 ? reply.likeCount - 1 : reply.likeCount + 1,
                  }
                : reply,
            ),
          };
        }),
      },
    }));
    try {
      if (isLike == 1) {
        toast.success("Unlike");
      } else {
        toast.success("like");
      }
      const payload = {
        commentId: replyId,
      };
      const response = await postUserCommentLikeOrUnlike(payload);
      if (!response.success) {
        toast.success(response?.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const handleSend = async (row: any, textForInput: any, imageLink: any) => {
    if (!mixText.trim()) return;
    setIsSendMessageLoader(true);
    try {
      const payload = {
        postId: row?.id,
        comment: textForInput,
        metadata: imageLink ? { images: [imageLink] } : null,
      };
      const [response] = await Promise.all([
        replyComments(payload),
        delay(1000),
      ]);
      if (response.success) {
        toast.success("Message send successfully!");
        setAllPosts((prev: any[]) =>
          prev.map((post) =>
            post.id === row.id
              ? {
                  ...post,
                  commentCount: (post.commentCount || 0) + 1,
                }
              : post,
          ),
        );
        setCommentMap((prev: any) => {
          if (!prev?.[row.id]) {
            return prev;
          }

          return {
            ...prev,
            [row.id]: {
              ...prev[row.id],
              comments: [
                ...(prev[row.id]?.comments || []),
                {
                  ...response?.data,
                  User: {
                    id: userDetails?.id,
                    image_url: userDetails?.imageUrl || "",
                    username: userDetails?.username || "",
                  },
                },
              ],
            },
          };
        });
        handleCloseComment();
      } else {
        toast.error(response?.message || "something went wrong");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsSendMessageLoader(false);
    }
  };

  const handleRedirectUserDetails = (id) => {
    router.push(`/ideas/profile/${id}`);
  };
  const handleSubmitForSubComment = async (
    row: any,
    replyText: string,
    imageLink: any,
  ) => {
    setIsSendMessageLoader(true);
    try {
      const payload = {
        postId: postId,
        comment: `@${row?.User?.username} ${replyText}`,
        metadata: imageLink ? { images: [imageLink] } : null,
        replyCommentId: commentIds,
      };
      const [response] = await Promise.all([
        replyComments(payload),
        delay(100),
      ]);
      if (response.success) {
        toast.success("Message send successfully!");

        setCommentMap((prev: any) => {
          if (!prev?.[postId]) return prev;
          return {
            ...prev,
            [postId]: {
              ...prev[postId],
              comments: prev[postId].comments.map((comment: any) => {
                if (comment.id !== commentIds) return comment;
                return {
                  ...comment,
                  isReply: false,
                  replies: [
                    ...(comment.replies || []),
                    {
                      ...response.data,
                      User: {
                        id: userDetails?.id,
                        username: userDetails?.username || "",
                        image_url: userDetails?.imageUrl || "",
                      },
                      isReply: false,
                    },
                  ],
                };
              }),
            },
          };
        });
        handleCloseComment();
      } else {
        toast.error(response?.message || "something went wrong");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsSendMessageLoader(false);
    }
  };

  const handleOpenComment = (item) => {
    setOpen(true);
    setRowDetails(item);
  };

  const handleOpenSubComment = (postIds, item, commentId = null) => {
    setCommentOpen(true);
    setPostId(postIds);
    setCommentIds(commentId);
    setRowDetails(item);
  };

  return (
    <div>
      {allPosts?.map((row, index) => {
        const contentForPost =
          typeof row?.metadata === "string"
            ? JSON.parse(row.metadata)
            : row.metadata;
        // const imageUrl = contentForPost?.images?.[0];
        return (
          <div
            key={row?.id}
            className="flex   w-full flex-col sm:flex-row gap-3  py-4 border-b border-gray-200 dark:border-gray-800"
          >
            <div className="flex flex-row gap-2">
              <div
                onClick={() => handleRedirectUserDetails(row?.User?.id)}
                className="p-0.5 cursor-pointer flex h-fit overflow-hidden rounded-full bg-gray-200 dark:bg-gray-500"
              >
                <Image
                  src={
                    row?.User?.image_url ||
                    "https://cdn.vectorstock.com/i/500p/98/17/gray-man-placeholder-portrait-vector-23519817.jpg"
                  }
                  alt="user"
                  width={30}
                  height={30}
                  className="rounded-full h-6 w-6 sm:h-8 sm:w-8"
                />
              </div>
              <div className="sm:hidden block">
                <div className="flex items-center gap-2">
                  <h4>
                    <span
                      onClick={() => handleRedirectUserDetails(row?.User?.id)}
                      className="dark:text-gray-300 cursor-pointer hover:underline font-semibold text-gray-700"
                    >
                      {row?.User?.username || "Unknown"}
                    </span>{" "}
                    <span className="text-xs dark:text-gray-500 text-gray-500 ">
                      {timeAgoCompact(row?.updatedAt)}
                    </span>
                  </h4>
                </div>
              </div>
            </div>
            <div className=" w-full">
              <div className="  hidden sm:block">
                <div className="flex items-center gap-2">
                  <h4>
                    <span className="dark:text-gray-300 cursor-pointer hover:underline font-semibold text-gray-700">
                      {row?.User?.username || "Unknown"}
                    </span>{" "}
                    <span className="text-xs dark:text-gray-500 text-gray-500 ">
                      {timeAgoCompact(row?.updatedAt)}
                    </span>
                  </h4>
                </div>
              </div>

              <div className="mt-1 text-sm text-gray-800 dark:text-gray-300 leading-relaxed">
                {contentForPost?.content && (
                  <HighlightTexts key={index} text={contentForPost?.content} />
                )}
                {contentForPost?.images?.length > 0 && (
                  <>
                    {" "}
                    <br />
                    <br />
                  </>
                )}
                {contentForPost?.images?.length > 0 && (
                  <div className=" w-fit rounded ">
                    <Image
                      src={contentForPost?.images?.[0]}
                      height={250}
                      alt="post image"
                      width={350}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center  gap-5 mt-3 text-gray-400">
                <span className=" flex gap-1 items-center">
                  <button
                    onClick={() =>
                      row?.commentCount < 1
                        ? null
                        : token
                          ? toggleComments(row.id)
                          : handleLoginCheck()
                    }
                    className="cursor-pointer hover:text-gray-600"
                  >
                    <MessageCircle size={16} />
                  </button>
                  <span className="mt-1 text-xs ">
                    {" "}
                    {row?.commentCount || 0}
                  </span>
                </span>

                <span className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      handleLikeUnlike(row?.id, row?.isLiked, isIdea)
                    }
                    className=" hover:text-red-500 cursor-pointer"
                  >
                    {row?.isLiked == 1 ? (
                      <FcLike size={16} />
                    ) : (
                      <Heart size={16} />
                    )}
                  </button>
                  <span className="text-xs mt-1">{row?.likeCount || 0}</span>
                </span>

                <button
                  onClick={() =>
                    handleBookMarkOrUnBookMark(
                      row?.id,
                      row?.isBookmarked,
                      isIdea,
                    )
                  }
                  className="hover:text-gray-600 cursor-pointer"
                >
                  {row?.isBookmarked == 1 ? (
                    <FaBookmark className="text-sky-500" />
                  ) : (
                    <Bookmark size={16} className="text-sky-300" />
                  )}
                </button>
                <button
                  className="hover:text-gray-600 cursor-pointer"
                  onClick={() =>
                    token ? handleOpenComment(row) : handleLoginCheck()
                  }
                >
                  Reply
                </button>
              </div>
              <div
                className={`
                      grid transition-all duration-300  ease-in-out origin-top
                      ${
                        commentMap[row.id]?.open
                          ? "grid-rows-[1fr] opacity-100 mt-3"
                          : "grid-rows-[0fr] opacity-0"
                      }
                    `}
              >
                <div className="overflow-hidden z-30 ">
                  {commentMap[row.id]?.loading && (
                    <div
                      className={
                        "pl-2 pr-2 py-3 bg-gray-50 dark:bg-[#111A22] rounded-lg "
                      }
                    >
                      <CommentListSkeleton />
                    </div>
                  )}

                  {commentMap[row.id]?.comments?.length > 0 && (
                    <div
                      className={
                        "pl-2 pr-2 py-3 w-full rounded-lg bg-gray-50 dark:bg-[#111A22]  border border-gray-200 dark:border-gray-800"
                      }
                    >
                      {commentMap[row.id].comments.map((comment: any) => {
                        const commentImages = (() => {
                          if (!comment?.metadata) return null;
                          if (typeof comment.metadata === "object") {
                            return comment.metadata;
                          }
                          try {
                            return JSON.parse(comment.metadata);
                          } catch (e) {
                            return null;
                          }
                        })();
                        const commentImg = commentImages?.images?.[0];
                        return (
                          <div
                            key={comment.id}
                            className="flex flex-col gap-1 py-2 border-b last:border-b-0 border-gray-200 dark:border-gray-800"
                          >
                            <div className="flex flex-row gap-3">
                              <div className="p-0.5 cursor-pointer flex h-fit overflow-hidden rounded-full bg-gray-200 dark:bg-gray-500">
                                <Image
                                  src={
                                    comment?.User?.image_url ||
                                    "https://cdn.vectorstock.com/i/500p/98/17/gray-man-placeholder-portrait-vector-23519817.jpg"
                                  }
                                  width={30}
                                  height={30}
                                  className="rounded-full h-6 w-10 sm:!h-8 sm:!w-8"
                                  alt="user"
                                  onClick={() =>
                                    handleRedirectUserDetails(row?.User?.id)
                                  }
                                />
                              </div>

                              <div>
                                <div className="text-xs flex  items-center gap-1 font-semibold">
                                  <div
                                    onClick={() =>
                                      handleRedirectUserDetails(row?.User?.id)
                                    }
                                    className="text-gray-900 cursor-pointer relative font-semibold text-sm dark:text-white"
                                  >
                                    {" "}
                                    {comment?.User?.username || "--"}
                                  </div>
                                  <span className="ml-2 text-[13px] text-gray-400">
                                    {timeAgoCompact(comment?.createdAt)}
                                  </span>
                                </div>

                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  {comment.content}
                                </div>
                                {commentImg && (
                                  <ViewImage imageUrl={commentImg} />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-5 pl-10 mt-3 text-gray-400">
                              <div className="flex items-center gap-1 hover:text-red-500">
                                <button
                                  onClick={() =>
                                    handleCommentLikeUnlike(
                                      comment?.id,
                                      comment?.isUserLike,
                                      row.id,
                                    )
                                  }
                                  className="cursor-pointer"
                                >
                                  {comment?.isUserLike == 1 ? (
                                    <FcLike size={16} />
                                  ) : (
                                    <Heart size={16} />
                                  )}
                                </button>
                                <span className="text-xs mt-1">
                                  {comment?.likeCount || 0}
                                </span>
                              </div>

                              <button
                                // onClick={() =>
                                //   handleSubComment(row?.id, comment)
                                // }
                                onClick={() =>
                                  handleOpenSubComment(
                                    row?.id,
                                    comment,
                                    comment?.id,
                                  )
                                }
                                className="text-gray-400 hover:text-gray-500 cursor-pointer "
                              >
                                Reply
                              </button>
                            </div>
                            <div
                              className={`
                                  transition-all md:pl-10 duration-500 ease-in-out
                                  ${
                                    comment?.isReply
                                      ? "max-h-[200px] opacity-100 mt-2"
                                      : "max-h-0 opacity-0"
                                  }
                                  overflow-visible
                                `}
                            ></div>
                            <div className="pb-2 pl-10">
                              {comment?.replies?.length > 0 &&
                                comment?.replies?.map((replies: IReply) => {
                                  const commentSubImages = (() => {
                                    if (!replies?.metadata) return null;
                                    if (typeof replies.metadata === "object") {
                                      return replies.metadata;
                                    }
                                    try {
                                      return JSON.parse(replies.metadata);
                                    } catch (e) {
                                      return null;
                                    }
                                  })();
                                  const imageUrl =
                                    commentSubImages?.images?.[0];
                                  return (
                                    <div key={replies?.id}>
                                      <div className="flex border-t mt-4 border-gray-200 dark:border-gray-700 pt-2  items-start gap-4 ">
                                        <div className="w-fit h-fit p-0.5 rounded-full flex items-center bg-gray-200 shadow dark:bg-gray-700 ">
                                          <Image
                                            src={
                                              replies?.User?.image_url ||
                                              "https://cdn.vectorstock.com/i/500p/98/17/gray-man-placeholder-portrait-vector-23519817.jpg"
                                            }
                                            alt="user"
                                            width={30}
                                            height={30}
                                            onClick={() =>
                                              handleRedirectUserDetails(
                                                row?.User?.id,
                                              )
                                            }
                                            className="md:w-8 w-6 h-6 md:h-8  rounded-full cursor-pointer"
                                          />
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <h4>
                                              <span
                                                onClick={() =>
                                                  handleRedirectUserDetails(
                                                    row?.User?.id,
                                                  )
                                                }
                                                className="dark:text-gray-300 cursor-pointer relative hover:underline font-semibold text-gray-700"
                                              >
                                                {replies?.User?.username ||
                                                  "Unknown"}
                                              </span>{" "}
                                              <span className="text-xs dark:text-gray-500 text-gray-500">
                                                {timeAgoCompact(row?.updatedAt)}
                                              </span>
                                            </h4>
                                          </div>
                                          <p className="text-md md:mt-2 mt-0 dark:text-gray-400 text-gray-800">
                                            {replies?.content && (
                                              <HighlightTexts
                                                text={replies?.content}
                                              />
                                            )}{" "}
                                          </p>
                                          {imageUrl && (
                                            <ViewImage imageUrl={imageUrl} />
                                          )}
                                          <div className=" py-2">
                                            <div className="flex text-gray-400 flex-row items-center gap-4">
                                              <span></span>
                                              <span className="flex items-center cursor-pointer gap-2">
                                                {replies?.isUserLike == 1 ? (
                                                  <FcLike
                                                    onClick={() =>
                                                      handleCommentToCommentLikeUnlike(
                                                        row.id,
                                                        comment?.id,
                                                        replies?.id,
                                                        replies?.isUserLike,
                                                      )
                                                    }
                                                  />
                                                ) : (
                                                  <Heart
                                                    onClick={() =>
                                                      handleCommentToCommentLikeUnlike(
                                                        row.id,
                                                        comment?.id,
                                                        replies?.id,
                                                        replies?.isUserLike,
                                                      )
                                                    }
                                                    size={18}
                                                  />
                                                )}{" "}
                                                {replies?.likeCount || 0}
                                              </span>
                                              <div
                                                className="text-gray-400 hover:text-gray-200 text-sm cursor-pointer"
                                                // onClick={() =>
                                                //   handleSubCommentToComment(
                                                //     row?.id,
                                                //     comment?.id,
                                                //     replies,
                                                //   )
                                                // }
                                                onClick={() =>
                                                  handleOpenSubComment(
                                                    row?.id,
                                                    replies,
                                                    comment?.id,
                                                  )
                                                }
                                              >
                                                Reply
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div
                                        className={`
                                  transition-all md:pl-10 w-full duration-500 ease-in-out
                                  ${
                                    replies?.isReply
                                      ? "max-h-[200px] opacity-100 mt-2"
                                      : "max-h-0 opacity-0"
                                  }
                                  overflow-visible
                                `}
                                      ></div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        );
                      })}{" "}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {isPaginationLoader && (
        <div className="flex items-center justify-center pt-5">
          <CircularProgress
            size={30}
            className="!text-gray-500 dark:!text-gray-300 "
          />
        </div>
      )}

      <ReplyModal
        open={open}
        onClose={handleCloseComment}
        row={rowDetails}
        handleSend={handleSend}
        isLoader={isSendMessageLoader}
        mixText={mixText}
        setMixText={setMixText}
        gif={imageGif}
        setGif={setImageGif}
      />
      <SubComment
        open={commentOpen}
        onClose={handleCloseComment}
        row={rowDetails}
        handleSend={handleSubmitForSubComment}
        isLoader={isSendMessageLoader}
        mixText={mixText}
        setMixText={setMixText}
        gif={imageGif}
        setGif={setImageGif}
      />
    </div>
  );
}
