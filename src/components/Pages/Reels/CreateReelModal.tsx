"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  FaTimes,
  FaCloudUploadAlt,
  FaVideo,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import { createReel } from "@/components/service/apiService/reels";
import { questionDetails } from "@/components/service/apiService/category";
import toast from "react-hot-toast";
import VideoRecorder from "./VideoRecorder";
import { VIDEO_FILTERS } from "./videoFilters";

interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const STEP_LABELS = ["Capture", "Edit", "Details", "Review"];
const MAX_CAPTION = 500;
const SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB — output must be under this
const UPLOAD_LIMIT = 120 * 1024 * 1024; // 120 MB — max upload acceptance
const MAX_TRIMMED_DURATION = 60; // seconds
const TARGET_OUTPUT_BYTES = 9 * 1024 * 1024; // 9 MB target (1 MB buffer)

const CreateReelModal: React.FC<CreateReelModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  // Wizard
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"upload" | "record">("upload");

  // Video
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isRecordedVideo, setIsRecordedVideo] = useState(false);

  // Trim
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // Edit
  const [selectedFilterId, setSelectedFilterId] = useState("normal");

  // Details
  const [caption, setCaption] = useState("");
  const [questionId, setQuestionId] = useState("");

  // Upload
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);

  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [questionOptions, setQuestionOptions] = useState<
    { id: number; name: string; price: number }[]
  >([]);
  const [questionInvalid, setQuestionInvalid] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const selectedFilter =
    VIDEO_FILTERS.find((f) => f.id === selectedFilterId) || VIDEO_FILTERS[0];

  const trimmedDuration = trimEnd - trimStart;
  const trimmedDurationValid =
    trimmedDuration >= 1 && trimmedDuration <= MAX_TRIMMED_DURATION;

  // --- Quality estimation ---
  const estimatedBitrate =
    trimmedDuration > 0
      ? Math.round((TARGET_OUTPUT_BYTES * 8) / trimmedDuration)
      : 0;

  const getQualityWarning = (): {
    type: "info" | "warn" | "error";
    message: string;
  } | null => {
    if (!file || file.size <= SIZE_LIMIT) return null;
    if (
      file.size > 80 * 1024 * 1024 ||
      (estimatedBitrate > 0 && estimatedBitrate < 600_000)
    ) {
      return {
        type: "error",
        message:
          "Quality will be noticeably reduced. Consider uploading a shorter or smaller video.",
      };
    }
    if (
      file.size > 50 * 1024 * 1024 ||
      (estimatedBitrate > 0 && estimatedBitrate < 800_000)
    ) {
      return {
        type: "warn",
        message: "Large video — quality may be slightly reduced after compression.",
      };
    }
    return {
      type: "info",
      message: `Video will be optimized for upload (${formatFileSize(file.size)} → ~9 MB)`,
    };
  };

  // --- Helpers ---

  const formatTime = (s: number): string => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // --- Trim preview loop ---

  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video || step !== 2 || duration === 0) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= trimEnd - 0.05) {
        video.currentTime = trimStart;
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [step, trimStart, trimEnd, duration]);

  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video || step !== 2) return;
    video.currentTime = trimStart;
  }, [trimStart, step]);

  // --- Question lookup (debounced) ---

  useEffect(() => {
    const id = questionId.trim();
    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      setQuestionText("");
      setQuestionOptions([]);
      setQuestionInvalid(false);
      return;
    }
    setLoadingQuestion(true);
    setQuestionInvalid(false);
    const timeout = setTimeout(async () => {
      try {
        const res = await questionDetails(id, 0);
        if (res?.success && res?.data?.question?.question) {
          setQuestionText(res.data.question.question);
          const opts = res.data.options;
          if (Array.isArray(opts)) {
            setQuestionOptions(
              opts.map((o: Record<string, unknown>) => ({
                id: Number(o.id),
                name: String(o.name || ""),
                price: Number(o.price || 0),
              }))
            );
          } else {
            setQuestionOptions([]);
          }
          setQuestionInvalid(false);
        } else {
          setQuestionText("");
          setQuestionOptions([]);
          setQuestionInvalid(true);
        }
      } catch {
        setQuestionText("");
        setQuestionOptions([]);
        setQuestionInvalid(true);
      }
      setLoadingQuestion(false);
    }, 600);
    return () => {
      clearTimeout(timeout);
      setLoadingQuestion(false);
    };
  }, [questionId]);

  // --- File handling ---

  const processFile = (selected: File) => {
    const allowed = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowed.includes(selected.type)) {
      toast.error("Only MP4, WebM, or MOV files are accepted.");
      return;
    }
    if (selected.size > UPLOAD_LIMIT) {
      toast.error("Video must be under 120 MB.");
      return;
    }
    if (selected.size > 50 * 1024 * 1024) {
      toast("Large file — it will be compressed before upload.", {
        icon: "⚠️",
      });
    }
    const url = URL.createObjectURL(selected);
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const dur = tempVideo.duration;
      setDuration(dur);
      setTrimStart(0);
      // Auto-clamp trimEnd to MAX_TRIMMED_DURATION if video is longer
      setTrimEnd(Math.min(dur, MAX_TRIMMED_DURATION));
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setIsRecordedVideo(false);
      setSelectedFilterId("normal");
      setStep(2);
    };
    tempVideo.src = url;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const selected = e.dataTransfer.files?.[0];
    if (selected) processFile(selected);
  };

  const handleRecordedVideo = (
    recordedFile: File,
    recordedDuration: number,
    filterId: string,
    filterBaked = true
  ) => {
    setFile(recordedFile);
    setDuration(recordedDuration);
    setTrimStart(0);
    setTrimEnd(recordedDuration);
    setPreview(URL.createObjectURL(recordedFile));
    setIsRecordedVideo(filterBaked);
    setSelectedFilterId(filterId);
    setStep(2);
  };

  // --- Video processing (adaptive compression + trim + filter) ---

  const processVideo = useCallback((): Promise<File> => {
    if (!file || !preview) return Promise.resolve(file!);

    // Only process videos that are OVER the size limit.
    // Small files are uploaded as-is — re-encoding via MediaRecorder
    // inflates file size and degrades quality.
    if (file.size <= SIZE_LIMIT) {
      return Promise.resolve(file);
    }

    const hasFilter = !isRecordedVideo && selectedFilterId !== "normal";
    const hasTrim = trimStart > 0.05 || trimEnd < duration - 0.05;
    const needsCompression = true; // we only reach here if file > SIZE_LIMIT

    return new Promise((resolve) => {
      const probeVideo = document.createElement("video");
      probeVideo.src = preview;
      probeVideo.preload = "metadata";

      probeVideo.onloadedmetadata = () => {
        const origW = probeVideo.videoWidth;
        const origH = probeVideo.videoHeight;
        const needsDownscale = Math.max(origW, origH) > 1920;

        // Skip if nothing to do (shouldn't happen since file > SIZE_LIMIT,
        // but keep as safety net)
        if (!hasFilter && !hasTrim && !needsCompression && !needsDownscale) {
          resolve(file);
          return;
        }

        setIsProcessing(true);
        setProcessProgress(0);

        const segmentDuration = trimEnd - trimStart;
        const targetBitrate = Math.round(
          (TARGET_OUTPUT_BYTES * 8) / segmentDuration
        );

        // Resolution logic
        let maxDim = 1920;
        if (targetBitrate < 800_000 && Math.max(origW, origH) > 1280) {
          maxDim = 1280; // 720p for low bitrate
        }
        const scale =
          Math.max(origW, origH) > maxDim
            ? maxDim / Math.max(origW, origH)
            : 1;
        const targetW = Math.round(origW * scale);
        const targetH = Math.round(origH * scale);

        // --- Encode helper ---
        const encode = (
          w: number,
          h: number,
          bitrate: number
        ): Promise<File> => {
          return new Promise((res) => {
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              res(file);
              return;
            }

            const encVideo = document.createElement("video");
            encVideo.src = preview;
            encVideo.muted = false;
            encVideo.playsInline = true;

            encVideo.onloadedmetadata = () => {
              const startEnc = () => {
                const canvasStream = canvas.captureStream(30);

                type VideoWithCapture = HTMLVideoElement & {
                  captureStream?: (fps?: number) => MediaStream;
                };
                const videoEl = encVideo as VideoWithCapture;
                let combinedStream: MediaStream;
                if (typeof videoEl.captureStream === "function") {
                  const audioTracks =
                    videoEl.captureStream().getAudioTracks();
                  combinedStream = new MediaStream([
                    ...canvasStream.getVideoTracks(),
                    ...audioTracks,
                  ]);
                } else {
                  combinedStream = canvasStream;
                }

                const mimeType = MediaRecorder.isTypeSupported(
                  "video/webm;codecs=vp9,opus"
                )
                  ? "video/webm;codecs=vp9,opus"
                  : MediaRecorder.isTypeSupported(
                        "video/webm;codecs=vp8,opus"
                      )
                    ? "video/webm;codecs=vp8,opus"
                    : "video/webm";

                const recorder = new MediaRecorder(combinedStream, {
                  mimeType,
                  videoBitsPerSecond: bitrate,
                });

                const chunks: Blob[] = [];
                recorder.ondataavailable = (e) => {
                  if (e.data.size > 0) chunks.push(e.data);
                };

                recorder.onstop = () => {
                  const blob = new Blob(chunks, { type: mimeType });
                  const ext = mimeType.includes("webm") ? "webm" : "mp4";
                  res(
                    new File([blob], `processed-${Date.now()}.${ext}`, {
                      type: mimeType,
                    })
                  );
                };

                recorder.onerror = () => res(file);
                recorder.start(100);

                const draw = () => {
                  if (
                    encVideo.currentTime >= trimEnd ||
                    encVideo.ended ||
                    encVideo.paused
                  ) {
                    if (recorder.state !== "inactive") recorder.stop();
                    return;
                  }
                  ctx.filter = hasFilter
                    ? selectedFilter.canvasFilter
                    : "none";
                  ctx.drawImage(encVideo, 0, 0, w, h);
                  if (segmentDuration > 0) {
                    setProcessProgress(
                      Math.round(
                        ((encVideo.currentTime - trimStart) /
                          segmentDuration) *
                          100
                      )
                    );
                  }
                  requestAnimationFrame(draw);
                };

                encVideo.onended = () => {
                  if (recorder.state !== "inactive") recorder.stop();
                };

                encVideo.ontimeupdate = () => {
                  if (encVideo.currentTime >= trimEnd) {
                    encVideo.pause();
                    if (recorder.state !== "inactive") recorder.stop();
                  }
                };

                encVideo.play().then(draw).catch(() => res(file));
              };

              if (trimStart > 0.05) {
                encVideo.onseeked = () => {
                  encVideo.onseeked = null;
                  startEnc();
                };
                encVideo.currentTime = trimStart;
              } else {
                startEnc();
              }
            };

            encVideo.onerror = () => res(file);
          });
        };

        // First pass
        encode(targetW, targetH, targetBitrate).then(async (firstResult) => {
          if (firstResult.size <= SIZE_LIMIT) {
            setIsProcessing(false);
            resolve(firstResult);
            return;
          }

          // Retry at 720p with 80% bitrate
          const retryMaxDim = 1280;
          const retryScale =
            Math.max(origW, origH) > retryMaxDim
              ? retryMaxDim / Math.max(origW, origH)
              : 1;
          const retryW = Math.round(origW * retryScale);
          const retryH = Math.round(origH * retryScale);
          const retryBitrate = Math.round(targetBitrate * 0.8);

          setProcessProgress(0);
          const retryResult = await encode(retryW, retryH, retryBitrate);
          setIsProcessing(false);

          // Return the smaller of the two attempts
          if (retryResult.size <= SIZE_LIMIT) {
            resolve(retryResult);
          } else {
            resolve(
              retryResult.size < firstResult.size ? retryResult : firstResult
            );
          }
        });
      };

      probeVideo.onerror = () => resolve(file);
    });
  }, [
    file,
    preview,
    selectedFilterId,
    isRecordedVideo,
    selectedFilter,
    trimStart,
    trimEnd,
    duration,
  ]);

  // --- Submit ---

  const handleSubmit = async () => {
    if (!file) return toast.error("Select a video");
    const uploadFile = processedFile || file;

    // Final size check
    if (uploadFile.size > SIZE_LIMIT) {
      toast.error(
        "Video is too large even after compression. Please upload a shorter or smaller video."
      );
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    const finalDuration = Math.max(1, Math.round(trimmedDuration));

    const formData = new FormData();
    formData.append("video", uploadFile);
    formData.append("duration", String(finalDuration));
    if (caption.trim()) formData.append("caption", caption.trim());
    if (questionId.trim()) formData.append("questionId", questionId.trim());

    const res = await createReel(formData);
    clearInterval(progressInterval);
    setUploadProgress(100);
    setUploading(false);

    if (res?.success) {
      toast.success("Reel published!");
      resetForm();
      onCreated();
      onClose();
    } else {
      toast.error(res?.message || "Upload failed");
    }
  };

  // --- Navigation ---

  const handleGoToReview = async () => {
    setStep(4);
    setProcessedFile(null);
    try {
      const result = await processVideo();
      setProcessedFile(result);
    } catch {
      toast.error("Processing failed. Please try again.");
    }
  };

  const resetForm = () => {
    setStep(1);
    setMode("upload");
    setFile(null);
    setPreview(null);
    setCaption("");
    setQuestionId("");
    setQuestionText("");
    setQuestionOptions([]);
    setQuestionInvalid(false);
    setDuration(0);
    setTrimStart(0);
    setTrimEnd(0);
    setSelectedFilterId("normal");
    setIsRecordedVideo(false);
    setUploadProgress(0);
    setIsProcessing(false);
    setProcessProgress(0);
    setProcessedFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBack = () => {
    if (step === 4) {
      setProcessedFile(null);
    }
    if (step === 2) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(null);
      setPreview(null);
      setDuration(0);
      setTrimStart(0);
      setTrimEnd(0);
      setIsRecordedVideo(false);
      setSelectedFilterId("normal");
    }
    setStep(step - 1);
  };

  if (!isOpen) return null;

  const qualityWarning = getQualityWarning();

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-28 pb-4 px-4">
      {/* Trim slider thumb styles */}
      <style>{`
        .trim-range {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          pointer-events: none;
          position: absolute;
          width: 100%;
          height: 24px;
        }
        .trim-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          border: 2px solid #8160EE;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: grab;
        }
        .trim-range::-moz-range-thumb {
          appearance: none;
          pointer-events: auto;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          border: 2px solid #8160EE;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: grab;
        }
        .trim-range::-webkit-slider-runnable-track {
          height: 6px;
          background: transparent;
        }
        .trim-range::-moz-range-track {
          height: 6px;
          background: transparent;
        }
      `}</style>

      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white dark:bg-[#1a1f2e] rounded-2xl w-full max-w-lg mx-auto shadow-2xl border border-gray-200 dark:border-gray-700/50 flex flex-col h-[560px] max-h-[calc(100vh-8rem)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {step > 1 && !uploading && !isProcessing && (
              <button
                onClick={handleBack}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <FaArrowLeft className="text-gray-500 text-xs" />
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8160EE] to-[#6437f8] flex items-center justify-center">
                <FaVideo className="text-white text-xs" />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Create Reel
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading || isProcessing}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <FaTimes className="text-gray-500 text-sm" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-5 pb-3 flex-shrink-0">
          <div className="flex gap-1.5">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col gap-1">
                <div
                  className={`h-1 rounded-full transition-colors ${
                    i + 1 <= step
                      ? "bg-gradient-to-r from-[#8160EE] to-[#6235f8]"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium text-center ${
                    i + 1 === step
                      ? "text-[#8160EE]"
                      : i + 1 < step
                        ? "text-gray-500 dark:text-gray-400"
                        : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 min-h-0">
          {step === 1 && (
            <>
              {/* Mode toggle */}
              <div className="flex bg-gray-100 dark:bg-[#0f1520] rounded-xl p-1 mb-4">
                <button
                  onClick={() => setMode("upload")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    mode === "upload"
                      ? "bg-white dark:bg-[#1a1f2e] text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <FaCloudUploadAlt className="text-sm" />
                  Upload
                </button>
                <button
                  onClick={() => setMode("record")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    mode === "record"
                      ? "bg-white dark:bg-[#1a1f2e] text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <FaVideo className="text-sm" />
                  Record
                </button>
              </div>

              {mode === "upload" ? (
                <div
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    dragOver
                      ? "border-[#8160EE] bg-[#8160EE]/10"
                      : "border-gray-300 dark:border-gray-600 hover:border-[#8160EE]/60 hover:bg-[#8160EE]/5"
                  }`}
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8160EE]/20 to-[#8160EE]/5 flex items-center justify-center mb-3">
                    <FaCloudUploadAlt className="text-2xl text-[#8160EE]" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                    Tap or drag to upload
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5 text-center">
                    MP4, WebM or MOV &middot; Under 120MB
                  </p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <VideoRecorder
                  onVideoReady={handleRecordedVideo}
                  onCancel={() => setMode("upload")}
                />
              )}
            </>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center gap-4">
              {/* Video preview with CSS filter for uploaded */}
              <div className="relative w-full max-w-[200px] aspect-[9/16] rounded-2xl overflow-hidden bg-black mx-auto">
                <video
                  ref={previewVideoRef}
                  src={preview || undefined}
                  className="w-full h-full object-cover"
                  style={{
                    filter:
                      !isRecordedVideo && selectedFilterId !== "normal"
                        ? selectedFilter.cssFilter
                        : undefined,
                  }}
                  loop
                  playsInline
                  autoPlay
                  controls
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <span className="text-white text-[10px] font-mono font-medium">
                    {trimmedDuration.toFixed(1)}s
                  </span>
                </div>
              </div>

              {/* Trim slider */}
              {duration > 0 && (
                <div className="w-full">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">
                    Trim video
                  </p>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                      {formatTime(trimStart)}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        trimmedDurationValid
                          ? "text-[#8160EE]"
                          : "text-red-500"
                      }`}
                    >
                      {trimmedDuration.toFixed(1)}s
                      {trimmedDuration > MAX_TRIMMED_DURATION && " (max 60s)"}
                    </span>
                    <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                      {formatTime(trimEnd)}
                    </span>
                  </div>
                  <div className="relative h-6 flex items-center">
                    <div className="absolute w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div
                      className={`absolute h-1.5 rounded-full ${
                        trimmedDurationValid
                          ? "bg-gradient-to-r from-[#8160EE] to-[#5f2ffd]"
                          : "bg-red-500"
                      }`}
                      style={{
                        left: `${(trimStart / duration) * 100}%`,
                        width: `${((trimEnd - trimStart) / duration) * 100}%`,
                      }}
                    />
                    <input
                      type="range"
                      className="trim-range"
                      min={0}
                      max={duration}
                      step={0.1}
                      value={trimStart}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val <= trimEnd - 1) setTrimStart(val);
                      }}
                      style={{ zIndex: 3 }}
                    />
                    <input
                      type="range"
                      className="trim-range"
                      min={0}
                      max={duration}
                      step={0.1}
                      value={trimEnd}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val >= trimStart + 1) setTrimEnd(val);
                      }}
                      style={{ zIndex: 4 }}
                    />
                  </div>

                  {/* Duration error */}
                  {trimmedDuration > MAX_TRIMMED_DURATION && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">
                      Trim to {MAX_TRIMMED_DURATION} seconds or less to
                      continue
                    </p>
                  )}
                </div>
              )}

              {/* Quality / compression warnings */}
              {qualityWarning && (
                <div
                  className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                    qualityWarning.type === "error"
                      ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      : qualityWarning.type === "warn"
                        ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                        : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  }`}
                >
                  <span className="flex-shrink-0">
                    {qualityWarning.type === "error" ? (
                      <FaExclamationTriangle />
                    ) : (
                      <>&#9432;</>
                    )}
                  </span>
                  <span>{qualityWarning.message}</span>
                </div>
              )}

              {/* Filter selector */}
              {!isRecordedVideo ? (
                <>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Apply a filter
                  </p>
                  <div className="flex gap-2.5 overflow-x-auto w-full pb-1 scrollbar-hide">
                    {VIDEO_FILTERS.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setSelectedFilterId(filter.id)}
                        className={`flex-shrink-0 flex flex-col items-center gap-1 transition-opacity ${
                          selectedFilterId === filter.id
                            ? "opacity-100"
                            : "opacity-50"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl overflow-hidden ring-2 transition-all ${
                            selectedFilterId === filter.id
                              ? filter.accentClass
                              : "ring-transparent"
                          }`}
                        >
                          <div
                            className="w-full h-full bg-gradient-to-br from-[#8160EE] to-[#c8aa76]"
                            style={{
                              filter:
                                filter.cssFilter === "none"
                                  ? undefined
                                  : filter.cssFilter,
                            }}
                          />
                        </div>
                        <span
                          className={`text-[10px] font-medium ${
                            selectedFilterId === filter.id
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-400"
                          }`}
                        >
                          {filter.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-400 text-center">
                  Filter applied during recording. Go back to re-record with a
                  different filter.
                </p>
              )}

              <button
                onClick={() => setStep(3)}
                disabled={!trimmedDurationValid}
                className="w-full mt-1 bg-gradient-to-r from-[#8160EE] to-[#5f2ffd] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              >
                Next
                <FaArrowRight className="text-xs" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Caption
                </label>
                <div className="relative">
                  <textarea
                    className="w-full bg-gray-50 dark:bg-[#0f1520] text-sm text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none resize-none border border-gray-200 dark:border-gray-700/50 focus:border-[#8160EE]/50 focus:ring-1 focus:ring-[#8160EE]/20 transition-all"
                    rows={4}
                    maxLength={MAX_CAPTION}
                    placeholder="Write a caption for your reel..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                  <span
                    className={`absolute bottom-2 right-3 text-[10px] ${
                      caption.length > MAX_CAPTION * 0.9
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  >
                    {caption.length}/{MAX_CAPTION}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Link Question (optional)
                </label>
                <input
                  className="w-full bg-gray-50 dark:bg-[#0f1520] text-sm text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none border border-gray-200 dark:border-gray-700/50 focus:border-[#8160EE]/50 focus:ring-1 focus:ring-[#8160EE]/20 transition-all"
                  placeholder="Enter Question ID"
                  value={questionId}
                  onChange={(e) => setQuestionId(e.target.value)}
                  type="number"
                />
                {loadingQuestion && (
                  <p className="text-[11px] text-gray-400 mt-1.5 ml-1">
                    Loading question...
                  </p>
                )}
                {!loadingQuestion && questionText && (
                  <div className="mt-2 bg-[#8160EE]/5 dark:bg-[#8160EE]/10 border border-[#8160EE]/20 rounded-lg px-3 py-2.5 space-y-2 max-h-[140px] overflow-y-auto scrollbar-hide">
                    <p className="text-xs text-gray-700 dark:text-gray-200 line-clamp-2 font-medium">
                      {questionText}
                    </p>
                    {questionOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {questionOptions.map((opt) => (
                          <div
                            key={opt.id}
                            className="flex items-center gap-1.5 bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-gray-600/40 rounded-lg px-2 py-1"
                          >
                            <span className="text-[11px] text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                              {opt.name}
                            </span>
                            <span className="text-[11px] font-semibold text-[#8160EE]">
                              {Math.round(opt.price * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {!loadingQuestion &&
                  !questionText &&
                  questionId.trim() &&
                  questionInvalid && (
                    <p className="text-[11px] text-red-400 mt-1.5 ml-1">
                      No question found with this ID
                    </p>
                  )}
                {!loadingQuestion &&
                  !questionText &&
                  (!questionId.trim() || !questionInvalid) && (
                    <p className="text-[11px] text-gray-400 mt-1.5 ml-1">
                      Link a prediction market question to your reel
                    </p>
                  )}
              </div>

              <button
                onClick={handleGoToReview}
                disabled={
                  !!(questionId.trim() && (questionInvalid || loadingQuestion))
                }
                className="w-full mt-1 bg-gradient-to-r from-[#8160EE] to-[#5f2ffd] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              >
                Review
                <FaArrowRight className="text-xs" />
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-3">
              {/* Final preview */}
              <div className="relative w-full max-w-[180px] aspect-[9/16] rounded-2xl overflow-hidden bg-black mx-auto">
                <video
                  src={preview || undefined}
                  className="w-full h-full object-cover"
                  style={{
                    filter:
                      !isRecordedVideo && selectedFilterId !== "normal"
                        ? selectedFilter.cssFilter
                        : undefined,
                  }}
                  loop
                  playsInline
                  controls
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 dark:bg-[#0f1520] rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Duration
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {Math.round(trimmedDuration)}s
                  </span>
                </div>
                {file && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Size
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {processedFile ? (
                        processedFile.size < file.size ? (
                          <>
                            <span className="text-gray-400 line-through text-xs mr-1">
                              {formatFileSize(file.size)}
                            </span>
                            {formatFileSize(processedFile.size)}
                            <span className="text-green-500 ml-1 text-xs">
                              (compressed)
                            </span>
                          </>
                        ) : (
                          formatFileSize(processedFile.size)
                        )
                      ) : (
                        <span className="text-gray-400 text-xs inline-flex items-center gap-1">
                          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
                          Compressing...
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {caption && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      Caption
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium truncate ml-4 max-w-[200px]">
                      {caption}
                    </span>
                  </div>
                )}
                {questionId && questionText && (
                  <div className="flex flex-col gap-1.5 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Linked Question
                    </span>
                    <div className="bg-[#8160EE]/5 dark:bg-[#8160EE]/10 border border-[#8160EE]/20 rounded-lg px-3 py-2.5 space-y-2 max-h-[120px] overflow-y-auto scrollbar-hide">
                      <p className="text-xs text-gray-700 dark:text-gray-200 line-clamp-2 font-medium">
                        {questionText}
                      </p>
                      {questionOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {questionOptions.map((opt) => (
                            <div
                              key={opt.id}
                              className="flex items-center gap-1.5 bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-gray-600/40 rounded-lg px-2 py-1"
                            >
                              <span className="text-[11px] text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                                {opt.name}
                              </span>
                              <span className="text-[11px] font-semibold text-[#8160EE]">
                                {Math.round(opt.price * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Processing progress */}
              {isProcessing && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Processing video...
                    </span>
                    <span className="text-xs font-medium text-[#8160EE]">
                      {processProgress}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8160EE] to-[#5f2ffd] rounded-full transition-all duration-300"
                      style={{ width: `${processProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload progress */}
              {uploading && !isProcessing && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Uploading...
                    </span>
                    <span className="text-xs font-medium text-[#8160EE]">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8160EE] to-[#5f2ffd] rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Publish */}
              <button
                onClick={handleSubmit}
                disabled={uploading || isProcessing || !processedFile}
                className="w-full bg-gradient-to-r from-[#8160EE] to-[#5f2ffd] hover:from-[#8160EE] hover:to-[#7d58f8] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#8160EE]/20 disabled:shadow-none"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <FaCheck className="text-xs" />
                    Publish Reel
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateReelModal;

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / 1024).toFixed(0) + " KB";
}
