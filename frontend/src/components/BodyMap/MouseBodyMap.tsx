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
    path: "M 104,82 C 99,79 94,81 93,86 C 92,91 94,96 99,98 C 104,100 110,99 113,95 C 116,91 115,86 111,83 C 108,81 106,81 104,82 Z",
    labelPos: { x: 18, y: 88 },
    leaderLine: { from: { x: 50, y: 91 }, to: { x: 91, y: 90 } },
    gradientColors: ["#a0d8b0", "#78c090"],
  },
  {
    id: "lung",
    label: "肺",
    labelEn: "Lung",
    tissueCategory: "肺",
    path: "M 128,108 C 132,100 140,96 146,98 C 152,100 155,106 154,112 C 153,118 149,124 144,128 C 139,132 133,130 130,126 C 127,122 126,114 128,108 Z M 115,108 C 111,100 103,96 97,98 C 91,100 88,106 89,112 C 90,118 94,124 99,128 C 104,132 110,130 113,126 C 116,122 117,114 115,108 Z",
    labelPos: { x: 198, y: 108 },
    leaderLine: { from: { x: 195, y: 112 }, to: { x: 155, y: 112 } },
    gradientColors: ["#b3d4f7", "#8ab8e8"],
  },
  {
    id: "heart",
    label: "心脏",
    labelEn: "Heart",
    tissueCategory: "心脏",
    path: "M 113,118 C 110,114 106,112 103,114 C 100,116 100,120 102,124 C 104,128 110,132 115,134 C 120,132 126,128 128,124 C 130,120 130,116 127,114 C 124,112 120,114 117,118 C 116,119 114,119 113,118 Z",
    labelPos: { x: 198, y: 130 },
    leaderLine: { from: { x: 195, y: 132 }, to: { x: 130, y: 126 } },
    gradientColors: ["#f4a0a0", "#e07070"],
  },
  {
    id: "liver",
    label: "肝脏",
    labelEn: "Liver",
    tissueCategory: "肝脏",
    path: "M 100,138 C 95,136 90,138 88,142 C 86,146 88,152 92,156 C 96,160 102,162 110,162 C 118,162 126,158 132,154 C 138,150 140,144 138,140 C 136,136 130,134 124,136 C 118,138 112,140 106,140 C 103,140 101,139 100,138 Z",
    labelPos: { x: 198, y: 152 },
    leaderLine: { from: { x: 195, y: 153 }, to: { x: 140, y: 148 } },
    gradientColors: ["#d4a87c", "#bc8c5e"],
  },
  {
    id: "cancer",
    label: "癌症",
    labelEn: "Cancer",
    tissueCategory: "癌症",
    path: "M 140,82 C 137,78 133,78 131,80 C 129,82 130,86 133,88 C 136,90 140,90 142,88 C 144,86 143,82 141,80 Z M 135,80 L 138,76 M 132,84 L 128,86 M 142,84 L 146,86 M 138,90 L 138,94",
    labelPos: { x: 198, y: 84 },
    leaderLine: { from: { x: 195, y: 86 }, to: { x: 147, y: 84 } },
    gradientColors: ["#ffa0a0", "#e87070"],
  },
  {
    id: "embryo",
    label: "胚胎",
    labelEn: "Embryo",
    tissueCategory: "胚胎",
    path: "M 100,170 C 96,167 92,169 91,174 C 90,179 92,184 97,186 C 102,188 108,187 111,184 C 114,181 114,175 111,172 C 108,169 104,168 100,170 Z",
    labelPos: { x: 18, y: 178 },
    leaderLine: { from: { x: 50, y: 180 }, to: { x: 89, y: 178 } },
    gradientColors: ["#d4b0d8", "#b890bc"],
  },
  {
    id: "reproductive",
    label: "生殖",
    labelEn: "Reproductive",
    tissueCategory: "生殖",
    path: "M 104,200 C 100,197 96,199 95,203 C 94,207 96,211 100,213 C 104,215 108,215 112,213 C 116,211 118,207 117,203 C 116,199 112,197 108,200 C 107,201 105,201 104,200 Z",
    labelPos: { x: 18, y: 208 },
    leaderLine: { from: { x: 50, y: 209 }, to: { x: 93, y: 207 } },
    gradientColors: ["#f0b0d0", "#d890b0"],
  },
];

interface MouseBodyMapProps {
  isMobile?: boolean;
}

