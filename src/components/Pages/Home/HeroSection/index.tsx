"use client";
import { getGraphData } from "@/components/service/apiService/buySell";
import { GraphData } from "@/utils/typesInterface";
import { useState, useEffect, useRef, useCallback } from "react";
import StackedAreaChart from "../../detail/component/realTimeChart";
import { fetchTopTenQuestions } from "@/components/service/apiService/user";
import moment from "moment";
import { truncateValue } from "@/utils/Content";
import toast from "react-hot-toast";
import { FaBookmark, FaLink, FaRegBookmark } from "react-icons/fa";
import { useRouter } from "next/navigation";

let accent = "#34d399";
let accent2 = "#60a5fa";

const SLIDE_DURATION = 5000;

function AnimatedBar({ value, color, trigger }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(0);
    const t = setTimeout(() => setWidth(value || 0), 120);
    return () => clearTimeout(t);
  }, [value, trigger]);

  return (
    <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{
          width: `${width}%`,
          background: color,
          boxShadow: `0 0 10px ${color}70`,
        }}
      />
    </div>
  );
}

const ButtonComponent = ({ slide, setPrice }) => {
  const [topSelected, setTopSelected] = useState(0);
  const [bottomSelected, setBottomSelected] = useState(0); // 0 = YES, 1 = NO

  const yesColor = "#22c55e"; // green
  const noColor = "#ef4444"; // red

  const activeColor = bottomSelected === 0 ? "#0CAC78" : noColor;
  const [value, setValue] = useState(28);
  const sliderRef = useRef(null);
  const BASE = {
    contracts: 28,
    cost: 4.74,
    fee: 0.09,
    profit: 23.26,
    max: 100,
  };
  const ratio = value / BASE.contracts;
  const cost = (BASE.cost * ratio).toFixed(2);
  const fee = (BASE.fee * ratio).toFixed(2);
  const profit = (BASE.profit * ratio).toFixed(2);
  const pct = (value / BASE.max) * 100;

  const handleChange = useCallback((e) => {
    setValue(Number(e.target.value));
  }, []);

  const disableColor = value <= 10 ? true : false;

  useEffect(() => {
    setPrice(value);
  }, [value]);
  return (
    <div className="w-full space-y-3">
      {/* ───────── TOP SECTION ───────── */}
      <div className="flex gap-3">
        {slide?.series?.map((item, i) => {
          const isActive = topSelected === i;

          return (
            <button
              key={i}
              onClick={() => setTopSelected(i)}
              className="px-4 text-nowrap py-2 rounded-xl text-xs font-semibold border transition-all duration-200"
              style={{
                color: yesColor,
                borderColor: yesColor,
                background: isActive ? yesColor + "22" : "transparent",
              }}
            >
              {item?.name} - {truncateValue(item?.price * 100, 1)}%
            </button>
          );
        })}
      </div>
      <div className="flex gap-3 w-full">
        <button
          onClick={() => setBottomSelected(0)}
          className="flex-1 py-2 rounded-xl border text-xs font-bold uppercase transition-all"
          style={{
            color: "#0CAC78",
            borderColor: "#0CAC78",
            background: bottomSelected === 0 ? "#0CAC78" + "22" : "transparent",
          }}
        >
          YES
        </button>

        <button
          onClick={() => setBottomSelected(1)}
          className="flex-1 py-2 rounded-xl border text-xs font-bold uppercase transition-all"
          style={{
            color: noColor,
            borderColor: noColor,
            background: bottomSelected === 1 ? noColor + "22" : "transparent",
          }}
        >
          NO
        </button>
      </div>

      <div className="rounded-lg w-full max-w-2xl font-sans select-none">
        {/* Top row: label + slider + max */}
        <div className="flex justify-between items-center">
          <span className="text-[#888] text-[13px] whitespace-nowrap">
            {value} contracts
          </span>
          <span className="text-[#555] text-[13px] whitespace-nowrap">
            {BASE.max} max
          </span>
        </div>
        <div className="flex items-center gap-3 mb-1">
          <div className="relative flex-1 h-8 flex items-center">
            {/* Track */}
            <div className="absolute inset-x-0 h-[25px] border border-[#333]/50 bg-[#333]/30 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-none"
                style={{
                  width: `${pct}%`,
                  background: activeColor + "40",
                }}
              />
            </div>

            {/* Knob */}
            <div
              className="absolute z-10 h-6 w-6 flex items-center justify-center 
                 px-2 py-[2px] rounded-full text-[8px] font-semibold 
                 text-white shadow-lg backdrop-blur-md border border-white/10"
              style={{
                // Improved positioning - stays inside track
                left: `clamp(2px, calc(${pct}% - 12px), calc(100% - 24px))`,
                background: `linear-gradient(135deg, ${disableColor ? "#333" : activeColor}, ${disableColor ? "#333" : activeColor}aa)`,
                boxShadow: `0 4px 12px ${disableColor ? "#333" : activeColor}40`,
              }}
            >
              {value}
            </div>

            {/* Range Input */}
            <input
              ref={sliderRef}
              type="range"
              min={0}
              max={BASE.max}
              step={1}
              value={value}
              onChange={handleChange}
              className="absolute inset-x-0 w-full h-8 opacity-0 cursor-pointer z-20"
            />
          </div>
        </div>
        {/* Bottom row: cost/fee + profit */}
        {value > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[#ccc] text-[13px]">
                Cost <span className="text-white font-medium">${cost}</span>
              </span>
              <span className="text-[#555] text-[13px]">
                Fee <span className="text-[#888]">${fee}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#22c55e] text-[13px] font-medium">
                +${profit}
              </span>
              <span className="text-[#555] text-[13px]">$0.00</span>
            </div>
          </div>
        )}
      </div>
      {value > 0 && (
        <button
          className="w-full py-2 rounded-lg font-bold tracking-wider transition-all"
          style={{
            color: activeColor,
            border: `1px solid ${activeColor}`,
            background: activeColor + "20",
          }}
        >
          {bottomSelected == 0 ? "Buy" : "Sell"}
        </button>
      )}
    </div>
  );
};

