import { getBookMarkList } from "@/components/service/apiService/user";
import React, { useCallback, useEffect, useState } from "react";
import IdeaTabsTwo from "../IdeaTabsTwo/page";
import { PostFeeBack } from "@/utils/typesInterface";
import { delay } from "@/utils/Content";
import MobileMenu from "../IdeaList/page";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

interface props {
  user: {
    user: {
      id: string;
    };
  };
}
export default function BookMarks() {
  const [bookMarks, setBookMarks] = useState<PostFeeBack[]>([]);
  const [iseLoader, setIsLoader] = useState(false);
  const userId = useSelector((state: props) => state?.user?.user?.id);

  const router = useRouter();
  const bookMarkList = useCallback(async () => {
    setIsLoader(true);
    try {
      const [response] = await Promise.all([
        getBookMarkList(userId),
        delay(1000),
      ]);

      if (response?.success) {
        setBookMarks(response.data ?? []);
      } else {
        setBookMarks([]);
      }
    } catch {
      setBookMarks([]);
    } finally {
      setIsLoader(false);
    }
  }, [userId]);

  useEffect(() => {
    bookMarkList();
  }, [bookMarkList]);
  // const handleComment = () => {

  // };

  const handleUserDetails = (id: string) => {
    // router.push(`/ideas/${id}`);
    // setTargetId(id);
    // setCurrentTabs("Profile");
    // Profile
  };
  const handleComment = (row: PostFeeBack) => {
    router.push(`/ideas/${row?.id}`);
  };
  return (
    <div>
      <div className="max-w-[1450px] mx-auto px-4 pt-8 sm:pt-24 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="lg:sticky top-32 z-50">
              <h1 className="dark:text-white text-gray-800 md:ml-0 ml-16 lg:text-3xl text-xl mb-0 mt-3">
                Ideas
              </h1>
              <span className="dark:text-text text-text text-xs md:ml-0 ml-16">
                Serving public conversation
              </span>
              <MobileMenu />
            </div>
          </div>
          <div className="lg:col-span-3 lg:border-l dark:border-gray-700 border-gray-200 min-h-1/2 relative -top-8  sm:top-0">
            <div className="lg:border-r dark:border-gray-700 border-gray-200 ">
              <IdeaTabsTwo
                postedList={bookMarks}
                handleComment={handleComment}
                setAllPosts={setBookMarks}
                isBookMark={true}
                loader={iseLoader}
                handleUserDetails={handleUserDetails}
                isYourPost={false}
                myPost={null}
                setCurrentTabs={null}
                setMyPost={null}
                paginationLoader={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
