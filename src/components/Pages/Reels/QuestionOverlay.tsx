"use client";
import React from "react";
import { LinkedQuestion } from "@/utils/typesInterface";
import { FaTimes, FaArrowRight } from "react-icons/fa";
import { MdQuiz } from "react-icons/md";
import { useRouter } from "next/navigation";

interface QuestionOverlayProps {
  question: LinkedQuestion | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuestionOverlay: React.FC<QuestionOverlayProps> = ({
  question,
  isOpen,
  onClose,
}) => {
  const router = useRouter();

  if (!isOpen || !question) return null;

  const handleGoToQuestion = () => {
    onClose();
    router.push(`/market/${question.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#1a1f2e] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700/50 animate-scale-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <FaTimes className="text-gray-400 text-sm" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 bg-gradient-to-br from-[#8160EE] to-[#5d31ec] rounded-xl flex items-center justify-center shadow-lg shadow-[#c8aa76]/20">
            <MdQuiz className="text-white text-xl" />
          </div>
          <div>
            <p className="text-xs text-[#8160EE] font-bold uppercase tracking-wider">
              Prediction Market
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {question.status === "active" || question.status === "OPEN"
                ? "Active"
                : question.status}
              {question.endDate &&
                ` · Ends ${new Date(question.endDate).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-3">
          {question.question}
        </h3>

        {question.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 line-clamp-3 leading-relaxed">
            {question.description}
          </p>
        )}

        <button
          onClick={handleGoToQuestion}
          className="w-full bg-gradient-to-r from-[#8160EE] to-[#6137eb] hover:from-[#7048f1] hover:to-[#4f1afd]  text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#c8aa76]/20"
        >
          Predict Now <FaArrowRight className="text-sm " />
        </button>
      </div>
    </div>
  );
};

export default QuestionOverlay;
