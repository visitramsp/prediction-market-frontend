"use client";

import { commonQuestionFindById } from "@/components/service/apiService/category";
import { getUserSearch } from "@/components/service/apiService/user";
import { delay } from "@/utils/Content";
import { SearchResultsSkeleton } from "@/utils/customSkeleton";
import { QuestionItem } from "@/utils/typesInterface";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { GiNinjaStar } from "react-icons/gi";
import didYouMean from "didyoumean2";

export default function MobileFullSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [questionData, setQuestionData] = useState<QuestionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "questions">("users");

  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const correctQuery = (text: string, sourceList: string[]) => {
    if (!text || sourceList.length === 0) return text;
    const match = didYouMean(text, sourceList);
    return match || text;
  };

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

  const fetchUsers = async (searchValue: string) => {
    setIsLoader(true);
    try {
      const [response] = await Promise.all([
        getUserSearch(searchValue, 20),
        delay(100),
      ]);
      setResults(response?.success ? response.data : []);
    } catch {
      setResults([]);
    } finally {
      setIsLoader(false);
    }
  };

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
    <>
      {/* Trigger button - visible only on mobile */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm transition hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Open search"
        >
          <FaSearch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </button>
      </div>

      <div
        className={`fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      >
        <div
          className={`fixed inset-x-0 bottom-0 top-0 flex flex-col bg-white dark:bg-gray-950 transform transition-all duration-300 ease-out ${
            open ? "translate-y-0" : "translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header / Search bar */}
          <div className="sticky text-start top-0 z-10 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
            <div className="flex items-center gap-3 px-5 py-4">
              <FaSearch className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search users or questions..."
                className="flex-1 bg-transparent placeholder:text-sm placeholder:font-normal outline-none text-base font-medium text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
          <div className="flex border-b border-gray-400 dark:border-gray-700">
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
          </div>

          <div className="flex-1 text-start overflow-y-auto overscroll-contain px-3 pr-6 py-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
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
                const metaData =
                  typeof item?.metadata === "string"
                    ? JSON.parse(item.metadata)
                    : item?.metadata || {};

                return (
                  <div
                    key={item.id}
                    onClick={() => handleRedirectMarketDetails(item.id)}
                    className="group flex items-center gap-3.5 rounded-xl px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-900/60 cursor-pointer active:scale-[0.98]"
                  >
                    {" "}
                    {/* <div className="relative flex-shrink-0">
                                  {" "}
                                  <Image
                                    src={metaData?.imageUrl || "/img/user.png"}
                                    height={48}
                                    width={48}
                                    alt="Question"
                                    className="rounded-full object-cover ring-1 ring-gray-200/50 dark:ring-gray-700/50"
                                  />{" "}
                                </div>{" "} */}
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
      </div>
    </>
  );
}
