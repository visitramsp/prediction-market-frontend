export interface VideoFilter {
  id: string;
  name: string;
  /** CSS filter string for live preview */
  cssFilter: string;
  /** Canvas 2D context filter string for baking into recorded video */
  canvasFilter: string;
  /** Tailwind ring color class when selected */
  accentClass: string;
}

export const VIDEO_FILTERS: VideoFilter[] = [
  {
    id: "normal",
    name: "Normal",
    cssFilter: "none",
    canvasFilter: "none",
    accentClass: "ring-white",
  },
  {
    id: "warm",
    name: "Warm",
    cssFilter: "sepia(0.3) saturate(1.4) brightness(1.1)",
    canvasFilter: "sepia(0.3) saturate(1.4) brightness(1.1)",
    accentClass: "ring-orange-400",
  },
  {
    id: "cool",
    name: "Cool",
    cssFilter: "saturate(0.9) hue-rotate(20deg) brightness(1.05)",
    canvasFilter: "saturate(0.9) hue-rotate(20deg) brightness(1.05)",
    accentClass: "ring-blue-400",
  },
  {
    id: "vintage",
    name: "Vintage",
    cssFilter: "sepia(0.5) contrast(1.1) brightness(0.9) saturate(0.8)",
    canvasFilter: "sepia(0.5) contrast(1.1) brightness(0.9) saturate(0.8)",
    accentClass: "ring-amber-600",
  },
  {
    id: "bw",
    name: "B&W",
    cssFilter: "grayscale(1) contrast(1.1)",
    canvasFilter: "grayscale(1) contrast(1.1)",
    accentClass: "ring-gray-400",
  },
  {
    id: "vivid",
    name: "Vivid",
    cssFilter: "saturate(1.8) contrast(1.1) brightness(1.05)",
    canvasFilter: "saturate(1.8) contrast(1.1) brightness(1.05)",
    accentClass: "ring-pink-500",
  },
  {
    id: "sepia",
    name: "Sepia",
    cssFilter: "sepia(0.8)",
    canvasFilter: "sepia(0.8)",
    accentClass: "ring-yellow-700",
  },
  {
    id: "fade",
    name: "Fade",
    cssFilter: "saturate(0.5) brightness(1.15) contrast(0.85)",
    canvasFilter: "saturate(0.5) brightness(1.15) contrast(0.85)",
    accentClass: "ring-gray-300",
  },
  {
    id: "dramatic",
    name: "Dramatic",
    cssFilter: "contrast(1.3) brightness(0.9) saturate(1.2)",
    canvasFilter: "contrast(1.3) brightness(0.9) saturate(1.2)",
    accentClass: "ring-red-500",
  },
  {
    id: "bloom",
    name: "Bloom",
    cssFilter: "brightness(1.2) contrast(0.95) saturate(1.1)",
    canvasFilter: "brightness(1.2) contrast(0.95) saturate(1.1)",
    accentClass: "ring-rose-300",
  },
  {
    id: "noir",
    name: "Noir",
    cssFilter: "grayscale(0.8) contrast(1.4) brightness(0.85)",
    canvasFilter: "grayscale(0.8) contrast(1.4) brightness(0.85)",
    accentClass: "ring-zinc-500",
  },
  {
    id: "teal",
    name: "Teal",
    cssFilter: "hue-rotate(-15deg) saturate(1.3) brightness(1.05)",
    canvasFilter: "hue-rotate(-15deg) saturate(1.3) brightness(1.05)",
    accentClass: "ring-teal-400",
  },
  {
    id: "retro",
    name: "Retro",
    cssFilter: "sepia(0.4) saturate(1.2) contrast(1.15) brightness(0.95)",
    canvasFilter: "sepia(0.4) saturate(1.2) contrast(1.15) brightness(0.95)",
    accentClass: "ring-orange-600",
  },
];
