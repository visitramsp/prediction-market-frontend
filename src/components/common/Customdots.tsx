"use client";

function FloatingDots({ color, children }) {
  const particles = Array.from({ length: 200 }, (_, i) => {
    const isStar = Math.random() > 0.7; // ⭐ 30% stars, 70% dots
    return {
      id: i,
      type: isStar ? "star" : "dot",
      size: isStar ? 6 + Math.random() * 6 : 3 + Math.random() * 5,
      left: Math.random() * 100,
      dur: 6 + Math.random() * 10,
      delay: -(Math.random() * 16),
      rotate: Math.random() * 360,
    };
  });

  return (
    <>
      {/* Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {particles.map((p) =>
          p.type === "dot" ? (
            // 🔵 DOT
            <span
              key={p.id}
              style={{
                position: "absolute",
                bottom: 0,
                left: `${p.left}%`,
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: color + "33",
                animation: `rise ${p.dur}s ${p.delay}s linear infinite`,
              }}
            />
          ) : (
            // ⭐ STAR
            <span
              key={p.id}
              style={{
                position: "absolute",
                bottom: 0,
                left: `${p.left}%`,
                width: p.size,
                height: p.size,
                background: color,
                clipPath:
                  "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                transform: `rotate(${p.rotate}deg)`,
                animation: `rise ${p.dur}s ${p.delay}s linear infinite`,
                opacity: 0.8,
              }}
            />
          ),
        )}
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>

      <style>{`
        @keyframes rise {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.5; }
          100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
        }
      `}</style>
    </>
  );
}

export default function DotsNavPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main style={{ background: "#0a0a0f", minHeight: "100vh" }}>
      <FloatingDots color="#7F77DD">{children}</FloatingDots>
    </main>
  );
}
