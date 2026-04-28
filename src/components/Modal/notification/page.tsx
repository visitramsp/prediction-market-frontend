"use client";
import { delay, timeAgoCompact } from "@/utils/Content";
import { Bell, Check, Heart, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  fetchNotification,
  fetchUnReadCountNotification,
  postAllReadNotification,
  postReadNotification,
} from "../../service/apiService/user";
import toast from "react-hot-toast";
import { IoMdNotificationsOutline } from "react-icons/io";
import socket from "../../socket";
import { NotificationSkeleton } from "@/utils/customSkeleton";
import { useRouter } from "next/navigation";
import { FaComment, FaComments, FaHeart } from "react-icons/fa";
import { HiViewGridAdd } from "react-icons/hi";
import { CircularProgress } from "@mui/material";

export default function NotificationBell({ userId }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [notificationData, setNotificationData] = useState([]);
  const [countNotification, setCountNotification] = useState(0);
  const [offset, setOffset] = useState(0);
  const [pagination, setPagination] = useState<any>({});
  const [emptyData, setEmptyData] = useState([]);
  const [isLoader, setIsLoader] = useState(false);
  const [mainLoader, setMainLoader] = useState(false);

  useEffect(() => {
    if (open) {
      setMainLoader(true);

      const timer = setTimeout(() => {
        setMainLoader(false);
      }, 1000); // 1 second

      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationList = async (newOffset = offset) => {
    setIsLoader(true);
    try {
      const [response] = await Promise.all([
        fetchNotification(10, newOffset),
        delay(1000),
      ]);

      if (response?.success) {
        const newData = response?.data?.data || [];
        setEmptyData(newData);
        setNotificationData((prev: any[]) => {
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
        setPagination(response?.data?.page || {});
      } else {
        if (newOffset === 0) setNotificationData([]);
      }
    } catch {
      if (newOffset === 0) setNotificationData([]);
    } finally {
      setIsLoader(false);
    }
  };

  useEffect(() => {
    if (open) {
      setOffset(0);
      getNotificationList(0);
    }
  }, [open]);

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
          getNotificationList(newOffset);
        }
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [offset, pagination, isLoader]);

  const getUnReadCountNotification = async () => {
    try {
      const response = await fetchUnReadCountNotification();
      if (response?.success) {
        setCountNotification(response?.count ?? 0);
      } else {
        setCountNotification(0);
      }
    } catch {
      setCountNotification(0);
    }
  };
  useEffect(() => {
    getUnReadCountNotification();
  }, []);

  const router = useRouter();
  const redirectToPage = (row: any) => {
    setOpen(false);
    if (row?.type === "LIKE") {
      router.push(`/ideas/${row?.postId}`);
    } else if (row?.type === "FOLLOW") {
      router.push(`/ideas/profile/${row?.actor?.id}`);
    } else if (row?.type === "COMMENT_REPLY") {
      router.push(`/ideas/${row?.postId}`);
    } else if (row?.type === "COMMENT") {
      router.push(`/ideas/${row?.postId}`);
    }
  };
  const markAsRead = async (row: any) => {
    try {
      const payload = {
        notificationId: row?.id,
      };
      setNotificationData((prev: any) =>
        prev.map((item: any) =>
          item.id === row?.id ? { ...item, isRead: true } : item,
        ),
      );
      setCountNotification((prev) => prev - 1);
      const response = await postReadNotification(payload);

      if (response.success) {
        toast.success("Notification Read Successfully");
      }
    } catch {
      toast.error("Something went wrongs");
    }
  };

  const markAsReadAll = async (row: any) => {
    try {
      setCountNotification(0);
      setNotificationData((prev: any) =>
        prev.map((item: any) => {
          return { ...item, isRead: true };
        }),
      );
      const response = await postAllReadNotification();
      if (response.success) {
        toast.success("All notifications marked as read");
      }
    } catch {
      toast.error("Something went wrongs");
    }
  };

  useEffect(() => {
    socket.emit(`subscribe:userNotification`, userId);
    const handleNotification = (payload: any) => {
      toast.success(payload?.message || "");
      console.log(payload, "payload");

      setCountNotification((prev: number) => prev + 1);
    };

    socket.on("notification", handleNotification);

    return () => {
      // socket.emit("unsubscribeLiveTrade");
      socket.off("notification", handleNotification);
    };
  }, [socket.connected]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className=" dark:hover:text-white cursor-pointer relative"
      >
        <Bell size={20} className="dark:text-white/60 text-sky-500 mt-4" />
        <span className="absolute top-2 -right-2 bg-red-500 text-white w-4.5 h-4.5 leading-5 text-center rounded-full text-xs">
          {countNotification || 0}
        </span>
      </button>
      <div
        className={`
          absolute lg:right-0 -right-16 mt-3 w-72
          bg-white dark:bg-[#0a0e14]
          rounded shadow-lg border dark:border-gray-800 border-gray-300
          transition-all duration-200 ease-out
          z-50
          ${
            open
              ? "opacity-100 visible translate-y-0 scale-100"
              : "opacity-0 invisible translate-y-2 scale-95"
          }
        `}
      >
        <div className="flex px-4 flex-row border-b border border-[var(--color-borderlight)] dark:border-[var(--color-borderdark)] items-center justify-between">
          <div className=" py-3  text-gray-800 dark:text-gray-200 font-semibold text-sm">
            Notifications ({countNotification})
          </div>
          <button
            // disabled
            onClick={markAsReadAll}
            className="
              flex items-center gap-1
              px-2 py-1.5
              text-xs
              rounded-full
              bg-gray-100 dark:bg-gray-600
              text-gray-500 dark:text-gray-300 hover:bg-gray-300 hover:dark:bg-gray-700 cursor-pointer "
          >
            <Check size={14} />
            Read All
          </button>
        </div>

        {/* List */}
        <div ref={listRef} className="max-h-72 overflow-y-auto hideScrollbar">
          {mainLoader ? (
            Array.from({ length: 4 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))
          ) : notificationData?.length === 0 ? (
            <div className="px-4 py-3 flex flex-col items-center justify-center text-xs border-b text-gray-500 dark:text-gray-300 last:border-b-0 dark:border-gray-700  cursor-pointer">
              <IoMdNotificationsOutline
                size={30}
                className="text-gray-300 dark:text-gray-500"
              />
              <span>Not Found Notification</span>
            </div>
          ) : (
            notificationData?.map((row) => (
              <div
                key={row?.id}
                className={`group relative px-4 py-3 border-b last:border-b-0 
             border-[var(--color-borderlight)] dark:border-[var(--color-borderdark)]
             ${
               //  row?.postId == null
               //    ? "bg-gray-100 dark:bg-gray-600"
               //    :
               row?.isRead
                 ? " hover:bg-gray-50 dark:hover:bg-gray-800"
                 : "bg-cyan-50 dark:bg-cyan-900/30 dark:!border-gray-600"
             }
              `}
              >
                <div className="flex items- gap-2">
                  {row?.type === "LIKE" ? (
                    <FaHeart className="text-red-500" />
                  ) : row?.type === "FOLLOW" ? (
                    <UserPlus className="text-blue-500" />
                  ) : row?.type === "COMMENT" ? (
                    <FaComment size={16} className="text-yellow-600" />
                  ) : row?.type === "COMMENT_REPLY" ? (
                    <FaComments className="text-gray-500" size={16} />
                  ) : (
                    <HiViewGridAdd />
                  )}
                  <div className="flex-1">
                    <div className="text-sm flex items-center gap-2 cursor-pointer font-medium text-gray-800 dark:text-white">
                      <div
                        onClick={() =>
                          row?.postId == null ? null : redirectToPage(row)
                        }
                      >
                        {row?.type.replace("_", " ")}
                      </div>
                      <div
                        onClick={() => {
                          setOpen(false);
                          router.push(`/ideas/profile/${row?.actor?.id}`);
                        }}
                        className="text-blue-500 text-xs hover:text-blue-600 "
                      >
                        ({" "}
                        <span className="hover:underline">
                          {row?.actor?.username?.length > 7
                            ? row.actor.username.slice(0, 6) + "..."
                            : row?.actor?.username}
                        </span>
                        )
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {row?.message}
                    </div>

                    <div className="text-[11px] text-gray-400 mt-1">
                      {timeAgoCompact(row?.createdAt)}
                    </div>
                  </div>

                  {row?.isRead ? (
                    <button
                      className="
                      flex items-center justify-center
                      h-7 w-7 rounded-full
                      bg-emerald-100 dark:bg-emerald-900/30
                      text-emerald-600 dark:text-emerald-400
                     
                      self-center
                    "
                      aria-label="Mark as read"
                    >
                      ✓
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(row);
                      }}
                      className="
                      opacity-0 group-hover:opacity-100
                      transition-all duration-200
                      cursor-pointer
                      flex items-center justify-center
                      h-7 w-7 rounded-full
                      bg-emerald-100 dark:bg-emerald-900/30
                      text-emerald-600 dark:text-emerald-400
                      hover:bg-emerald-300 dark:hover:bg-emerald-900/50
                      translate-x-2 group-hover:translate-x-0
                      self-center
                    "
                      aria-label="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoader && (
            <div className="flex items-center justify-center py-3">
              <CircularProgress
                size={20}
                className="!text-gray-400 dark:!text-gray-300"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