export default function HeroSection() {
  const [questionData, setQuestionData] = useState<any>({});
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [price, setPrice] = useState(0);

  const progressRef = useRef<any>(null);
  const startTimeRef = useRef<number | null>(null);

  const [graphData, setGraphData] = useState<GraphData>({
    series: [],
  });

  const [timeInterval, setTimeInterval] = useState("all");

  // ─── GRAPH API ───
  const getGraphDetails = useCallback(async () => {
    const response = await getGraphData("6", timeInterval);
    if (response?.success) {
      setGraphData(response.data);
    } else {
      setGraphData({ series: [] });
    }
  }, [timeInterval]);

  useEffect(() => {
    getGraphDetails();
  }, [getGraphDetails]);

  // ─── QUESTION API ───
  const getTopTenQuestion = useCallback(async () => {
    const response = await fetchTopTenQuestions();
    if (response?.success) {
      setQuestionData(response.data || {});
    } else {
      setQuestionData({});
    }
  }, []);

  useEffect(() => {
    getTopTenQuestion();
  }, [getTopTenQuestion]);

  // ─── SAFE ARRAY ───
  const questionDataFilter = questionData?.graph || [];

  // 🔥 FIX: SAFE SLIDE (IMPORTANT)
  const slide =
    questionDataFilter.length > 0 ? questionDataFilter[current] : {};

  // ─── GO TO SLIDE ───
  const goTo = useCallback((idx: number) => {
    setAnimKey((k) => k + 1);
    setCurrent(idx);
    setProgress(0);
    startTimeRef.current = performance.now();
  }, []);

  // ─── AUTO SLIDE (FIXED) ───
  useEffect(() => {
    if (paused || questionDataFilter.length === 0) return;

    startTimeRef.current = performance.now();

    const tick = () => {
      if (!startTimeRef.current) return;

      const elapsed = performance.now() - startTimeRef.current;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);

      setProgress(pct);

      if (pct >= 100) {
        setCurrent((c) => (c + 1) % questionDataFilter.length);
        setAnimKey((k) => k + 1);
        startTimeRef.current = performance.now();
      }

      progressRef.current = requestAnimationFrame(tick);
    };

    progressRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(progressRef.current);
  }, [paused, questionDataFilter.length]);

  // ─── BUTTONS ───
  const handlePrev = () => {
    if (!questionDataFilter.length) return;
    const n =
      (current - 1 + questionDataFilter.length) % questionDataFilter.length;
    goTo(n);
  };

  const handleNext = () => {
    if (!questionDataFilter.length) return;
    const n = (current + 1) % questionDataFilter.length;
    goTo(n);
  };

  console.log(slide, "slide");
  const router = useRouter();
  const handleCopyMarketLink = async (id) => {
    try {
      const linkOfRef = `http://localhost:3000/market/${id}`;
      await navigator.clipboard.writeText(linkOfRef);
      toast.success("🔗 Link Copied Successfully!");
    } catch (error) {
      toast.error("❌ Failed to copy link");
    }
  };
  const handleRedirectMarket = () => {
    router.push(`markets/${slide?.questionId}`);
  };

  console.log(price, "price");

  return (
    <div className="flex flex-col items-center justify-center font-mono">
      {/* Card */}
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="w-full bg-[#090912]/40 border border-[var(--color-borderlight)]
                        dark:border-[var(--color-borderdark)] rounded-2xl overflow-hidden"
      >
        <div key={animKey} className="flex relative flex-wrap ">
          {/* PROGRESS BAR */}
          <div
            className="h-[1px] absolute bottom-0"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${accent2}, ${accent})`,
              boxShadow: `0 0 10px ${accent}`,
            }}
          />

          {/* LEFT */}
          <div
            className="flex-1 min-w-[280px] p-6 flex flex-col gap-5 
  border-r border-white/10 "
          >
            {/* HEADER */}
            <div className="flex items-center justify-between">
              {/* TAGS */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] font-semibold tracking-widest px-3 py-[4px] rounded-full 
        border border-white/10 backdrop-blur-md"
                  style={{
                    color: "white",
                  }}
                >
                  {slide?.category_name}
                </span>

                <span className="w-1 h-1 rounded-full bg-white/30" />

                <span
                  className="text-[10px] px-3 py-[4px] rounded-full 
        bg-green-500/10 text-green-400 border border-green-500/20"
                >
                  ● Live
                </span>
              </div>

              {/* NAV */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition"
                >
                  ‹
                </button>

                <span className="text-xs text-white/40">
                  {current + 1}/{questionDataFilter.length || 0}
                </span>

                <button
                  onClick={handleNext}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition"
                >
                  ›
                </button>
              </div>
            </div>

            {/* QUESTION */}
            <h2
              onClick={handleRedirectMarket}
              className="text-white text-xl cursor-pointer font-semibold leading-snug tracking-tight"
            >
              {slide?.question}
            </h2>

            {/* META */}
            <div className="flex items-center gap-3 text-xs text-white/40">
              <span>Resolves {slide?.resolves}</span>
              <span className="text-yellow-400 font-medium">
                ⏱ {slide?.date ? moment(slide.date).format("MMM YYYY") : ""}
              </span>
            </div>

            {/* SERIES */}
            <div className="flex flex-col gap-4 mt-1">
              {(slide?.series || []).map((label, i) => {
                const val = (label?.price || 0) * 100;
                const color = i === 0 ? accent2 : accent;

                return (
                  <div key={i} className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/90 font-medium">
                        {label?.name}
                      </span>

                      <span className="font-bold text-sm" style={{ color }}>
                        {truncateValue(val, 1)}%
                      </span>
                    </div>

                    <div className="relative">
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${val}%`,
                            background: `linear-gradient(90deg, ${color}, ${color}99)`,
                            boxShadow: `0 0 12px ${color}40`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/10">
              <div className="text-sm text-white/60">
                <span className="text-purple-400">$</span>{" "}
                {Math.floor(slide?.total_cost || 0) || "0"}{" "}
                <span className="text-white/40">Vol</span>
              </div>

              <div className="flex items-center gap-4 text-white/60">
                <span className="text-xs">
                  {slide?.series?.length || 0} markets
                </span>

                <FaLink
                  onClick={() => handleCopyMarketLink(slide?.questionId)}
                  className="hover:text-blue-400 cursor-pointer transition"
                />

                <span className="cursor-pointer hover:scale-110 transition">
                  {!slide?.isBookmark ? (
                    <FaRegBookmark className="text-white/40 hover:text-purple-400" />
                  ) : (
                    <FaBookmark className="text-purple-400" />
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex-1 min-w-[260px] p-6 flex flex-col gap-4">
            <span className="text-gray-500 w-full">
              <StackedAreaChart
                data={graphData?.series}
                setTimeIntervalValue={setTimeInterval}
                timeIntervalValue={timeInterval}
              />
            </span>

            <ButtonComponent slide={slide} setPrice={setPrice} />

            {/* <button
              className="w-full py-3 rounded-lg font-bold tracking-wider"
              style={{
                color: accent,
                border: `1px solid ${accent}`,
                background: accent + "20",
              }}
            >
              {" "}
              PLACE BET{" "}
            </button> */}
          </div>
        </div>
      </div>

      {/* DOTS */}
      <div className="flex gap-2 mt-3 w-[300px] mx-auto items-center justify-center ">
        {questionDataFilter.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === current ? 24 : 6,
              background:
                i === current
                  ? `linear-gradient(90deg, ${accent2}, ${accent})`
                  : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
