import React from "react";
import MobileMenu from "../IdeaList/page";

export default function Replies() {
  return (
    <div>
      <div className="max-w-[880px] xl:max-w-[1450px] mx-auto px-4 pt-8 sm:pt-24 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="lg:sticky top-30 dark:border-gray-700">
              <h1 className="dark:text-white text-gray-800 md:ml-0 ml-16 lg:text-3xl text-xl mb-0 mt-3">
                Ideas
              </h1>
              <span className="dark:text-text text-text text-xs md:ml-0 ml-16">
                Serving public conversation
              </span>
              <MobileMenu />
            </div>
          </div>
          <div className="lg:col-span-3 lg:border-l dark:border-gray-700 border-gray-200 min-h-1/2">
            <div className="lg:border-r dark:border-gray-700 border-gray-200">
              <div className="flex mt-44 items-center justify-center text-black dark:text-white">
                Replies
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
