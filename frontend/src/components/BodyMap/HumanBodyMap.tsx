import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface OrganRegion {
  id: string;
  label: string;
  labelEn: string;
  tissueCategory: string;
  path: string;
  labelPos: { x: number; y: number };
  leaderLine?: { from: { x: number; y: number }; to: { x: number; y: number } };
  gradientColors: [string, string];
}

const ORGANS: OrganRegion[] = [
  {
    id: "immune",
    label: "免疫",
    labelEn: "Immune",
    tissueCategory: "免疫",
    path: "M 114,90 C 109,87 104,89 103,94 C 102,99 104,104 109,106 C 114,108 118,108 120,105 C 122,108 126,108 131,106 C 136,104 138,99 137,94 C 136,89 131,87 126,90 C 123,92 121,93 120,91 C 118,89 116,89 114,90 Z",
    labelPos: { x: 18, y: 98 },
    leaderLine: { from: { x: 52, y: 101 }, to: { x: 101, y: 98 } },
    gradientColors: ["#a0d8b0", "#78c090"],
  },
  {
    id: "lung",
    label: "肺",
    labelEn: "Lung",
    tissueCategory: "肺",
    path: "M 104,112 C 98,108 92,110 90,116 C 88,122 90,130 94,136 C 98,140 104,140 108,136 C 110,132 110,126 110,120 C 110,116 108,114 106,112 Z M 136,112 C 142,108 148,110 150,116 C 152,122 150,130 146,136 C 142,140 136,140 132,136 C 130,132 130,126 130,120 C 130,116 132,114 134,112 Z",
    labelPos: { x: 198, y: 118 },
    leaderLine: { from: { x: 195, y: 122 }, to: { x: 152, y: 124 } },
    gradientColors: ["#b3d4f7", "#8ab8e8"],
  },
  {
    id: "heart",
    label: "心脏",
    labelEn: "Heart",
    tissueCategory: "心脏",
    path: "M 114,126 C 110,122 106,122 104,126 C 102,130 104,134 108,138 C 112,142 118,144 120,142 C 122,144 128,142 132,138 C 136,134 138,130 136,126 C 134,122 130,122 126,126 C 124,128 122,128 120,126 C 118,124 116,124 114,126 Z",
    labelPos: { x: 18, y: 134 },
    leaderLine: { from: { x: 52, y: 136 }, to: { x: 102, y: 134 } },
    gradientColors: ["#f4a0a0", "#e07070"],
  },
  {
    id: "liver",
    label: "肝脏",
    labelEn: "Liver",
    tissueCategory: "肝脏",
    path: "M 104,148 C 98,146 92,148 90,152 C 88,156 90,162 96,166 C 102,170 110,170 118,168 C 126,166 130,162 130,158 C 130,154 126,150 120,148 C 114,146 108,148 104,148 Z",
    labelPos: { x: 198, y: 156 },
    leaderLine: { from: { x: 195, y: 158 }, to: { x: 132, y: 158 } },
    gradientColors: ["#d4a87c", "#bc8c5e"],
  },
  {
    id: "cancer",
    label: "癌症",
    labelEn: "Cancer",
    tissueCategory: "癌症",
    path: "M 148,94 C 145,90 141,90 139,92 C 137,94 138,98 141,100 C 144,102 148,102 150,100 C 152,98 151,94 149,92 Z M 143,92 L 146,88 M 140,96 L 136,98 M 150,96 L 154,98 M 146,102 L 146,106",
    labelPos: { x: 198, y: 94 },
    leaderLine: { from: { x: 195, y: 97 }, to: { x: 155, y: 96 } },
    gradientColors: ["#ffa0a0", "#e87070"],
  },
  {
    id: "embryo",
    label: "胚胎",
    labelEn: "Embryo",
    tissueCategory: "胚胎",
    path: "M 110,186 C 105,183 100,185 98,190 C 96,195 98,201 104,204 C 110,207 118,207 126,204 C 132,201 134,195 132,190 C 130,185 125,183 120,186 C 117,188 113,188 110,186 Z",
    labelPos: { x: 198, y: 194 },
    leaderLine: { from: { x: 195, y: 196 }, to: { x: 135, y: 194 } },
    gradientColors: ["#d4b0d8", "#b890bc"],
  },
  {
    id: "reproductive",
    label: "生殖",
    labelEn: "Reproductive",
    tissueCategory: "生殖",
    path: "M 110,212 C 106,210 102,212 100,216 C 98,220 100,224 104,226 C 108,228 114,228 118,226 C 122,224 124,220 122,216 C 120,212 116,210 112,212 Z",
    labelPos: { x: 18, y: 220 },
    leaderLine: { from: { x: 52, y: 222 }, to: { x: 98, y: 218 } },
    gradientColors: ["#f0b0d0", "#d890b0"],
  },
];

