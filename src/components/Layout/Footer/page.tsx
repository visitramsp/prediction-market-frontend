import React from "react";
import Image from "next/image";
import { Crown } from "lucide-react";

const Footer = ({ isPosition }) => {
  return (
    <>
      <div className="pt-16 lg:pt-30 pb-10 bg-bglight dark:bg-bgdark">
        <div
          className={`
    
    transition-[max-width,padding] duration-500 ease-in-out 
    mx-auto md:pt-1 py-0 h-auto w-full
    ${isPosition ? "max-w-full px-10" : "max-w-[1450px] px-4"}
  `}
        >
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="col-span-2 md:col-span-1">
              <a href="#">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="hidden md:block text-xl font-bold">
                    {/* Light mode logo */}
                    {/* <Image
                      src="/img/opinionLogo-light.png"
                      alt="Opinion logo"
                      width={60}
                      height={60}
                      className="h-auto block"
                      priority
                    /> */}
                    <p className="text-text text-[16px] font-bold">
                      <Crown className="w-6 h-6 relative -top-1 inline-block" />{" "}
                      OPINION KINGS
                    </p>
                  </div>
                </div>
              </a>
              <hr className="my-5 border-b dark:border-gray-600 border-gray-300" />
              <div className="text-end flex items-center gap-3 mt-4 mr-12">
                <a href="#" className="inline-block">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 1227"
                    className="w-5 h-5 fill-gray-600 dark:fill-white/80 hover:fill-[#c7ac77] transition-colors duration-300 dark:hover:fill-gray-300"
                  >
                    <path
                      d="M714.163 519.284L1160.89 0H1051.61L670.79 442.357 368.573 0H0L468.769 681.821 0 1226.37h109.285l403.16-471.205 317.712 471.205H1200L714.163 519.284ZM568.89 691.351l-46.55-67.251L148.727 
           79.694h159.241l298.857 431.865 46.55 67.251 395.775 571.755H889.909L568.89 691.351Z"
                    />
                  </svg>
                </a>

                <a href="#" className="inline-block mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    className="w-6 h-6 fill-gray-600 dark:fill-white/80 hover:fill-[#c7ac77] transition-colors duration-300 dark:hover:fill-gray-300"
                  >
                    <path
                      d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35
             12.42-50.06 52.24-50.06h40.42V6.26S293.3 0 268.1
             0c-73.29 0-121.1 44.38-121.1 124.72v70.62H86.41V288h60.59v224h92.66V288z"
                    />
                  </svg>
                </a>

                <a href="#" className="mr-2 inline-block">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    className="w-6 h-6 fill-gray-600 dark:fill-white/80 hover:fill-[#c7ac77] transition-colors duration-300 dark:hover:fill-gray-300"
                  >
                    <path
                      d="M224.1 141c-63.6 0-114.9 51.3-114.9
           114.9s51.3 114.9 114.9 114.9 114.9-51.3
           114.9-114.9S287.7 141 224.1 141zm0
           190.5c-41.8 0-75.6-33.8-75.6-75.6s33.8-75.6
           75.6-75.6 75.6 33.8 75.6 75.6-33.8 75.6-75.6
           75.6zm146.4-194.3c0 14.9-12 26.9-26.9
           26.9s-26.9-12-26.9-26.9 12-26.9
           26.9-26.9 26.9 12 26.9 26.9zm76.1
           27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9
           0-35.9 1.7-67.7 9.9-93.9 36.2-26.2
           26.2-34.4 58-36.2 93.9-2.1 37-2.1
           147.9 0 184.9 1.7 35.9 9.9 67.7
           36.2 93.9 26.2 26.2 58 34.4 93.9
           36.2 37 2.1 147.9 2.1 184.9 0
           35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2
           34.4-58 36.2-93.9 2.1-37 2.1-147.9
           0-184.9zM398.8 388c-7.8 19.6-22.9
           34.7-42.6 42.6-29.5 11.7-99.5
           9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7
           9-132.1c7.8-19.6 22.9-34.7
           42.6-42.6 29.5-11.7 99.5-9
           132.1-9s102.7-2.6 132.1 9c19.6
           7.8 34.7 22.9 42.6 42.6 11.7
           29.5 9 99.5 9 132.1s2.6 102.7-9
           132.1z"
                    />
                  </svg>
                </a>
              </div>
              <div className="text-end"></div>
            </div>
            <div className="inline-block mr-0 md:ml-10">
              <h4 className="font-bold mb-3 text-black/80 dark:text-white/80">
                Links
              </h4>
              <ul className="text-sm leading-7 text-gray-600 dark:text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Market Data
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Opinion
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Audio
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Magazines
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Events
                  </a>
                </li>
              </ul>
            </div>
            <div className="mr-0 md:ml-10">
              {" "}
              <h4 className="font-bold mb-3 text-black/80 dark:text-white/80">
                News
              </h4>
              <ul className="text-sm leading-7 text-gray-600 dark:text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Market
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Economics
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Technology
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Politics
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Crypto
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    AI
                  </a>
                </li>
              </ul>
            </div>
            <div className="mr-0 md:ml-10">
              {" "}
              <h4 className="font-bold mb-3 text-black/80 dark:text-white/80">
                Sports
              </h4>
              <ul className="text-sm leading-7 text-gray-600 dark:text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Cricket
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Football
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Tennis
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Badminton
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Swimming
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Golf
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Skydiving
                  </a>
                </li>
              </ul>
            </div>
            <div className="mr-0 md:ml-10">
              {" "}
              <h4 className="font-bold mb-3 text-black/80 dark:text-white/80">
                Crypto
              </h4>
              <ul className="text-sm leading-7 text-gray-600 dark:text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Bitcoin
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Ethereum
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Binance
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Tether
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Solana
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    TRX
                  </a>
                </li>
              </ul>
            </div>
            <div className="mr-0 md:ml-10">
              {" "}
              <h4 className="font-bold mb-3 text-black/80 dark:text-white/80">
                Trending
              </h4>
              <ul className="text-sm leading-7 text-gray-600 dark:text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Trump
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Middle East
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Politics
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Culture
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    World
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#c7ac77]">
                    Election
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <hr className="my-5 border-t-0 border-b dark:border-gray-600 border-gray-300 h-2" />
          <p className="text-center text-[13px] text-[#868e98]">
            &copy;2026{" "}
            <span className="font-bold dark:text-muted text-muted">
              Opinion Kings
            </span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
};

export default Footer;
