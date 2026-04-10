"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRef } from "react";
import Authentication from "@/components/Pages/auth";
import { useDispatch, useSelector } from "react-redux";
import { CiViewList, CiYoutube } from "react-icons/ci";
import {
  fetchSubCategory,
  getCommonCategoryAll,
} from "@/components/service/apiService/category";
import {
  changeFilter,
  changeFilterQuestion,
  changeIsEvent,
  changeWatch,
  resetFilters,
  saveCategory,
  saveEventCategory,
  saveSelectSubCategory,
  saveSubCategory,
} from "@/components/store/slice/category";
import { usePathname, useRouter } from "next/navigation";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FaBookmark, FaRegListAlt } from "react-icons/fa";
import { CategorySkeleton } from "@/utils/customSkeleton";
import { delay } from "@/utils/Content";
import { headerRootState, isWatchListInterface } from "@/utils/typesInterface";
import ProfileDropdown from "@/components/Modal/profileDropdown/page";
import NotificationBell from "@/components/Modal/notification/page";
import MainSearch from "./MainSearch";
import MobileSearch from "./MainMobileSearch";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { ChevronDown, Crown, MessageCircle, X } from "lucide-react";
import { toggleMobileChat } from "@/components/store/slice/chat";
import ChatPanel from "@/components/Pages/Messages/ChatPanel";
import { MdOutlineMenuOpen } from "react-icons/md";
import { ListIndentDecrease } from "lucide-react";
import { ListIndentIncrease } from "lucide-react";
import { FcMindMap } from "react-icons/fc";
interface Category {
  id: number;
  name: string;
}

const frequencies = ["all", "daily", "weekly", "monthly"];
const statusList = ["Active", "Resolved"];
const sortOptions = [
  "volume_24h",
  "volume_total",
  "competitive",
  "ending_soon",
  "newest",
];

