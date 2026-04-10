export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[rgba(10,15,30,0.65)] backdrop-blur-md">
      {/* Gradient Ring */}
      <div className="relative w-16 h-16 animate-spin">
        {/* Outer Gradient Ring */}
        <div
          className="
            absolute inset-0 rounded-full
            bg-[conic-gradient(#1e3a8a,#2563eb,#38bdf8,#93c5fd)]
          "
        />

        {/* Inner Cut (Ring Effect) */}
        <div className="absolute inset-[4px] rounded-full bg-[rgba(46,70,139,0.85)]" />
      </div>

      {/* Text */}
      <p
        className="
  mt-4 text-xl uppercase font-semibold tracking-[0.3em]
  bg-gradient-to-r from-blue-700 via-blue-300 to-blue-700
  bg-[length:200%_100%]
  bg-clip-text text-transparent
  animate-[gradientMove_2s_linear_infinite]
"
      >
        Loading
      </p>
    </div>
  );
}
