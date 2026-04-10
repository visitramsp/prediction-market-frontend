import { useState } from "react";
import { truncateValue } from "@/utils/Content";

export default function MarketCard({ data = [], handleBuySell }) {
  const [openRows, setOpenRows] = useState<number[]>([]);

  const getToken =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const toggleRow = (id: number) => {
    setOpenRows(
      (prev) =>
        prev.includes(id)
          ? prev.filter((rowId) => rowId !== id) // close only this row
          : [...prev, id], // open this row
    );
  };

  return (
    <div className="w-full space-y-3">
      {data.map((row, index) => {
        const isOpen = openRows.includes(row.id);
        const pnl = Number(row?.userPosition?.pnl || 0);

        return (
          <div key={row.id} className="relative">
            {isOpen && (
              <div className="absolute delay-500 left-0 top-0 h-full w-1 rounded-lg  rounded-l-lg" /> //bg-emerald-500
            )}

            <div
              onClick={() => getToken && toggleRow(row.id)}
              className={`
    relative
    border border-gray-200 dark:border-gray-700
     px-4 py-3
    cursor-pointer
    transition-all duration-300 ease-in-out
    hover:bg-gray-100 dark:hover:bg-gray-700/60

    /* ARROW BASE */
    after:content-['']
    after:absolute
    after:left-1/2
    after:-translate-x-1/2
    after:w-0 after:h-0
    after:transition-all after:duration-300 after:ease-in-out

    ${
      isOpen
        ? `
          rounded-b-none border-b-0
          bg-gray-50 dark:bg-gray-700/40

          /* ARROW UP */
          after:top-[-8px]
          after:border-l-[8px] after:border-r-[8px] after:border-b-[8px]
          after:border-l-transparent after:border-r-transparent
          after:border-b-gray-200 dark:after:border-b-gray-700
        `
        : !getToken
          ? ""
          : `
          /* ARROW DOWN */
          after:bottom-[-8px]
          after:border-l-[8px] after:border-r-[8px] after:border-t-[8px]
          after:border-l-transparent after:border-r-transparent
          after:border-t-gray-200 dark:after:border-t-gray-700
        `
    }
  `}
            >
              <div className="md:flex items-center justify-between gap-2">
                <div className="md:flex-[2]">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <p className="font-semibold globalFonts text-base text-black dark:text-white">
                        {row?.name || "--"}
                      </p>
                      <span className="text-xs text-gray-500 font-normal globalFonts dark:text-gray-400">
                        ${truncateValue(row?.trading?.totalVolume || 0)} VOL.
                      </span>
                    </div>

                    <div className="text-lg font-semibold globalFonts text-black dark:text-white whitespace-nowrap">
                      {truncateValue(row?.price * 100, 2)}%
                    </div>
                  </div>
                </div>
                <div className="md:flex-[1]">
                  <div
                    className=" flex md:flex-col flex-row gap-2 mt-2
    md:flex-row md:mt-0 justify-end"
                    onClick={(e) => e.stopPropagation()} // prevent accordion toggle
                  >
                    {/* SELL */}
                    <button
                      onClick={() => handleBuySell(row, "sell", index)}
                      className="
    w-1/2 md:w-auto
    relative
    px-3 py-1.5 rounded-md text-sm font-medium
    bg-red-500/15 text-red-400
    border border-red-500/30
    shadow-[0_3px_0_rgba(239,68,68,0.4)]
    transition-all duration-150 ease-in-out
    hover:bg-red-500/25
    active:translate-y-[2px]
    active:shadow-[0_1px_0_rgba(239,68,68,0.4)] globalFonts
  "
                    >
                      Sell ${truncateValue(row?.price)}
                    </button>

                    {/* BUY */}
                    <button
                      onClick={() => handleBuySell(row, "buy", index)}
                      className="
     w-1/2 md:w-auto
    relative
    px-3 py-1.5 rounded-md text-sm font-medium
    bg-emerald-500/15 text-emerald-400
    border border-emerald-500/30
    shadow-[0_3px_0_rgba(16,185,129,0.4)]
    transition-all duration-150 ease-in-out
    hover:bg-emerald-500/25
    active:translate-y-[2px]
    active:shadow-[0_1px_0_rgba(16,185,129,0.4)] globalFonts
  "
                    >
                      Buy ${truncateValue(row?.price)}
                    </button>
                  </div>
                </div>

                <div> </div>
              </div>
            </div>

            <div
              className={`
                grid transition-all duration-300 ease-in-out origin-top
                ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }
              `}
            >
              <div className="overflow-hidden">
                <div
                  className="
                    border border-gray-200 dark:border-gray-700
                    border-t-0 rounded-b-lg
                    p-4 bg-gray-50 dark:bg-gray-800
                  "
                >
                  {/* HEADER */}
                  <div className="flex text-xs font-semibold text-gray-600 dark:text-gray-300 border-b dark:border-gray-700 pb-2 mb-2">
                    <div className="w-1/3 text-left globalFonts">Invested</div>
                    <div className="w-1/3 text-center globalFonts">PNL</div>
                    <div className="w-1/3 text-right globalFonts">Shares</div>
                  </div>

                  {/* VALUES */}
                  <div className="flex text-sm items-center">
                    <div className="w-1/3 text-left text-gray-700 globalFonts dark:text-gray-300">
                      {(row.userPosition?.invested ?? 0) > 0
                        ? `$${truncateValue(row.userPosition?.invested, 2)}`
                        : "--"}
                    </div>

                    <div
                      className={`w-1/3 text-center font-semibold globalFonts ${
                        pnl < 0 ? "text-red-500" : "text-emerald-500"
                      }`}
                    >
                      {pnl !== 0 ? `$${truncateValue(pnl, 2)}` : "--"}
                    </div>

                    <div className="w-1/3 text-right globalFonts text-gray-700 dark:text-gray-300">
                      {(row.userPosition?.shares ?? 0) > 0
                        ? truncateValue(row.userPosition?.shares, 2)
                        : "--"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* ===================== END ===================== */}
          </div>
        );
      })}
    </div>
  );
}