interface HumanBodyMapProps {
  isMobile?: boolean;
}

const HumanBodyMap: React.FC<HumanBodyMapProps> = ({ isMobile = false }) => {
  const navigate = useNavigate();
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);

  const handleOrganClick = (organ: OrganRegion) => {
    navigate(`/browse?tissue_category=${encodeURIComponent(organ.tissueCategory)}`);
  };

  return (
    <div style={{ position: "relative", width: "100%", textAlign: "center" }}>
      <div
        style={{
          fontSize: isMobile ? 13 : 15,
          fontWeight: 600,
          color: "#1d3e70",
          marginBottom: 6,
          paddingTop: 2,
          letterSpacing: 0.5,
        }}
      >
        Human Body Map
      </div>
      <svg
        viewBox="-10 10 270 400"
        style={{
          width: "100%",
          maxWidth: isMobile ? 260 : 360,
          height: "auto",
          margin: "0 auto",
          display: "block",
          overflow: "visible",
        }}
      >
        <defs>
          {/* Skin gradient */}
          <radialGradient id="humanSkinGrad" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#fef5e7" />
            <stop offset="100%" stopColor="#f0dcc0" />
          </radialGradient>
          {/* Limb gradient */}
          <linearGradient id="humanLimbGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#faf0e0" />
            <stop offset="100%" stopColor="#e8d5bb" />
          </linearGradient>
          {/* Organ gradients */}
          {ORGANS.map((organ) => (
            <radialGradient key={`grad-${organ.id}`} id={`humanOrganGrad-${organ.id}`} cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor={organ.gradientColors[0]} />
              <stop offset="100%" stopColor={organ.gradientColors[1]} />
            </radialGradient>
          ))}
          {/* Hover glow */}
          <filter id="humanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Label shadow */}
          <filter id="humanLabelShadow" x="-5%" y="-10%" width="110%" height="130%">
            <feDropShadow dx="0" dy="0.5" stdDeviation="0.5" floodColor="#000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Head */}
        <ellipse cx="120" cy="42" rx="22" ry="28" fill="url(#humanSkinGrad)" stroke="#b0a090" strokeWidth="0.8" />
        {/* Hair hint */}
        <path
          d="M 100,30 C 102,18 112,12 120,12 C 128,12 138,18 140,30"
          fill="none"
          stroke="#c0b0a0"
          strokeWidth="0.5"
          opacity="0.4"
        />

        {/* Neck */}
        <rect x="112" y="68" width="16" height="16" rx="4" fill="url(#humanSkinGrad)" stroke="#b0a090" strokeWidth="0.6" />

        {/* Torso */}
        <path
          d="M 90,84 C 86,88 84,96 84,108
             C 84,120 84,140 84,160
             C 84,180 86,200 90,210
             C 94,218 100,222 108,224
             C 112,226 116,226 120,226
             C 124,226 128,226 132,224
             C 140,222 146,218 150,210
             C 154,200 156,180 156,160
             C 156,140 156,120 156,108
             C 156,96 154,88 150,84
             C 146,80 138,78 130,78
             C 126,78 122,78 120,78
             C 118,78 114,78 110,78
             C 102,78 94,80 90,84 Z"
          fill="url(#humanSkinGrad)"
          stroke="#b0a090"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Left arm */}
        <path
          d="M 90,86 C 82,88 74,94 68,102
             C 62,110 58,120 56,130
             C 54,140 54,150 56,160
             C 58,170 60,178 62,186
             C 64,192 66,196 68,198
             C 70,200 72,200 74,198
             C 74,194 72,188 70,180
             C 68,172 68,162 68,152
             C 68,142 70,132 74,122
             C 78,112 82,104 86,98
             C 88,94 90,92 90,88 Z"
          fill="url(#humanLimbGrad)"
          stroke="#b0a090"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Right arm */}
        <path
          d="M 150,86 C 158,88 166,94 172,102
             C 178,110 182,120 184,130
             C 186,140 186,150 184,160
             C 182,170 180,178 178,186
             C 176,192 174,196 172,198
             C 170,200 168,200 166,198
             C 166,194 168,188 170,180
             C 172,172 172,162 172,152
             C 172,142 170,132 166,122
             C 162,112 158,104 154,98
             C 152,94 150,92 150,88 Z"
          fill="url(#humanLimbGrad)"
          stroke="#b0a090"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Left leg */}
        <path
          d="M 100,224 C 98,230 96,240 94,256
             C 92,272 90,290 90,310
             C 90,330 90,346 90,358
             C 90,366 88,372 86,378
             C 84,382 82,386 82,388
             C 82,392 86,394 92,394
             C 96,394 98,392 98,388
             C 98,384 100,376 102,368
             C 104,360 104,348 104,334
             C 104,318 104,300 104,280
             C 104,260 106,244 108,232
             C 108,228 106,226 104,226 Z"
          fill="url(#humanLimbGrad)"
          stroke="#b0a090"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Right leg */}
        <path
          d="M 140,224 C 142,230 144,240 146,256
             C 148,272 150,290 150,310
             C 150,330 150,346 150,358
             C 150,366 152,372 154,378
             C 156,382 158,386 158,388
             C 158,392 154,394 148,394
             C 144,394 142,392 142,388
             C 142,384 140,376 138,368
             C 136,360 136,348 136,334
             C 136,318 136,300 136,280
             C 136,260 134,244 132,232
             C 132,228 134,226 136,226 Z"
          fill="url(#humanLimbGrad)"
          stroke="#b0a090"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Face details */}
        <circle cx="112" cy="38" r="1.8" fill="#4a4a4a" />
        <circle cx="111.5" cy="37.5" r="0.6" fill="#777" />
        <circle cx="128" cy="38" r="1.8" fill="#4a4a4a" />
        <circle cx="127.5" cy="37.5" r="0.6" fill="#777" />
        <path d="M 116,50 C 118,52 122,52 124,50" fill="none" stroke="#c0a890" strokeWidth="0.7" />
        {/* Nose hint */}
        <path d="M 120,43 L 118,47 L 122,47" fill="none" stroke="#c0a890" strokeWidth="0.4" />

        {/* Organ regions */}
        {ORGANS.map((organ) => {
          const isHovered = hoveredOrgan === organ.id;
          const isLeft = organ.labelPos.x < 120;
          return (
            <g key={organ.id}>
              {/* Organ shape */}
              <path
                d={organ.path}
                fill={isHovered ? "rgba(232, 167, 53, 0.5)" : `url(#humanOrganGrad-${organ.id})`}
                stroke={isHovered ? "#d49520" : "#5a6e8a"}
                strokeWidth={isHovered ? 1.5 : 0.7}
                filter={isHovered ? "url(#humanGlow)" : undefined}
                style={{
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  opacity: isHovered ? 1 : 0.85,
                }}
                onClick={() => handleOrganClick(organ)}
                onMouseEnter={() => setHoveredOrgan(organ.id)}
                onMouseLeave={() => setHoveredOrgan(null)}
              />
              {/* Leader line */}
              {organ.leaderLine && (
                <line
                  x1={organ.leaderLine.from.x}
                  y1={organ.leaderLine.from.y}
                  x2={organ.leaderLine.to.x}
                  y2={organ.leaderLine.to.y}
                  stroke={isHovered ? "#d49520" : "#b0b8c4"}
                  strokeWidth={isHovered ? 0.8 : 0.5}
                  strokeDasharray="2,2"
                  style={{ pointerEvents: "none", transition: "all 0.3s ease" }}
                />
              )}
              {/* Dot at leader line end (body side) */}
              {organ.leaderLine && (
                <circle
                  cx={organ.leaderLine.to.x}
                  cy={organ.leaderLine.to.y}
                  r={1.2}
                  fill={isHovered ? "#d49520" : "#b0b8c4"}
                  style={{ pointerEvents: "none", transition: "all 0.3s ease" }}
                />
              )}
              {/* Label group */}
              <g
                style={{ cursor: "pointer" }}
                onClick={() => handleOrganClick(organ)}
                onMouseEnter={() => setHoveredOrgan(organ.id)}
                onMouseLeave={() => setHoveredOrgan(null)}
              >
                {/* Chinese label */}
                <text
                  x={organ.labelPos.x}
                  y={organ.labelPos.y}
                  textAnchor={isLeft ? "start" : "start"}
                  fontSize={isMobile ? 8 : 9}
                  fill={isHovered ? "#c88520" : "#2a3f5f"}
                  fontWeight={600}
                  filter="url(#humanLabelShadow)"
                  style={{ transition: "all 0.3s ease" }}
                >
                  {organ.label}
                </text>
                {/* English label */}
                <text
                  x={organ.labelPos.x}
                  y={organ.labelPos.y + (isMobile ? 9 : 10)}
                  textAnchor={isLeft ? "start" : "start"}
                  fontSize={isMobile ? 5.5 : 6.5}
                  fill={isHovered ? "#c88520" : "#8899aa"}
                  fontWeight={400}
                  fontStyle="italic"
                  style={{ transition: "all 0.3s ease" }}
                >
                  {organ.labelEn}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
      <div
        style={{
          fontSize: isMobile ? 10 : 11,
          color: "#a0a8b0",
          marginTop: 2,
          fontStyle: "italic",
        }}
      >
        Click on an organ to browse related data
      </div>
    </div>
  );
};

export default HumanBodyMap;
