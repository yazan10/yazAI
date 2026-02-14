import React from 'react';

interface SendIcon3DProps {
  className?: string;
  size?: number;
}

export const SendIcon3D: React.FC<SendIcon3DProps> = ({ className, size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="icon-3d-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
          <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#000" floodOpacity="0.1" />
        </filter>
        <linearGradient id="main-gradient" x1="5" y1="5" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
        <linearGradient id="side-gradient" x1="15" y1="15" x2="35" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
      </defs>

      <g filter="url(#icon-3d-shadow)">
        {/* Right Wing (Darker Side) */}
        <path
          d="M34 6 L20 34 L15 21 L34 6Z"
          fill="url(#side-gradient)"
          stroke="#94A3B8"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />

        {/* Left Wing (Lighter Side) */}
        <path
          d="M34 6 L6 20 L15 21 L34 6Z"
          fill="url(#main-gradient)"
          stroke="#FFFFFF"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
        
        {/* Center Fold Accent */}
        <path
          d="M34 6 L15 21"
          stroke="#CBD5E1"
          strokeWidth="0.5"
        />
      </g>
    </svg>
  );
};
