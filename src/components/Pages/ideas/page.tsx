import React, { useCallback, useEffect, useState } from "react";
import { getFeed } from "@/components/service/apiService/user";
import { useSelector } from "react-redux";
import MobileMenu from "./component/IdeaList/page";
import IdeaTabs from "./component/IdeaTabs/page";
import { PostFeeBack } from "@/utils/typesInterface";

import { delay } from "@/utils/Content";
import { useRouter } from "next/navigation";
import TabsOne from "./component/newTabsOne/page";

interface userDetails {
  user: {
    user: {
      id: string;
    };
  };
}

const Ideas = () => {
  const [allPosts, setAllPosts] = useState<PostFeeBack[]>([]);
  const [isLoader, setIsLoader] = useState(false);
  const users = useSelector((state: userDetails) => state?.user?.user);
  const router = useRouter();
  const [mainTabs, setMainTabs] = useState(0);

  // pagination pending start
  const [offset, setOffset] = useState(0);
  const [pagination, setPagination] = useState<any>({});
  const [emptyData, setEmptyData] = useState([]);
  const [isPaginationLoader, setIsPaginationLoader] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    handleResize(); // initial
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // pagination pending end

  useEffect(() => {
    if (mainTabs == 0) {
      setOffset(0);
    } else {
      setOffset(0);
      setEmptyData([]);
    }
  }, [mainTabs]);
  const getListOfPost = async (newOffset = offset) => {
    if (newOffset === 0) {
      setIsLoader(true);
    } else {
      setIsPaginationLoader(true);
    }

    try {
      const [response] = await Promise.all([
        getFeed(null, 10, newOffset),
        delay(1000),
      ]);
      const newItem = response.data?.posts ?? [];
      setEmptyData(newItem);
      setPagination(response.data);
      if (response?.success) {
        setAllPosts((prev: any[]) => {
          if (newOffset === 0) return newItem;

          const map = new Map();
          prev.forEach((item) => map.set(item.id, item));
          newItem.forEach((item) => map.set(item.id, item));

          return Array.from(map.values());
        });
      } else {
        setAllPosts([]);
      }
    } catch {
      setAllPosts([]);
    } finally {
      setIsLoader(false);
      setIsPaginationLoader(false);
    }
  };

  useEffect(() => {
    getListOfPost(0);
  }, [users?.id]);

  // const handleChangePage = () => {
  //   if (emptyData?.length === 0) return;
  //   const newOffset = (pagination?.offset || 0) + (pagination?.limit || 12);
  //   if (newOffset > offset) {
  //     setOffset(newOffset);
  //     getListOfPost(newOffset);
  //   }
  // };

  useEffect(() => {
    if (mainTabs > 0 || emptyData?.length === 0) {
      return;
    }
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= fullHeight - (width > 500 ? 200 : 1000)) {
        if (!isLoader && pagination?.limit) {
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
  }, [pagination?.offset, pagination?.limit, isLoader, offset]);

  // getFeedForFollowingList

  const handleComment = (row: PostFeeBack) => {
    router.push(`/ideas/${row?.id}`);
  };

  const handleUserDetails = (id: string) => {
    router.push(`/ideas/profile/${id}`);
  };
  return (
    <>
      <div>
        <div className="max-w-[1450px] mx-auto px-4 pt-8 sm:pt-24 lg:pt-24">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-1">
              <div className="sticky top-30   h-fit z-50">
                <h1 className="dark:text-white text-gray-800 md:ml-0 ml-16 lg:text-3xl text-xl mb-0 mt-3">
                  Ideas
                </h1>
                <span className="dark:text-text text-text text-xs md:ml-0 ml-16">
                  Serving public conversation
                </span>
                <MobileMenu />
              </div>
            </div>
            <div className=" relative -top-8  sm:top-0 lg:col-span-4  lg:border-l dark:border-gray-700 border-gray-200 min-h-1/2">
              {/* <TabsOne /> */}
              <IdeaTabs
                allPosts={allPosts}
                fetchPostList={getListOfPost}
                setAllPosts={setAllPosts}
                handleComment={handleComment}
                isLoader={isLoader}
                handleUserDetails={handleUserDetails}
                paginationLoader={isPaginationLoader}
                setMainTabs={setMainTabs}
              />
              {/* <div className="flex items-end justify-end  text-end   text-sm pt-2 pr-3 lg:border-r dark:border-gray-600 border-gray-200">
                <div className=" cursor-pointer" onClick={handleChangePage}>
                  Show more...
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Ideas;
