import React from "react";

function Logo({ collapsed = false }) {
  const iconSVG = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Central smart allocation symbol - hexagon representing intelligent room assignment */}
      <polygon
        points="12,4 17,7 17,13 12,16 7,13 7,7"
        stroke="#94A3B8"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Inner hexagon representing the "room" inside assignment intelligence */}
      <polygon
        points="12,7 15,8.5 15,11.5 12,13 9,11.5 9,8.5"
        stroke="#64748B"
        strokeWidth="1"
        fill="#1E40AF"
        opacity="0.7"
      />
      {/* Connecting dots representing exam sessions/linkages */}
      <circle cx="9" cy="6" r="1.5" fill="#3B82F6" />
      <circle cx="15" cy="6" r="1.5" fill="#94A3B8" />
      <circle cx="18" cy="12" r="1.5" fill="#64748B" />
      <circle cx="6" cy="12" r="1.5" fill="#94A3B8" />
      <circle cx="9" cy="18" r="1.5" fill="#3B82F6" />
      <circle cx="15" cy="18" r="1.5" fill="#64748B" />
      {/* Connection lines representing smart assignment linkages */}
      <line
        x1="10.5"
        y1="7.5"
        x2="13.5"
        y2="9.5"
        stroke="#64748B"
        strokeWidth="1"
        opacity="0.8"
      />
      <line
        x1="13.5"
        y1="10.5"
        x2="10.5"
        y2="12.5"
        stroke="#64748B"
        strokeWidth="1"
        opacity="0.8"
      />
    </svg>
  );

  if (collapsed) {
    return (
      <div className="flex items-center justify-center w-12 h-12">
        {iconSVG}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Logo Icon */}
      <div className="w-9 h-9 flex items-center justify-center">{iconSVG}</div>

      {/* Typographic Logo */}
      <div className="flex items-baseline space-x-0.5">
        {/* "Exam" in semi-serif artistic font */}
        <div className="relative">
          <span
            className="font-bold text-lg text-white tracking-wide"
            style={{
              fontFamily: "'Cinzel', serif",
              textShadow: `
                0 1px 2px rgba(0,0,0,0.3),
                0 2px 4px rgba(0,0,0,0.1),
                0 0 8px rgba(59, 130, 246, 0.2)
              `,
              background:
                "linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Exam
          </span>
          {/* Subtle underline accent */}
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-70"></div>
        </div>

        {/* "Space" in sleek sans-serif font */}
        <span
          className="font-light text-lg text-slate-200 tracking-tight"
          style={{
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            textShadow: `
              0 1px 2px rgba(0,0,0,0.4),
              0 0 4px rgba(148, 163, 184, 0.1)
            `,
          }}
        >
          Space
        </span>
      </div>
    </div>
  );
}

export default Logo;
