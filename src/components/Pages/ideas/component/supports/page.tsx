import React from "react";
import MobileMenu from "../IdeaList/page";
import Link from "next/link";

export default function Supports() {
  return (
    <div>
      <div className="max-w-[880px] xl:max-w-[1450px] mx-auto px-4 pt-8 sm:pt-24 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="lg:sticky top-32 dark:border-gray-700">
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
            <div className="lg:border-r dark:border-gray-700 border-gray-200">
              <div className="md:p-4 p-3">
                <p className="text-xl dark:text-white mb-3 font-semibold text-center w-full">
                  Support
                </p>
                <div className="md:max-w-[80%] mx-auto">
                  <p className="text-center">
                    Reach out to us at{" "}
                    <a
                      href="mailto:support@opinionkings.com"
                      className="text-blue-500 underline"
                    >
                      support@opinionkings.com
                    </a>{" "}
                    and we will get back to you as soon as possible.
                  </p>
                  <p className="text-center">
                    We have a dedicated, global team ready to assist you with
                    any issues or questions you might have. Our support team is
                    100% human and here to help.
                  </p>
                </div>
                <p className="font-bold text-lg my-4">Help us help you</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <span className="font-bold">Be Detailed:</span> Send us a
                    clear description of the issue you are facing.
                  </li>
                  <li>
                    <span className="font-bold">Visuals Matter:</span> Attach a
                    screenshot or screen recording if possible (this helps us
                    resolve issues much faster).
                  </li>
                  <li>
                    <span className="font-bold">Be Detailed:</span> Send us a
                    clear description of the issue you are facing.
                  </li>
                  <li>
                    <span className="font-bold">Be Kind:</span> Please be
                    respectful we are real people working hard to help you.
                  </li>
                </ul>
                <p className="text-center border border-[var(--color-borderlight)]   dark:border-[var(--color-borderdark)] my-4 p-3 rounded-lg md:max-w-[80%] mx-auto">
                  <span className="block font-bold">Quick Note:</span> Sending
                  multiple emails for the same issue can slow down our response
                  time. It&apos;s best to include all relevant details in a
                  single message!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
