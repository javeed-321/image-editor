import { ImageResponse } from "next/og";

export const alt =
  "ImageEditor — free online screenshot editor. Edit, annotate, blur, crop, and add text to screenshots in your browser. No signup, no install.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Pre-render at build time and cache forever so social crawlers
// (Twitter, LinkedIn, Slack, Facebook) never hit a cold generation path.
export const dynamic = "force-static";
export const revalidate = false;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f7f7",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "40px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(17,24,39,0.06) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div
          style={{
            width: 1040,
            background: "#ffffff",
            borderRadius: 28,
            border: "3px dashed #dadada",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "70px 60px",
            boxShadow: "0 30px 80px -20px rgba(17,24,39,0.18)",
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 24,
              background: "#f1f1f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#595959"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 800,
              color: "#1a1a1a",
              letterSpacing: "-0.025em",
              marginBottom: 14,
            }}
          >
            Edit Text on Screenshot
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#595959",
              marginBottom: 40,
              textAlign: "center",
            }}
          >
            Edit, annotate & blur text on screenshots — free, no signup
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 8px 20px -8px rgba(17,24,39,0.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#1a1a1a",
                color: "#ffffff",
                fontSize: 24,
                fontWeight: 600,
                padding: "18px 32px",
              }}
            >
              Choose a file
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#1a1a1a",
                color: "#ffffff",
                padding: "18px 16px",
                borderLeft: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: "#595959",
              marginTop: 24,
            }}
          >
            or drag and drop a file
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 16,
              color: "#7a7a7a",
              marginTop: 8,
            }}
          >
            Supports PNG, JPG, GIF, WebP image formats
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 32,
            color: "#595959",
            fontSize: 20,
            fontWeight: 500,
          }}
        >
          <svg width="26" height="26" viewBox="0 0 32 32">
            <defs>
              <linearGradient id="bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6b7df5" />
                <stop offset="100%" stopColor="#3143e3" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="7" fill="url(#bg)" />
            <rect
              x="5"
              y="6"
              width="22"
              height="17"
              rx="3"
              fill="rgba(255,255,255,0.2)"
            />
            <circle cx="11" cy="11.5" r="1.9" fill="#ffffff" />
            <path
              d="M5 23 L12 14 L17 18 L21.5 13 L27 19 L27 23 Z"
              fill="#ffffff"
            />
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
          </svg>
          <span style={{ color: "#1a1a1a", fontWeight: 700 }}>ImageEditor</span>
          <span>· Free, browser-based, no signup</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
