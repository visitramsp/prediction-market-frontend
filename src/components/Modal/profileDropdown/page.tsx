"use client";
import ThemeToggle from "@/components/ThemeToggle";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slice/auth";
import { useRouter } from "next/navigation";
import { ApiResponse, UserProfileData } from "@/utils/typesInterface";
import { logoutUser, userDetails } from "../../service/apiService/user";
import Image from "next/image";
import { FiLogOut } from "react-icons/fi";
import toast from "react-hot-toast";
import { CiYoutube } from "react-icons/ci";
import {
  Lightbulb,
  ListOrdered,
  ShieldCheck,
  FileText,
  ChevronRight,
} from "lucide-react";
export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserProfileData[] | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    // handleClose();
    try {
      const response = await logoutUser();
      if (response?.success) {
        dispatch(logout());
        localStorage.clear();
        window.location.href = "/";
        toast.success(response?.message);
      } else {
        toast.success(response?.message);
      }
    } catch {
      toast.success("Internal server error");
    }
  };

  const router = useRouter();
  // /termsAndConditions

  const handleNavigateRoute = (id: number) => {
    if (id === 0) {
      router.push("/ideas");
    } else if (id === 1) {
      router.push("/privacyPolicy");
    } else if (id === 2) {
      router.push("/termsAndConditions");
    } else if (id === 7) {
      router.push("/reals");
    } else {
      router.push("/watchlist");
    }
    setOpen(false);
  };

  const userDetailsList = async () => {
    try {
      const response: ApiResponse<UserProfileData[]> = await userDetails();
      if (response.success) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    userDetailsList();
  }, []);

  const userData = user?.[0] || null;
  // const portFolioData = user?.[1] || null;

  return (
    <div className={` relative`} ref={ref}>
      {/* Profile Icon */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 cursor-pointer" />
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown */}
      <div
        className={`
          absolute right-0 mt-3 w-64
          bg-[var(--color-bglight)] dark:bg-[var(--color-bgdark)]
          rounded-xl shadow-lg border border-[var(--color-borderlight)] dark:border-[var(--color-borderdark)]
          transition-all duration-200 ease-out
          z-50
          ${
            open
              ? "opacity-100 visible translate-y-0 scale-100"
              : "opacity-0 invisible translate-y-2 scale-95"
          }
        `}
      >
        {/* Wallet Section */}
        <div
          onClick={() => {
            setOpen(false);
            router.push("/userProfile");
          }}
          className="px-4 py-3 border-b dark:border-gray-600  overflow-hidden rounded-t-xl border-gray-300"
        >
          <div className="flex items-center gap-3">
            {userData?.user?.image_url ? (
              <div className="bg-gray-100 rounded-md p-0.5">
                <Image
                  src={userData?.user?.image_url}
                  alt="No"
                  height={30}
                  width={30}
                  className="rounded"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-400" />
            )}

            <div>
              <div className="font-semibold cursor-pointer text-sm dark:text-white text-gray-700">
                {userData?.user?.username || "Unknown"}
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="py-2 text-md font-semibold">
          {/* "Bookmarks", */}

          <div
            onClick={() => handleNavigateRoute(0)}
            className="group px-4 sm:hidden flex items-center justify-between py-2.5 dark:text-gray-300 text-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lightbulb
                size={18}
                className="text-yellow-500 dark:text-yellow-400"
              />
              <span className="font-medium">Ideas</span>
            </div>
            <ChevronRight
              size={14}
              className="opacity-0 group-hover:opacity-100 text-gray-400"
            />
          </div>

          <div
            onClick={() => handleNavigateRoute(7)}
            className="group px-4 sm:hidden flex items-center justify-between py-2.5 dark:text-gray-300 text-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <CiYoutube size={18} className="text-red-500 dark:text-red-400" />
              <span className="font-medium">Reals</span>
            </div>
            <ChevronRight
              size={14}
              className="opacity-0 group-hover:opacity-100 text-gray-400"
            />
          </div>

          <div
            onClick={() => handleNavigateRoute(4)}
            className="group px-4 sm:hidden flex items-center justify-between py-2.5 dark:text-gray-300 text-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <ListOrdered
                size={18}
                className="text-blue-500 dark:text-blue-400"
              />
              <span className="font-medium">Watch List</span>
            </div>
            <ChevronRight
              size={14}
              className="opacity-0 group-hover:opacity-100 text-gray-400"
            />
          </div>

          <div
            onClick={() => handleNavigateRoute(1)}
            className="group px-4 flex items-center justify-between py-2.5 dark:text-gray-300 text-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={18}
                className="text-emerald-500 dark:text-emerald-400"
              />
              <span className="font-medium">Privacy Policy</span>
            </div>
            <ChevronRight
              size={14}
              className="opacity-0 group-hover:opacity-100 text-gray-400"
            />
          </div>

          <div
            onClick={() => handleNavigateRoute(2)}
            className="group px-4 flex items-center justify-between py-2.5 dark:text-gray-300 text-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText
                size={18}
                className="text-purple-500 dark:text-purple-400"
              />
              <span className="font-medium">Terms and Conditions</span>
            </div>
            <ChevronRight
              size={14}
              className="opacity-0 group-hover:opacity-100 text-gray-400"
            />
          </div>
          <div className="border-t my-2 dark:border-gray-500 border-gray-300" />
          <div className="flex items-center md:justify-center justify-between gap-2 mx-auto  px-4 py-2">
            <div>
              <ThemeToggle />
            </div>
            <div>
              {" "}
              <button
                className="inline-block md:hidden group relative hover:bg-btnbg bg-[#8160ee]   text-white text-sm font-medium   px-4 py-1 rounded-md   cursor-pointer   transition-all duration-300 ease-in-out   hover:-translate-y-[3px]   active:translate-y-[3px]   active:shadow-[0_2px_0_rgb(29,78,216)]   
  "
              >
                Deposit
              </button>
            </div>
            <div>
              {" "}
              <FiLogOut
                onClick={handleLogout}
                className="text-red-500 text-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
