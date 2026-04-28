"use client";
import { getGraphData } from "@/components/service/apiService/buySell";
import { GraphData } from "@/utils/typesInterface";
import { useState, useEffect, useRef, useCallback } from "react";
import StackedAreaChart from "../../detail/component/realTimeChart";
import { fetchTopTenQuestions } from "@/components/service/apiService/user";
import moment from "moment";
import { truncateValue } from "@/utils/Content";

let accent = "#34d399";
let accent2 = "#60a5fa";

const SLIDE_DURATION = 5000;

// ─── Animated Bar ────────────────────────────────────────────────────────────
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

// ─── MAIN ───────────────────────────────────────────────────────────────────
export default function HeroSection() {
  const [questionData, setQuestionData] = useState<any>({});
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);

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

  return (
    <div className="flex flex-col items-center justify-center font-mono">
      {/* Card */}
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="w-full bg-[#090912]/40 border border-[var(--color-borderlight)]
                        dark:border-[var(--color-borderdark)] rounded-2xl overflow-hidden"
      >
        <div key={animKey} className="flex relative flex-wrap h-[500px]">
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
          <div className="flex-1 min-w-[260px] p-6 flex flex-col gap-4 border-r border-[var(--color-borderlight)] dark:border-[var(--color-borderdark)]">
            {/* TAGS */}
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] font-bold tracking-wider px-2 py-[2px] rounded"
                  style={{
                    color: accent,
                    background: accent + "18",
                  }}
                >
                  {slide?.category_name}
                </span>

                {/* <span className="text-white/20 text-xs">●</span>

                <span className="text-[10px] px-2 py-[2px] rounded bg-white/10 text-white/50">
                  {slide?.sub}
                </span> */}
              </div>

              {/* NAV */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="w-7 h-7 bg-white/10 rounded"
                >
                  ‹
                </button>

                <span className="text-xs text-white/40">
                  {current + 1}/{questionDataFilter.length || 0}
                </span>

                <button
                  onClick={handleNext}
                  className="w-7 h-7 bg-white/10 rounded"
                >
                  ›
                </button>
              </div>
            </div>

            {/* QUESTION */}
            <h2 className="text-white text-lg font-bold leading-snug">
              {slide?.question}
            </h2>

            <div className="text-xs text-white/40">
              Resolves {slide?.resolves} •{" "}
              <span className="text-yellow-400 font-bold ml-1">
                ⏱ {slide?.date ? moment(slide.date).format("MMM YYYY") : ""}
              </span>
            </div>

            {/* SERIES */}
            <div>
              {(slide?.series || []).map((label, i) => {
                const val = (label?.price || 0) * 100;
                const color = i === 0 ? accent2 : accent;

                return (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">{label?.name}</span>
                      <span style={{ color }} className="font-bold">
                        {truncateValue(val, 1)}%
                      </span>
                    </div>

                    <AnimatedBar value={val} color={color} trigger={animKey} />
                  </div>
                );
              })}
            </div>

            {/* FOOTER */}
            <div className="flex justify-between text-sm text-white/50 border-t border-white/10 pt-3 mt-auto">
              <span>${slide?.total_cost || "0"} Vol</span>
              <span>{slide?.series?.length || "0"} markets</span>
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

            <div className="flex items-center justify-between gap-4 w-full">
              <button
                className="flex-1 py-2 rounded-lg border font-bold text-xs"
                style={{
                  color: accent,
                  borderColor: accent,
                  background: accent + "18",
                }}
              >
                {" "}
                {slide?.series?.[0]?.name}{" "}
                {truncateValue(slide?.series?.[0]?.price * 100, 1)}%{" "}
              </button>

              <button
                className="flex-1 py-2 rounded-lg border font-bold text-xs"
                style={{
                  color: accent2,
                  borderColor: accent2,
                  background: accent2 + "18",
                }}
              >
                {" "}
                {slide?.series?.[1]?.name}{" "}
                {truncateValue(slide?.series?.[1]?.price * 100, 1)}%{" "}
              </button>
            </div>

            <button
              className="w-full py-3 rounded-lg font-bold tracking-wider"
              style={{
                color: accent,
                border: `1px solid ${accent}`,
                background: accent + "20",
              }}
            >
              {" "}
              PLACE BET{" "}
            </button>
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
