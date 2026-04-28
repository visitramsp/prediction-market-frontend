"use client";
import { commonQuestionFindById } from "@/components/service/apiService/category";
import { getUserSearch } from "@/components/service/apiService/user";
import { delay } from "@/utils/Content";
import { SearchResultsSkeleton } from "@/utils/customSkeleton";
import { QuestionItem } from "@/utils/typesInterface";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { GiNinjaStar } from "react-icons/gi";

export default function MainSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [questionData, setQuestionData] = useState<QuestionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "questions">("users");

  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const getToken = localStorage.getItem("token");

  // outside click close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // debounce typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500); // 500ms pause

    return () => clearTimeout(timer);
  }, [query]);

  // fetch users
  const fetchUsers = async (searchValue: string) => {
    setIsLoader(true);
    try {
      const [response] = await Promise.all([
        getUserSearch(searchValue, 5),
        delay(100),
      ]);
      setResults(response?.success ? response.data : []);
    } catch {
      setResults([]);
    } finally {
      setIsLoader(false);
    }
  };

  // fetch questions
  const fetchQuestions = async (searchValue: string) => {
    setIsLoader(true);
    try {
      const [response] = await Promise.all([
        commonQuestionFindById(1, null, null, "", "", searchValue, null),
        delay(1000),
      ]);
      setQuestionData(response?.success ? (response.data.questions ?? []) : []);
    } catch {
      setQuestionData([]);
    } finally {
      setIsLoader(false);
    }
  };

  // API call after debounce
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([]);
      setQuestionData([]);
      return;
    }

    setOpen(true);

    if (activeTab === "users") {
      fetchUsers(debouncedQuery);
    } else {
      fetchQuestions(debouncedQuery);
    }
  }, [debouncedQuery, activeTab]);

  const handleRedirectUserProfile = (id: number) => {
    setQuery("");
    setOpen(false);
    router.push(`/ideas/profile/${id}`);
  };

  const handleRedirectMarketDetails = (id: number | string) => {
    setQuery("");
    setOpen(false);
    router.push(`/markets/${id}`);
  };

  return (
    <div className="relative w-full" ref={ref}>
      {/* INPUT */}
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

      <input
        type="text"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Trade on anything..."
        className="w-full pl-10 pr-4 py-2 rounded-full dark:placeholder:text-gray-300 bg-gray-100 dark:bg-[#17172e] text-sm focus:outline-none"
      />

      {/* DROPDOWN */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-[#17112c] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50">
          {/* TABS */}
          {getToken && (
            <div className="flex border-b border-gray-400 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("questions")}
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === "questions"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
              >
                Questions
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === "users"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
              >
                Users
              </button>
            </div>
          )}

          {/* RESULTS */}
          <div className="max-h-96 overflow-y-auto p-3">
            {isLoader ? (
              <SearchResultsSkeleton />
            ) : activeTab === "users" ? (
              results.length > 0 ? (
                results.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleRedirectUserProfile(item.id)}
                    className="group flex items-center gap-3.5 rounded-xl px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-900/60 cursor-pointer active:scale-[0.98]"
                  >
                    {" "}
                    <div className="relative flex-shrink-0">
                      {" "}
                      <Image
                        src={item.image_url || "/img/user.png"}
                        height={48}
                        width={48}
                        alt={item.username || "User"}
                        className="rounded-full object-cover ring-1 ring-gray-200/50 dark:ring-gray-700/50"
                      />{" "}
                    </div>{" "}
                    <div className="min-w-0 flex-1">
                      {" "}
                      <p className="truncate text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {" "}
                        {item.username || "—"}{" "}
                      </p>{" "}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {" "}
                        View profile{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 px-4 py-3">
                  No users found
                </p>
              )
            ) : questionData.length > 0 ? (
              questionData.map((item) => {
                const metaData = (() => {
                  if (!item?.metadata) return null;
                  if (typeof item?.metadata === "object") {
                    return item?.metadata;
                  }
                  try {
                    return JSON.parse(item?.metadata);
                  } catch (e) {
                    return null;
                  }
                })();

                return (
                  <div
                    key={item.id}
                    onClick={() => handleRedirectMarketDetails(item.id)}
                    className="group flex items-center gap-3.5 rounded-xl px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-900/60 cursor-pointer active:scale-[0.98]"
                  >
                    {metaData?.imageUrl && (
                      <div className="relative flex-shrink-0">
                        <Image
                          src={metaData?.imageUrl || "/img/user.png"}
                          height={48}
                          width={48}
                          alt="Question"
                          className="rounded-full object-cover ring-1 ring-gray-200/50 dark:ring-gray-700/50"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      {" "}
                      <p className="line-clamp-1 text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {" "}
                        {item.question || "—"}{" "}
                      </p>{" "}
                      <span className="flex text-xs items-center gap-1">
                        {" "}
                        {item?.stats?.totalVolume > 0 ? (
                          <>
                            {" "}
                            <span className="text-yellow-500 font-semibold">
                              {" "}
                              ${" "}
                            </span>{" "}
                            <span className="text-gray-500">
                              {" "}
                              {Number(item?.stats?.totalVolume || 0).toFixed(
                                2,
                              )}{" "}
                              Vol{" "}
                            </span>{" "}
                          </>
                        ) : (
                          <span className="text-yellow-500 flex items-center gap-1">
                            {" "}
                            <GiNinjaStar size={12} className="rotate-45" />{" "}
                            New{" "}
                          </span>
                        )}{" "}
                      </span>{" "}
                    </div>{" "}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 px-4 py-3">
                No questions found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
