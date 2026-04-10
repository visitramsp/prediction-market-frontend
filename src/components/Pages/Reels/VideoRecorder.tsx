"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { FaSyncAlt, FaTimes } from "react-icons/fa";
import { VIDEO_FILTERS, VideoFilter } from "./videoFilters";

interface VideoRecorderProps {
  onVideoReady: (
    file: File,
    duration: number,
    filterId: string,
    filterBaked?: boolean
  ) => void;
  onCancel: () => void;
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const MAX_DURATION = 60;

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onVideoReady,
  onCancel,
}) => {
  // Camera state
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);

  // Filter state
  const [activeFilterId, setActiveFilterId] = useState("normal");

  // Refs
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeFilterRef = useRef<VideoFilter>(VIDEO_FILTERS[0]);
  const facingModeRef = useRef<"user" | "environment">("user");
  const elapsedRef = useRef(0);
  const shouldStopRef = useRef(false);
  const filterBakedRef = useRef(true);

  // Sync refs with state
  useEffect(() => {
    const filter = VIDEO_FILTERS.find((f) => f.id === activeFilterId);
    if (filter) activeFilterRef.current = filter;
  }, [activeFilterId]);

  useEffect(() => {
    facingModeRef.current = facingMode;
  }, [facingMode]);

  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // Detect multiple cameras
  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      setHasMultipleCameras(videoInputs.length > 1);
    }).catch(() => {});
  }, []);

  // Start camera
  const startCamera = useCallback(
    async (facing: "user" | "environment") => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Camera is not available. Make sure you are using HTTPS and a supported browser."
        );
        return;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      setCameraError(null);
      setCameraReady(false);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1080 },
            height: { ideal: 1920 },
            frameRate: { ideal: 30 },
          },
          audio: true,
        });
        streamRef.current = stream;
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
          await liveVideoRef.current.play();
        }
        setCameraReady(true);
      } catch {
        setCameraError(
          "Camera access denied. Please allow camera and microphone permissions."
        );
      }
    },
    []
  );

  // Init camera on mount
  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Canvas rendering loop
  const drawFilteredFrame = useCallback(() => {
    const video = liveVideoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(drawFilteredFrame);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      animFrameRef.current = requestAnimationFrame(drawFilteredFrame);
      return;
    }

    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.filter = activeFilterRef.current.canvasFilter;

    if (facingModeRef.current === "user") {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    animFrameRef.current = requestAnimationFrame(drawFilteredFrame);
  }, []);

  // Start/stop canvas loop based on camera state
  useEffect(() => {
    if (cameraReady && !recordedBlob) {
      animFrameRef.current = requestAnimationFrame(drawFilteredFrame);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [cameraReady, recordedBlob, drawFilteredFrame]);

  // Stop recording helper
  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  }, []);

  // Start recording
  const startRecording = useCallback(() => {
    const canvas = canvasRef.current;
    const rawStream = streamRef.current;
    if (!canvas || !rawStream) return;

    // Try canvas pipeline (bakes filter into recording), fall back to raw stream
    let recordStream: MediaStream;
    try {
      const canvasStream = canvas.captureStream(30);
      const audioTracks = rawStream.getAudioTracks();
      recordStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioTracks,
      ]);
      filterBakedRef.current = true;
    } catch {
      // canvas.captureStream not supported (older mobile browsers)
      // Record raw stream; filter will be applied during processing
      recordStream = rawStream;
      filterBakedRef.current = false;
    }

    // MIME type detection — broad fallback chain for mobile compatibility
    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/mp4",
      "video/webm",
    ];
    const mimeType =
      mimeTypes.find((t) => MediaRecorder.isTypeSupported(t)) || "";

    let recorder: MediaRecorder;
    try {
      const options: MediaRecorderOptions = {
        videoBitsPerSecond: 1_200_000,
      };
      if (mimeType) options.mimeType = mimeType;
      recorder = new MediaRecorder(recordStream, options);
    } catch {
      setCameraError(
        "Recording is not supported on this browser. Please upload a video instead."
      );
      return;
    }

    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const actualType = recorder.mimeType || mimeType || "video/webm";
      const blob = new Blob(chunksRef.current, { type: actualType });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedUrl(url);
      setRecordedDuration(elapsedRef.current);

      rawStream.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(animFrameRef.current);
    };

    mediaRecorderRef.current = recorder;
    recorder.start(100);
    setIsRecording(true);
    setElapsedSeconds(0);
    elapsedRef.current = 0;

    shouldStopRef.current = false;

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        elapsedRef.current = next;
        if (next >= MAX_DURATION) {
          shouldStopRef.current = true;
        }
        return next;
      });
    }, 1000);
  }, []);

  // Auto-stop when max duration reached
  useEffect(() => {
    if (shouldStopRef.current && isRecording) {
      shouldStopRef.current = false;
      stopRecording();
    }
  }, [elapsedSeconds, isRecording, stopRecording]);

  // Flip camera
  const flipCamera = useCallback(() => {
    if (isRecording) return;
    const newFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
    startCamera(newFacing);
  }, [facingMode, isRecording, startCamera]);

  // Re-record
  const handleReRecord = useCallback(() => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordedDuration(0);
    setElapsedSeconds(0);
    startCamera(facingMode);
  }, [recordedUrl, facingMode, startCamera]);

  // Confirm recording
  const handleConfirm = useCallback(() => {
    if (!recordedBlob) return;
    const extension = recordedBlob.type.includes("webm") ? "webm" : "mp4";
    const file = new File(
      [recordedBlob],
      `reel-recording-${Date.now()}.${extension}`,
      { type: recordedBlob.type }
    );
    onVideoReady(file, recordedDuration, activeFilterId, filterBakedRef.current);
  }, [recordedBlob, recordedDuration, onVideoReady, activeFilterId]);

  // Cancel handler
  const handleCancel = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    cancelAnimationFrame(animFrameRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    onCancel();
  }, [recordedUrl, onCancel]);

  // Cleanup blob URL on unmount
  const recordedUrlRef = useRef(recordedUrl);
  recordedUrlRef.current = recordedUrl;
  useEffect(() => {
    return () => {
      if (recordedUrlRef.current) URL.revokeObjectURL(recordedUrlRef.current);
    };
  }, []);

  // --- RENDER ---

  // Error state
  if (cameraError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <FaTimes className="text-red-500 text-xl" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-[280px]">
          {cameraError}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => startCamera(facingMode)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-[#8160EE] to-[#6235f8] text-white hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:opacity-90 transition-opacity"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Post-recording preview
  if (recordedBlob && recordedUrl) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-full max-w-[200px] aspect-[9/16] rounded-2xl overflow-hidden bg-black">
          <video
            ref={previewVideoRef}
            src={recordedUrl}
            className="w-full h-full object-cover"
            loop
            playsInline
            controls
          />
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5">
            <span className="text-white text-[10px] font-mono font-medium">
              {formatTime(recordedDuration)}
            </span>
          </div>
        </div>
        <div className="flex gap-3 w-full max-w-[280px]">
          <button
            onClick={handleReRecord}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Re-record
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-[#8160EE] to-[#6235f8] text-white hover:opacity-90 transition-opacity"
          >
            Use This Video
          </button>
        </div>
      </div>
    );
  }

  // Live camera + recording UI
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Hidden video element for raw camera feed */}
      <video
        ref={liveVideoRef}
        className="hidden"
        playsInline
        muted
      />

      {/* Canvas preview container */}
      <div className="relative w-full max-w-[170px] aspect-[9/16] rounded-2xl overflow-hidden bg-black">
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
        />

        {/* Timer overlay */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
            {isRecording && (
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
            <span className="text-white text-[11px] font-mono font-medium">
              {formatTime(elapsedSeconds)} / {formatTime(MAX_DURATION)}
            </span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <FaTimes className="text-white text-xs" />
        </button>

        {/* Filter strip - bottom of canvas */}
        {!isRecording && (
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent pt-6 pb-2">
            <div className="flex gap-1.5 overflow-x-auto px-2 scrollbar-hide">
              {VIDEO_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilterId(filter.id)}
                  className={`flex-shrink-0 flex flex-col items-center gap-0.5 transition-opacity ${
                    activeFilterId === filter.id ? "opacity-100" : "opacity-60"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg overflow-hidden ring-2 transition-all ${
                      activeFilterId === filter.id
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
                    className={`text-[8px] font-medium ${
                      activeFilterId === filter.id
                        ? "text-white"
                        : "text-white/60"
                    }`}
                  >
                    {filter.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-center gap-5 w-full max-w-[170px] py-1">
        {/* Flip camera */}
        {hasMultipleCameras && (
          <button
            onClick={flipCamera}
            disabled={isRecording}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isRecording
                ? "bg-gray-300 dark:bg-gray-700 opacity-40 cursor-not-allowed"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <FaSyncAlt className="text-gray-700 dark:text-gray-300 text-sm" />
          </button>
        )}

        {/* Record / Stop button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!cameraReady}
          className="w-14 h-14 rounded-full border-4 border-gray-300 dark:border-gray-500 flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRecording ? (
            <div className="w-5 h-5 rounded-sm bg-red-500" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-500" />
          )}
        </button>

        {/* Spacer for balance when flip button is shown */}
        {hasMultipleCameras && <div className="w-9 h-9" />}
      </div>
    </div>
  );
};

export default VideoRecorder;
