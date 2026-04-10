import {
  getUsersAllDetails,
  postBookmarkOrUnBookMark,
  postFollowUser,
  postLikeOrUnlike,
  postUnFollowUser,
} from "@/components/service/apiService/user";
import { delay } from "@/utils/Content";
import { UserProfileSkeleton } from "@/utils/customSkeleton";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import MobileMenu from "../IdeaList/page";
import PostList from "@/components/Pages/detail/component/postList";
import { FaRegCommentAlt } from "react-icons/fa";
import { PostFeeBack } from "@/utils/typesInterface";
import { LuMessageSquareShare } from "react-icons/lu";
import FollowingFollowerList from "@/components/Modal/FollowingFollowerList/page";

interface userDetailProps {
  user: {
    user: {
      id: string;
    };
  };
}

export default function Profile({ targetId }: { targetId: string }) {
  const [isLoader, setIsLoader] = useState(false);
  const [followingData, setFollowingData] = useState([]);
  const usersOwn = useSelector((state: any) => state?.user?.user);
  const userDetails = followingData?.[0];
  const userId = useSelector((state: userDetailProps) => state?.user?.user?.id);
  const targetIds = targetId ? targetId : userId;
  const [isFollow, setIsFollow] = useState(false);
  const [myPost, setMyPost] = useState<PostFeeBack[]>([]);

  //pagination start
  const [offset, setOffset] = React.useState(0);
  const [pagination, setPagination] = React.useState<any>({});
  const [emptyData, setEmptyData] = React.useState([]);
  const [isPaginationLoader, setIsPaginationLoader] = React.useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    handleResize(); // initial
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // pagination end

  const isUsers = targetId == userId ? true : false;

  const getListOfPost = async (newOffset = offset) => {
    if (newOffset == 0) {
      setIsLoader(true);
    } else {
      setIsPaginationLoader(true);
    }
    try {
      const [response] = await Promise.all([
        getUsersAllDetails(targetIds, 10, newOffset),
        delay(1000),
      ]);

      const postDetails = response?.data?.[2] ?? [];
      setEmptyData(postDetails);
      setPagination(response.data?.[3] || {});
      if (response?.success) {
        newOffset == 0 && setFollowingData(response.data ?? []);

        setMyPost((prev: any[]) => {
          if (newOffset === 0) return postDetails;
          const map = new Map();
          prev.forEach((item) => map.set(item.id, item));
          postDetails.forEach((item) => map.set(item.id, item));

          return Array.from(map.values());
        });
      } else {
        newOffset === 0 && setFollowingData([]);
      }
    } catch {
      newOffset === 0 && setFollowingData([]);
    } finally {
      setIsLoader(false);
      setIsPaginationLoader(false);
    }
  };

  useEffect(() => {
    getListOfPost(0);
  }, [targetIds, userId]);

  React.useEffect(() => {
    if (emptyData?.length === 0) {
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
            getListOfPost(newOffset);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pagination?.offset, pagination?.limit, isPaginationLoader, offset]);

  const joinedDate = userDetails?.user?.createdAt
    ? new Date(userDetails.user.createdAt).toLocaleDateString("en-CA")
    : "";

  const handleFollowing = async (status: boolean) => {
    try {
      setFollowingData((prev) =>
        prev.map((item, index) =>
          index === 0
            ? {
                ...item,
                isFollowing: !item.isFollowing,
                following: item.isFollowing
                  ? Number(item.following) - 1
                  : item.following + 1,
              }
            : item,
        ),
      );
      const payload = { targetUserId: targetId };
      let response;
      if (!status) {
        response = await postFollowUser(payload);
      } else {
        response = await postUnFollowUser(payload);
      }
      if (response.success) {
        toast.success(
          status ? "user Unfollow successfully" : "User Follow successfully",
        );
        // getListOfPost();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Inter Server Error");
    }
  };

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
    <div>
      <div className="max-w-[1450px] mx-auto px-4 pt-8 sm:pt-24 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="lg:sticky top-32">
              <h1 className="dark:text-white text-gray-800 md:ml-0 ml-16 lg:text-3xl text-xl mb-0 mt-3">
                Ideas
              </h1>
              <span className="dark:text-text text-text text-xs md:ml-0 ml-16">
                Serving public conversation
              </span>
              <MobileMenu />
            </div>
          </div>
          <div className="lg:col-span-3 lg:border-r lg:border-l dark:border-gray-700 border-gray-200 min-h-1/2 relative -top-8  sm:top-0">
            <div className=" ">
              {isLoader ? (
                <UserProfileSkeleton />
              ) : (
                <div className="flex justify-center w-full px-5">
                  <div
                    className="
                      w-full  rounded-2xl p-5
                      bg-white/80 dark:bg-transparent
                      backdrop-blur-xl
                      border border-gray-200/60 dark:border-white/10
                      
                      transition-all duration-300
                    
                    "
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400 via-sky-400 to-purple-500 blur-md opacity-40" />
                          <Image
                            src={
                              userDetails?.user?.image_url || "/img/user.png"
                            }
                            alt="Profile"
                            width={80}
                            height={80}
                            className="relative rounded-xl object-cover "
                          />
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg text-gray-900 dark:text-white">
                              {userDetails?.user?.username || "0"}
                            </span>
                            {isUsers && (
                              <span className="text-xs text-emerald-500 font-medium">
                                ● Active
                              </span>
                            )}
                          </div>

                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {joinedDate || "0"}
                          </span>
                          <div className="flex gap-5 mt-2 text-xs">
                            <span
                              onClick={() => isUsers && setIsFollow(true)}
                              className="text-gray-500 cursor-pointer dark:text-gray-400"
                            >
                              <strong className="text-gray-900 dark:text-white">
                                {userDetails?.follower || "0"}
                              </strong>{" "}
                              Followers
                            </span>
                            <span
                              onClick={() => isUsers && setIsFollow(true)}
                              className="text-gray-500 cursor-pointer dark:text-gray-400"
                            >
                              <strong className="text-gray-900 dark:text-white">
                                {userDetails?.following || "0"}
                              </strong>{" "}
                              Following
                            </span>
                          </div>
                        </div>
                      </div>

                      {usersOwn?.id !== userDetails?.user?.id && (
                        <button
                          onClick={() =>
                            handleFollowing(userDetails?.isFollowing)
                          }
                          className={`
    px-5 py-2 rounded-full text-xs cursor-pointer font-semibold
    transition-all duration-300
    ${
      userDetails?.isFollowing
        ? `
          bg-gray-200 dark:bg-gray-700
          text-gray-800 dark:text-gray-200
          hover:bg-gray-300 dark:hover:bg-gray-600
          shadow-none
        `
        : `
          bg-gradient-to-r from-emerald-500 to-green-400
          text-black
          shadow-[0_8px_24px_rgba(16,185,129,0.45)]
          hover:scale-105 hover:shadow-[0_12px_32px_rgba(16,185,129,0.6)]
        `
    }
    active:scale-95
  `}
                        >
                          {userDetails?.isFollowing ? "Unfollow" : "Follow"}
                        </button>
                      )}
                    </div>

                    {userDetails?.user?.description && (
                      <p className="mt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {userDetails?.user?.description || ""}
                      </p>
                    )}

                    {/* EMBEDDED MARKET CARD */}

                    {/* FOOTER ACTIONS */}
                    {/* <div className="mt-4 flex justify-between items-center text-gray-500 dark:text-gray-400">
                      <div className="flex gap-6 text-sm">
                        <button className="hover:text-emerald-500 transition">
                          ↗
                        </button>
                      </div>

                      <button className="text-xs hover:text-gray-700 dark:hover:text-gray-200">
                        Share
                      </button>
                    </div> */}
                  </div>
                </div>
              )}
            </div>

            <div className="text-gray-500 text-sm p-4 mt-5">
              <div className="border-b mb-5 border-gray-200  dark:border-gray-600 ">
                <span className="text-xl flex items-center gap-2 font-medium dark:text-gray-200 text-gray-500">
                  <LuMessageSquareShare className="text-gray-400 dark:text-cyan-500" />{" "}
                  Post
                </span>
              </div>
              {myPost?.length > 0 ? (
                <PostList
                  isIdea={true}
                  allPosts={myPost}
                  handleBookMarkOrUnBookMark={handleBookMarkOrUnBookMark}
                  handleLikeUnlike={handleLikeUnlike}
                  setAllPosts={null}
                  handleLoginCheck={null}
                  token=""
                  isPaginationLoader={isPaginationLoader}
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
                    Be the first to share your thoughts and spark a
                    conversation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <FollowingFollowerList
        handleClose={() => setIsFollow(false)}
        isOpen={isFollow}
        onClose={() => setIsFollow(false)}
        userId={userId}
      />
    </div>
  );
}
