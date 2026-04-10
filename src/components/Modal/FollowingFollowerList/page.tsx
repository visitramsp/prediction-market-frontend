"use client";

import {
  getFollowers,
  getFollowing,
  postFollowUser,
  postUnFollowUser,
} from "@/components/service/apiService/user";
import { delay, timeAgoCompact } from "@/utils/Content";
import { Backdrop, Box, CircularProgress, Fade, Modal } from "@mui/material";
import moment from "moment";
import { useTheme } from "next-themes";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function FollowingFollowerList({
  isOpen,
  onClose,
  handleClose,
  userId,
}) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"following" | "followers">(
    "following",
  );
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [pagination, setPagination] = useState<any>({});
  const [emptyData, setEmptyData] = useState([]);
  const [isLoader, setIsLoader] = useState(false);
  const [offset, setOffset] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  // followers pagination manage
  const [followerPagination, setFollowerPagination] = useState<any>({});
  const [followerEmptyData, setFollowerEmptyData] = useState([]);
  const [followerIsLoader, setFollowerIsLoader] = useState(false);
  const [followerOffset, setFollowerOffset] = useState(0);
  const followerListRef = useRef<HTMLDivElement | null>(null);

  const fetchFollowing = async (newOffset = offset) => {
    setIsLoader(true);
    try {
      const [response] = await Promise.all([
        getFollowing(userId, 10, newOffset),
        delay(1000),
      ]);
      const newData = response?.following?.detailList || [];
      setEmptyData(newData);
      if (response?.following?.detailList?.length > 0) {
        setPagination(response?.following || {});

        setFollowing((prev: any[]) => {
          if (newOffset === 0) return newData;
          const map = new Map();
          prev.forEach((item) => {
            map.set(item.id, item);
          });
          newData.forEach((item) => {
            map.set(item.id, item);
          });
          return Array.from(map.values());
        });
      } else {
        if (newOffset === 0) setFollowing([]);
      }
    } catch {
      if (newOffset === 0) setFollowing([]);
    } finally {
      setIsLoader(false);
    }
  };
  useEffect(() => {
    isOpen && fetchFollowing(0);
  }, [isOpen, userId, activeTab]);

  useEffect(() => {
    if (emptyData?.length === 0) return;
    const el = listRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;

      if (scrollTop + clientHeight >= scrollHeight - 10) {
        if (!isLoader && pagination?.limit) {
          const newOffset = pagination?.offset + pagination?.limit;
          setOffset(newOffset);
          fetchFollowing(newOffset);
        }
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [offset, pagination, isLoader]);

  const fetchFollowers = async (newOffset = followerOffset) => {
    setFollowerIsLoader(true);
    try {
      const [response] = await Promise.all([
        getFollowers(userId, 10, newOffset),
        delay(1000),
      ]);
      const newData = response?.followers?.detailList || [];
      setFollowerEmptyData(newData);
      if (response?.followers?.detailList?.length > 0) {
        setFollowerPagination(response?.followers || {});
        setFollowers((prev: any[]) => {
          if (newOffset === 0) return newData;
          const map = new Map();
          prev.forEach((item) => {
            map.set(item.id, item);
          });
          newData.forEach((item) => {
            map.set(item.id, item);
          });
          return Array.from(map.values());
        });
      } else {
        if (newOffset === 0) setFollowers([]);
      }
    } catch {
      if (newOffset === 0) setFollowers([]);
    } finally {
      setFollowerIsLoader(false);
    }
  };
  useEffect(() => {
    isOpen && fetchFollowers(0);
  }, [isOpen, userId, activeTab]);

  useEffect(() => {
    if (followerEmptyData?.length === 0) return;
    const el = followerListRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;

      if (scrollTop + clientHeight >= scrollHeight - 10) {
        if (!isLoader && followerPagination?.limit) {
          const newOffset =
            followerPagination?.offset + followerPagination?.limit;
          setFollowerOffset(newOffset);
          fetchFollowers(newOffset);
        }
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [followerOffset, followerPagination, followerPagination]);

  const handleFollowing = async (row: any) => {
    setFollowers((prev: any[]) =>
      prev.map((item) =>
        String(item.id) === String(row.id)
          ? { ...item, isFollowing: true }
          : item,
      ),
    );
    try {
      const payload = { targetUserId: row?.id };
      let response = await postFollowUser(payload);
      if (response.success) {
        toast.success(
          status ? "User Follow successfully" : "user Unfollow successfully",
        );
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Inter Server Error");
    }
  };

  const handleUnFollowing = async (status: boolean, targetId: any) => {
    if (!status) {
      setFollowing((prev) => {
        const map = new Map(
          prev
            .filter((item) => String(item.followingUserId) !== String(targetId))
            .map((item) => [String(item.followingUserId), item]),
        );

        return Array.from(map.values());
      });
    } else {
      setFollowers((prev: any[]) =>
        prev.map((item) =>
          String(item.id) === String(targetId)
            ? { ...item, isFollowing: false }
            : item,
        ),
      );
    }
    try {
      const payload = { targetUserId: targetId };
      let response = await postUnFollowUser(payload);
      if (response.success) {
        toast.success(
          status ? "User Follow successfully" : "user Unfollow successfully",
        );
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Inter Server Error");
    }
  };
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: {
          backdropFilter: "blur(10px)",
          backgroundColor:
            theme === "dark"
              ? "rgba(15, 23, 42, 0.7)"
              : "rgba(255, 255, 255, 0.7)",
        },
      }}
    >
      <Fade in={isOpen} timeout={500}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          className="bg-white dark:bg-[#1D293D] border dark:border-gray-800 border-gray-200 rounded-xl shadow-lg w-full max-w-[340px] lg:max-w-[640px] outline-none"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Connections
            </h2>

            <button
              onClick={handleClose}
              className="text-gray-500 cursor-pointer hover:text-gray-800 dark:hover:text-white transition"
            >
              ✕
            </button>
          </div>

          {/* TABS */}
          <div className="relative flex">
            <button
              onClick={() => setActiveTab("following")}
              className={`flex-1 cursor-pointer py-3 text-sm font-medium transition ${
                activeTab === "following"
                  ? "text-sky-500"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Following ({following?.length})
            </button>

            <button
              onClick={() => setActiveTab("followers")}
              className={`flex-1 py-3 cursor-pointer text-sm font-medium transition ${
                activeTab === "followers"
                  ? "text-sky-500"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Followers ({followers?.length})
            </button>

            {/* ACTIVE TAB INDICATOR */}
            <span
              className={`absolute bottom-0 h-[2px] w-1/2 bg-sky-500 transition-transform duration-300 ${
                activeTab === "following" ? "translate-x-0" : "translate-x-full"
              }`}
            />
          </div>

          {activeTab === "following" && (
            <div
              ref={listRef}
              className="max-h-[420px] overflow-y-auto px-4 py-3 space-y-3"
            >
              {following?.map((row, index) => (
                <div
                  key={row?.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <div className="flex items-center gap-3">
                    {row?.following?.image_url ? (
                      <Image
                        src={row?.following?.image_url}
                        height={10}
                        width={10}
                        alt="No Image"
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500" />
                    )}

                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {row?.following?.username || "--"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {moment(row?.updatedAt).format("DD MMM YYYY")}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleUnFollowing(false, row?.followingUserId)
                    }
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600
                      
                    `}
                  >
                    Unfollow
                  </button>
                </div>
              ))}
              {isLoader && (
                <div className="flex items-center justify-center py-3">
                  <CircularProgress
                    size={20}
                    className="!text-gray-400 dark:!text-gray-300"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "followers" && (
            <div
              ref={followerListRef}
              className="max-h-[420px] overflow-y-auto px-4 py-3 space-y-3"
            >
              {followers?.map((row, index) => (
                <div
                  key={row?.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <div className="flex items-center gap-3">
                    {row?.image_url ? (
                      <Image
                        src={row?.image_url}
                        height={10}
                        width={10}
                        alt="No Image"
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500" />
                    )}

                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {row?.username || "--"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {moment(row?.updatedAt).format("DD MMM YYYY")}
                      </div>
                    </div>
                  </div>

                  {row?.isFollowing ? (
                    <button
                      onClick={() => handleUnFollowing(true, row?.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full transition cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600
                      
                    `}
                    >
                      Unfollow
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollowing(row)}
                      className={`px-3 py-1.5 text-xs cursor-pointer font-semibold rounded-full transition 
                        bg-sky-500 text-white hover:bg-sky-600
                    `}
                    >
                      Follow
                    </button>
                  )}
                </div>
              ))}
              {isLoader && (
                <div className="flex items-center justify-center py-3">
                  <CircularProgress
                    size={20}
                    className="!text-gray-400 dark:!text-gray-300"
                  />
                </div>
              )}
            </div>
          )}
        </Box>
      </Fade>
    </Modal>
  );
}