const MouseBodyMap: React.FC<MouseBodyMapProps> = ({ isMobile = false }) => {
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
        Mouse Body Map
      </div>
      <svg
        viewBox="-10 10 290 270"
        style={{
          width: "100%",
          maxWidth: isMobile ? 300 : 420,
          height: "auto",
          margin: "0 auto",
          display: "block",
          overflow: "visible",
        }}
      >
        <defs>
          {/* Body gradient */}
          <radialGradient id="mouseBodyGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#faf5ee" />
            <stop offset="100%" stopColor="#e8ddd0" />
          </radialGradient>
          {/* Ear gradient */}
          <radialGradient id="mouseEarGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f5ebe0" />
            <stop offset="100%" stopColor="#ddd0c0" />
          </radialGradient>
          {/* Organ gradients */}
          {ORGANS.map((organ) => (
            <radialGradient key={`grad-${organ.id}`} id={`organGrad-${organ.id}`} cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor={organ.gradientColors[0]} />
              <stop offset="100%" stopColor={organ.gradientColors[1]} />
            </radialGradient>
          ))}
          {/* Hover glow filter */}
          <filter id="mouseGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Shadow for labels */}
          <filter id="mouseLabelShadow" x="-5%" y="-10%" width="110%" height="130%">
            <feDropShadow dx="0" dy="0.5" stdDeviation="0.5" floodColor="#000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Mouse body outline - side profile */}
        <path
          d="M 95,25 C 85,22 78,28 76,36 C 74,44 78,52 82,58
             C 75,56 68,58 64,64 C 60,70 62,76 66,78
             C 70,80 74,78 78,74 C 80,76 82,78 84,80
             C 86,84 86,90 86,96
             C 84,102 82,110 82,118
             C 80,126 78,134 78,142
             C 76,150 76,158 78,166
             C 78,174 78,182 80,190
             C 80,198 80,206 82,214
             C 82,222 80,230 78,238
             C 76,244 74,250 74,256
             C 74,262 78,266 84,266
             C 88,266 90,264 90,260
             C 90,256 92,252 94,250
             C 96,252 98,256 98,260
             C 98,264 100,266 104,266
             C 108,266 112,264 112,258
             C 112,252 110,246 108,240
             C 116,244 122,248 126,252
             C 128,256 128,260 128,264
             C 128,268 132,270 136,268
             C 140,266 140,262 138,258
             C 138,252 136,246 134,240
             C 140,236 144,230 146,224
             C 148,218 148,210 146,202
             C 144,194 142,186 140,178
             C 140,170 142,162 144,154
             C 146,146 148,138 148,130
             C 148,122 146,114 142,106
             C 140,100 138,94 138,88
             C 138,82 136,76 132,72
             C 128,68 124,66 120,66
             C 118,62 118,56 120,50
             C 122,44 122,36 118,30
             C 114,24 106,22 100,24 Z"
          fill="url(#mouseBodyGrad)"
          stroke="#8a7b6b"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Ear */}
        <ellipse cx="92" cy="28" rx="8" ry="12" fill="url(#mouseEarGrad)" stroke="#8a7b6b" strokeWidth="0.8" />
        {/* Inner ear detail */}
        <ellipse cx="92" cy="29" rx="4" ry="7" fill="none" stroke="#c0b0a0" strokeWidth="0.4" />

        {/* Eye */}
        <circle cx="100" cy="48" r="2.5" fill="#2a2a2a" />
        <circle cx="99" cy="47" r="0.8" fill="#666" />

        {/* Nose */}
        <circle cx="76" cy="68" r="2" fill="#e8a0a0" stroke="#c88080" strokeWidth="0.4" />

        {/* Whiskers */}
        <line x1="68" y1="64" x2="50" y2="58" stroke="#a09080" strokeWidth="0.4" opacity="0.7" />
        <line x1="68" y1="68" x2="48" y2="68" stroke="#a09080" strokeWidth="0.4" opacity="0.7" />
        <line x1="68" y1="72" x2="50" y2="78" stroke="#a09080" strokeWidth="0.4" opacity="0.7" />

        {/* Tail */}
        <path
          d="M 146,224 C 150,220 156,216 162,214 C 168,212 176,212 184,214 C 192,216 198,220 202,224 C 206,228 208,234 206,240"
          fill="none"
          stroke="#c0a888"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Feet detail lines */}
        <line x1="82" y1="264" x2="80" y2="268" stroke="#a09080" strokeWidth="0.4" />
        <line x1="85" y1="264" x2="85" y2="268" stroke="#a09080" strokeWidth="0.4" />
        <line x1="88" y1="264" x2="90" y2="268" stroke="#a09080" strokeWidth="0.4" />

        {/* Organ regions */}
        {ORGANS.map((organ) => {
          const isHovered = hoveredOrgan === organ.id;
          const isLeft = organ.labelPos.x < 120;
          return (
            <g key={organ.id}>
              {/* Organ shape */}
              <path
                d={organ.path}
                fill={isHovered ? "rgba(232, 167, 53, 0.5)" : `url(#organGrad-${organ.id})`}
                stroke={isHovered ? "#d49520" : "#5a6e8a"}
                strokeWidth={isHovered ? 1.5 : 0.7}
                filter={isHovered ? "url(#mouseGlow)" : undefined}
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
                  filter="url(#mouseLabelShadow)"
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

export default MouseBodyMap;
