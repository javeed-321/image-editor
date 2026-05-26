import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6b7df5 0%, #3143e3 100%)",
        }}
      >
        <svg
          width="132"
          height="132"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="frame">
              <rect x="5" y="6" width="22" height="17" rx="3" />
            </clipPath>
          </defs>
          <rect
            x="5"
            y="6"
            width="22"
            height="17"
            rx="3"
            fill="rgba(255,255,255,0.18)"
          />
          <g clipPath="url(#frame)">
            <circle cx="11" cy="11.5" r="1.9" fill="#ffffff" />
            <path
              d="M3 24 L12 14 L17 18 L21.5 13 L29 21 L29 25 L3 25 Z"
              fill="#ffffff"
            />
          </g>
          <rect
            x="5"
            y="6"
            width="22"
            height="17"
            rx="3"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
          <g transform="translate(19.5 18.2) rotate(-40)">
            <rect
              x="0"
              y="-1.8"
              width="9.5"
              height="3.6"
              rx="0.9"
              fill="#ffd166"
              stroke="#3143e3"
              strokeWidth="0.6"
            />
            <path
              d="M9.5 -1.8 L12 0 L9.5 1.8 Z"
              fill="#ffffff"
              stroke="#3143e3"
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
            <rect
              x="0"
              y="-1.8"
              width="1.8"
              height="3.6"
              rx="0.6"
              fill="#3143e3"
            />
          </g>
        </svg>
      </div>
    ),
    { ...size },
  );
}