export const formatLabel = (value: string | number): string => {
  return value
    .toString()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const Header = ({ isPosition, setPosition }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const pathname = usePathname();
  const [isCategory, setIsCategory] = useState(false);
  const [eventCategory, setEventCategory] = useState([]);
  const [subCategoryId, setSubCategoryId] = useState<number | null>(null);
  const [frequency, setFrequency] = useState("all");
  const [status, setStatus] = useState("Active");
  const [sortBy, setSortBy] = useState("newest");
  const [isHovered, setIsHovered] = useState(false);

  const [hideFilter, setHideFilter] = useState({
    sports: false,
    crypto: false,
    earnings: false,
  });
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    handleResize(); // initial
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getToken = localStorage.getItem("token");
  const user = useSelector((state: headerRootState) => state?.user);
  const unreadCount = useSelector(
    (state: headerRootState & { chat?: { unreadCount: number } }) =>
      state?.chat?.unreadCount ?? 0,
  );
  const mobileChatOpen = useSelector(
    (state: headerRootState & { chat?: { mobileChatOpen: boolean } }) =>
      state?.chat?.mobileChatOpen ?? false,
  );
  const isWatchList = useSelector(
    (state: isWatchListInterface) => state?.category?.isWatchList,
  );
  const isFilterQuestion = useSelector(
    (state: isWatchListInterface) => state?.category?.isFilterQuestion,
  );
  const router = useRouter();
  const dispatch = useDispatch();
  const handleSignup = () => {
    setIsLogin(false);
    setIsOpen(true);
  };
  const handleLogin = () => {
    setIsLogin(true);
    setIsOpen(true);
  };

  const categoryAllList = useCallback(async () => {
    setIsCategory(true);
    try {
      const [response] = await Promise.all([
        getCommonCategoryAll(),
        delay(1000),
      ]);
      if (response.success && response.data?.categories?.length) {
        const firstCategory = response.data.categories[0];
        dispatch(saveCategory(firstCategory));
        setCategoryId(firstCategory.id);
        setCategory(response.data.categories);
      } else {
        setCategory([]);
      }
    } catch {
      setCategory([]);
    } finally {
      setIsCategory(false);
    }
  }, [dispatch]);

  useEffect(() => {
    categoryAllList();
  }, [categoryAllList]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const getSubCategory = useCallback(async () => {
    try {
      const response = await fetchSubCategory(categoryId);

      if (response.success && !response?.data?.isMultiple) {
        const subCategoryList = response?.data?.category?.event_section || [];

        setEventCategory(subCategoryList);
        dispatch(saveSelectSubCategory(null));
        dispatch(saveEventCategory(subCategoryList));
        dispatch(changeIsEvent(false));
        dispatch(saveSubCategory([]));
      } else if (response.success && response?.data?.isMultiple) {
        const subCategoryResponse =
          response?.data?.category?.sub_category || [];

        setEventCategory([]);
        dispatch(changeIsEvent(true));
        dispatch(saveSelectSubCategory(null));
        dispatch(saveSubCategory(subCategoryResponse));
        dispatch(saveEventCategory([]));
      } else {
        dispatch(saveSelectSubCategory(null));
        dispatch(saveSubCategory([]));
        dispatch(saveEventCategory([]));
        dispatch(changeIsEvent(false));
        setEventCategory([]);
      }
    } catch {
      dispatch(changeIsEvent(false));
      dispatch(saveSelectSubCategory(null));
      setEventCategory([]);
      dispatch(saveSubCategory([]));
      dispatch(saveEventCategory([]));
    }
  }, [dispatch, categoryId]);

  useEffect(() => {
    categoryId && getSubCategory();
  }, [getSubCategory, categoryId]);

  // const getUserBalance = async () => {
  //   try {
  //     const response: UserBalanceResponse = await userBalance();

  //     if (response.success && response.data?.balance !== undefined) {
  //       localStorage.setItem("balance", String(response.data.balance));
  //     } else {
  //       localStorage.removeItem("balance");
  //     }
  //   } catch {
  //     localStorage.removeItem("balance");
  //   }
  // };
  // useEffect(() => {
  //   if (token) {
  //     getUserBalance();
  //   }
  // }, [token]);

  const handleFilter = () => {
    dispatch(changeFilterQuestion(!isFilterQuestion));
  };

  const handleCleanFilter = () => {
    dispatch(resetFilters());
    setHideFilter({
      sports: false,
      crypto: false,
      earnings: false,
    });
    setFrequency("all");
    setStatus("OPEN");
    setSortBy("newest");
  };
  const toggleFilter = (key: keyof typeof hideFilter) => {
    setHideFilter((prev) => {
      const newValue = !prev[key];

      dispatch(
        changeFilter({
          key: "hideFilter",
          subKey: key,
          value: newValue,
        }),
      );

      return {
        ...prev,
        [key]: newValue,
      };
    });
  };

  const scrollRef = useRef<HTMLUListElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -200 : 200;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };
  // fetchNotification

  return (
    <>
      {/* <div className="hidden lg:block"> */}
      <div className="fixed top-0 left-0 z-[99]  w-full    ">
        <header
          className=" border-b dark:border-[#111A22] bg-[var(--color-bglight)] dark:bg-[var(--color-bgdark)] border-gray-300 

  pb-0  "
        >
          {/* shadow-[0_2px_6px_rgba(0,0,0,0.08)]
  dark:shadow-[0_2px_6px_rgba(0,0,0,0.4)] */}
          <div
            className={`
    
    transition-[max-width,padding] duration-500 ease-in-out 
    mx-auto md:pt-1 py-0 h-auto w-full
    ${isPosition ? "max-w-full px-10" : "max-w-[1450px] px-4"}
  `}
          >
            <div className={`flex items-center  pt-1  justify-between w-full `}>
              <div className="flex flex-row   items-center gap-14">
                <Link href="/" className="shrink-0">
                  <div className="flex items-center gap-2 group cursor-pointer">
                    {/* Icon with a subtle glow */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#8160ee]/20 blur-md rounded-full" />
                      <FcMindMap className="w-6 h-6 relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    {/* Text: Compact & Clean */}
                    <p className="flex flex-col leading-none font-poppins">
                      <span className="text-[14px] font-bold tracking-[0.2em] text-white uppercase">
                        Prediction
                      </span>
                      <span className="text-[12px] font-medium tracking-[0.1em] text-[#8160ee]/80">
                        MARKETPLACE
                      </span>
                    </p>
                  </div>
                  {/* <Image
                  src="/img/opinionLogo-light.png"
                  alt="Logo"
                  width={80}
                  height={80}
                /> */}
                </Link>
                <div className="flex flex-row items-center gap-7">
                  <div
                    onClick={() =>
                      !getToken ? setIsOpen(true) : router.push(`/ideas`)
                    }
                    className="font-medium sm:block hidden font-poppins cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                  >
                    SOCIAL
                  </div>
                  <div
                    onClick={
                      () => (false ? setIsOpen(true) : router.push(`/reels`))
                      // !getToken ? setIsOpen(true) : router.push(`/reels`)
                    }
                    className="font-medium sm:block hidden font-poppins cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                  >
                    <div className="flex items-center gap-1">
                      <CiYoutube
                        size={18}
                        className="text-red-500 dark:text-red-400"
                      />
                      REELS
                    </div>
                  </div>
                  {getToken && (
                    <div
                      onClick={() => router.push(`/messages`)}
                      className="font-medium sm:block hidden font-poppins cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                    >
                      <div className="flex items-center gap-1">
                        <MessageCircle size={16} className="text-[#8160ee]" />
                        CHAT
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CENTER: Search */}

              {/* RIGHT: Actions */}
              <div className="flex items-center md:w-2/3  justify-end gap-5  shrink-0 ">
                <div className="md:hidden inline-block text-center">
                  <MobileSearch />
                </div>
                <div className="w-full md:inline-block hidden max-w-xl mx-6">
                  <MainSearch />
                </div>
                {/* {user?.isAuth && (
                  <div className="text-center">
                    <div className="dark:text-gray-200 text-gray-950 text-sm">
                      Portfolio
                    </div>
                    <div className="font-semibold text-green-600">$0.00</div>
                  </div>
                )}

                {user?.isAuth && (
                  <div className="text-center">
                    <div className="dark:text-gray-200 text-gray-950 text-sm">
                      Cash
                    </div>
                    <div className="font-semibold text-green-600">$0.00</div>
                  </div>
                )} */}

                {user?.isAuth && (
                  <button
                    className="md:inline-block hidden
    group relative globalFonts
    hover:bg-btnbg bg-[#8160ee]
    text-white text-sm font-medium
    px-4 py-2 rounded-md
    cursor-pointer
    transition-all duration-300 ease-in-out
    hover:-translate-y-[3px]
    active:translate-y-[3px]
    active:shadow-[0_2px_0_rgb(29,78,216)]
  "
                  >
                    Deposit
                  </button>
                )}

                {user?.isAuth && (
                  <button
                    onClick={() => dispatch(toggleMobileChat())}
                    className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#8160ee] rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                )}
                {user?.isAuth && <NotificationBell userId={user?.user?.id} />}
                {user?.isAuth && <ProfileDropdown />}
                {!user?.isAuth && (
                  <div className="relative group inline-block">
                    {/* 1. Main Get Started Button */}
                    <button className="flex items-center gap-2 px-5 py-1.5 text-sm bg-[#8160ee] text-white rounded-md font-poppins font-semibold transition-all duration-300">
                      Get Started
                      <ChevronDown
                        size={18}
                        className="group-hover:rotate-180 transition-transform duration-300"
                      />
                    </button>

                    {/* 2. Dropdown Menu (Hover par dikhega) */}
                    <div
                      className="absolute left-0 mt-2 w-48 bg-[#1a1f2e] border border-gray-700 rounded-lg shadow-xl 
                      opacity-0 invisible scale-95 origin-top-left
                      group-hover:opacity-100 group-hover:visible group-hover:scale-100 
                      transition-all duration-200 ease-out z-50"
                    >
                      <div className="flex flex-col p-2">
                        {/* Login Option */}
                        <button
                          onClick={handleLogin}
                          className="text-left px-4 py-3 text-white font-poppins font-medium hover:bg-[#8160ee]/20 rounded-md transition-colors"
                        >
                          Login
                        </button>

                        {/* Sign Up Option */}
                        <button
                          onClick={handleSignup}
                          className="text-left px-4 py-3 text-white font-poppins font-medium hover:bg-[#8160ee]/20 rounded-md transition-colors"
                        >
                          Sign Up
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!pathname?.startsWith("/reels") &&
              !pathname?.startsWith("/messages") && (
                <nav
                  className={`relative  ${isCategory ? "" : "pb-0"} pt-3  w-full
                `}
                >
                  {!isCategory && (
                    <>
                      <button
                        onClick={() => scroll("left")}
                        className="absolute -left-2 top-[25px] -translate-y-1/2 z-10 text-gray-500 bg-white dark:bg-gray-800 shadow p-1 rounded-full flex md:hidden"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        onClick={() => scroll("right")}
                        className="absolute -right-2 top-[25px] -translate-y-1/2 z-10 text-gray-500 bg-white dark:bg-gray-800 shadow p-1 rounded-full flex md:hidden"
                      >
                        <FaChevronRight />
                      </button>
                    </>
                  )}

                  <ul
                    ref={scrollRef}
                    className="flex items-center  sm:px-3 px-5  pb-2 text-[14px] overflow-x-auto whitespace-nowrap scrollbar-hide scroll-smooth"
                  >
                    {!isCategory && (
                      <li className="flex-shrink-0 md:block hidden py-1  ">
                        {isPosition ? (
                          <ListIndentIncrease
                            className="cursor-pointer "
                            size={18}
                            onClick={() => setPosition(!isPosition)}
                          />
                        ) : (
                          <ListIndentDecrease
                            className="cursor-pointer "
                            size={18}
                            onClick={() => setPosition(!isPosition)}
                          />
                        )}
                      </li>
                    )}
                    {isCategory ? (
                      <div className="flex flex-row gap-7">
                        <CategorySkeleton />
                      </div>
                    ) : (
                      category?.map((row: Category, index: number) => (
                        <li key={row.id} className="flex-shrink-0">
                          <div
                            onClick={() => {
                              dispatch(saveCategory(row));
                              dispatch(saveSelectSubCategory(null));
                              setCategoryId(row?.id);
                              dispatch(changeIsEvent(false));
                              row?.id !== categoryId && router.push("/");
                            }}
                            className={`  px-5 font-poppins h-6   font-semibold flex items-center cursor-pointer
      transition-all duration-200 ease-in-out
      ${
        row?.id === categoryId
          ? "text-[#8160ee]  text-[16px]  "
          : " dark:text-gray-400 text-text   hover:text-[#8160ee] text-gray-500 "
      }`}
                          >
                            {index === 0 && (
                              <FaArrowTrendUp className="mr-1 text-sm" />
                            )}
                            {row?.name}
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </nav>
              )}
          </div>
        </header>
        {/* bg-[var(--color-bglight)] dark:bg-[var(--color-bgdark)] */}
        {eventCategory?.length > 0 && !pathname?.startsWith("/reels") && (
          <div
            className={`transition-all duration-500 ease-in-out ${
              isPosition
                ? "    w-[calc(100%-380px)] float-right "
                : "max-w-[1450px] mx-auto  sm:px-4 "
            } bg-[var(--color-bglight)] dark:bg-[var(--color-bgdark)] `}
          >
            <div
              className={`
        relative overflow-hidden
        transition-all duration-700 ease-in-out
        ${isWatchList ? "opacity-100" : ""}
      `}
            >
              {/* Tabs */}
              <ul
                // ref={scrollRef}
                className={`
          flex gap-8 px-6 h-8 items-center 
          text-[15px] ${isPosition ? "sm:pl-8" : "sm:pl-12"}
          overflow-x-auto whitespace-nowrap scrollbar-hide
        `}
              >
                {/* All */}
                <li className="flex-shrink-0">
                  <div
                    onClick={() => {
                      dispatch(saveSelectSubCategory(null));
                      setSubCategoryId(null);
                    }}
                    className={`${
                      subCategoryId == null
                        ? "text-[#8160ee]  text-[16px] "
                        : "dark:text-gray-400 text-text   hover:text-[#8160ee] text-gray-500"
                    } font-poppins h-6   font-semibold flex items-center cursor-pointer
      transition-all duration-200 ease-in-out`}
                  >
                    <FaArrowTrendUp className="mr-1" />
                    All
                  </div>
                </li>

                {/* Categories */}
                {eventCategory?.map((row: Category) => (
                  <li key={row.id} className="flex-shrink-0">
                    <div
                      onClick={() => {
                        dispatch(saveSelectSubCategory(row));
                        setSubCategoryId(row?.id);
                      }}
                      className={`font-poppins h-6   font-medium flex items-center cursor-pointer
      transition-all duration-200 ease-in-out ${
        row?.id === subCategoryId
          ? "text-[#8160ee]  text-[16px] "
          : "dark:text-gray-400 text-text   hover:text-[#8160ee] text-gray-500 "
      }`}
                    >
                      {row?.name}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Mobile chat overlay */}
      {mobileChatOpen && (
        <div className="fixed inset-0 z-[100] bg-[#0f172a] lg:hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b]">
            <h2 className="text-lg font-semibold text-white">Messages</h2>
            <button
              onClick={() => dispatch(toggleMobileChat())}
              className="p-2 rounded-lg hover:bg-[#1e293b] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-[#94a3b8]" />
            </button>
          </div>
          <div className="h-[calc(100vh-56px)]">
            <ChatPanel />
          </div>
        </div>
      )}

      <Authentication
        isLogin={isLogin}
        isOpen={isOpen}
        handleClose={() => setIsOpen(false)}
      />
    </>
  );
};
// || width < 500) &&
export default Header;
