import { fetchCategoryWithQuestions } from "@/components/service/apiService/user";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// ─── Mini SVG Sparkline ─────────────────────────────────────
const MiniChart = ({ color, points }) => {
  const w = 50,
    h = 30;

  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const min = Math.min(...points);
  const max = Math.max(...points);

  const ys = points.map((p) => h - ((p - min) / (max - min + 1)) * (h - 6) - 3);

  const path = xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`)
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const noPoints = [50, 52, 55, 53, 57, 60, 62, 65, 63, 68, 70, 72];
const yesPoints = [50, 48, 45, 47, 43, 40, 38, 35, 37, 32, 30, 28];

// ─── Card ─────────────────────────────────────
const PredictionCard = ({ card, handleRedirect }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden rounded-2xl p-5  cursor-pointer transition-all duration-300 
      ${
        hovered
          ? "border border-indigo-400/40 shadow-[0_0_0_1px_rgba(129,140,248,0.15),0_8px_40px_rgba(129,140,248,0.15)] -translate-y-1"
          : "border border-[var(--color-borderlight)] dark:border-[var(--color-borderdark)] shadow-xl "
      }`}
    >
      <div
        className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(129,140,248,0.08) 0%, transparent 65%)",
        }}
      />
      <div className="flex gap-3 mb-4">
        <img
          src={
            "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=60&h=60&fit=crop"
          }
          alt=""
          className="w-11 h-11 rounded-lg object-cover shrink-0"
        />
        <p className="text-slate-200 text-sm font-semibold leading-6">
          {card.question || "--"}
        </p>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-4">
        <span>
          Resolves{" "}
          {card?.endDate ? moment(card.endDate).format("MMM YYYY") : ""}
        </span>
        <span>·</span>
        <span className="text-violet-400">
          {card?.stats?.totalVolume || "0"}
        </span>
        <span className="ml-auto">{card?.options?.length || 0} mrkts</span>
      </div>

      <div className="h-px bg-white/5 mb-4" />

      <div className="flex items-center gap-2 mb-3">
        <div className="w-[50%] flex items-center">
          <span className="text-gray-400 text-xs w-7 shrink-0">No</span>
          <MiniChart color="#22c55e" points={noPoints} />
        </div>
        <span className="ml-auto text-green-500 font-bold text-[15px]">
          {33}%
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-[50%] flex items-center">
          <span className="text-gray-400 text-xs w-7 shrink-0">Yes</span>
          <div className="overflow-hidden transition-all duration-300 w-[50px] opacity-100">
            <MiniChart color="#3b82f6" points={yesPoints} />
          </div>
        </div>

        <div className="w-[50%] flex items-center justify-between">
          <div
            className={`flex w-fit justify-start relative -left-14 transition-all duration-300 ${
              hovered
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-2 scale-95"
            }`}
          >
            <button
              onClick={() => handleRedirect(card)}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-400 to-indigo-600 text-white text-xs font-bold tracking-wider shadow-lg"
            >
              TRADE NOW
            </button>
          </div>
          <span className="text-blue-400 font-bold text-[15px]">{66}%</span>
        </div>
      </div>
    </div>
  );
};

// ─── Arrow Btn ─────────────────────────────────────
const ArrowBtn = ({ direction, onClick, disabled, classNames }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 z-50 rounded-full flex items-center justify-center border transition-all
      ${
        disabled
          ? "border-white/10 bg-[#0f0f16] text-gray-700 cursor-not-allowed"
          : "border-white/10 bg-[#08080c] text-indigo-400 hover:bg-indigo-500/25"
      } ${classNames}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === "left" ? (
          <polyline points="15 18 9 12 15 6" />
        ) : (
          <polyline points="9 18 15 12 9 6" />
        )}
      </svg>
    </button>
  );
};

// ─── Category Row (independent scroll state per row) ─────────────────────────
const CategoryRow = ({ row, handleRedirect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const VISIBLE = 3;
  const maxIndex = Math.max(0, (row?.questions?.length || 0) - VISIBLE);

  return (
    <div className="py-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-indigo-400 rounded" />
          <span className="text-slate-200 font-bold text-xl">
            {row?.name || "--"}
          </span>
          <span className="px-2 py-0.5 text-[11px] rounded-full bg-[#1e2235] text-gray-500 font-semibold">
            {row?.total_questions || 0}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="text-indigo-400 text-sm flex items-center gap-1 ml-2"
          >
            View All →
          </a>
        </div>
      </div>

      {/* Cards */}
      <div className="flex items-center  relative">
        <ArrowBtn
          direction="left"
          onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
          disabled={currentIndex === 0}
          classNames={"absolute -left-4"}
        />
        <div className="grid grid-cols-3 w-full gap-4">
          {row?.questions
            .slice(currentIndex, currentIndex + VISIBLE)
            .map((card, i) => (
              <PredictionCard
                key={i}
                card={card}
                handleRedirect={handleRedirect}
              />
            ))}
        </div>
        <ArrowBtn
          direction="right"
          onClick={() => setCurrentIndex((p) => Math.min(maxIndex, p + 1))}
          disabled={currentIndex >= maxIndex}
          classNames={"absolute -right-4"}
        />
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────
export default function CardSection() {
  const [questionData, setQuestionData] = useState([]);
  const router = useRouter();
  const getFilterQuestion = useCallback(async () => {
    const response = await fetchCategoryWithQuestions();
    if (response?.success) {
      setQuestionData(response.data || []);
    } else {
      setQuestionData([]);
    }
  }, []);

  useEffect(() => {
    getFilterQuestion();
  }, [getFilterQuestion]);

  const handleRedirect = (rows) => {
    console.log(rows, "rowsssss");
    router.push(`/markets/${rows?.id}`);
  };

  return (
    <>
      {questionData
        ?.filter((item) => item?.name !== "All")
        ?.map((row, index) => (
          <CategoryRow
            key={row?.id || index}
            row={row}
            handleRedirect={handleRedirect}
          />
        ))}
    </>
  );
}
