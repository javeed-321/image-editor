import { ImageResponse } from "next/og";

export const alt = "ImageEditor — Edit Text on Screenshots Online";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          padding: "80px",
          background:
            "linear-gradient(135deg, #4b5cf0 0%, #3143e3 55%, #1f2bb8 100%)",
          color: "#ffffff",
          fontFamily: "Inter, system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)",
            backgroundSize: "28px 28px",
            opacity: 0.5,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 56,
            left: 64,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(255,255,255,0.14)",
              border: "1.5px solid rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 32 32">
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
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            ImageEditor
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "10px 18px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.32)",
            fontSize: 22,
            fontWeight: 500,
            marginBottom: 28,
          }}
        >
          Free • Browser-based • No signup
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            textAlign: "left",
            alignSelf: "flex-start",
          }}
        >
          Edit Text on
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            textAlign: "left",
            alignSelf: "flex-start",
            backgroundImage:
              "linear-gradient(90deg, #ffffff 0%, #ffd166 100%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Screenshots, Online.
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 400,
            color: "rgba(255,255,255,0.86)",
            marginTop: 32,
            alignSelf: "flex-start",
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          Annotate, blur, crop, and erase text in your browser — no signup, no
          install.
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 64,
            right: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: "rgba(255,255,255,0.78)",
          }}
        >
          <div style={{ display: "flex", gap: 28 }}>
            <span>Pen</span>
            <span>•</span>
            <span>Highlight</span>
            <span>•</span>
            <span>Blur</span>
            <span>•</span>
            <span>Crop</span>
            <span>•</span>
            <span>Rotate</span>
          </div>
          <div style={{ display: "flex", fontWeight: 600, color: "#ffffff" }}>
            imageeditor →
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
