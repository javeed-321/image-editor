"use client";

import { useEffect, useRef } from "react";

export default function CanvasPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // rectangle
    ctx.fillStyle = "tomato";
    ctx.fillRect(50, 50, 200, 120);

    // circle
    ctx.fillStyle = "steelblue";
    ctx.beginPath();
    ctx.arc(400, 110, 60, 0, Math.PI * 2);
    ctx.fill();

    // line
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 250);
    ctx.lineTo(500, 250);
    ctx.stroke();

    // text
    ctx.fillStyle = "white";
    ctx.font = "24px sans-serif";
    ctx.fillText("Hello Canvas", 50, 300);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      style={{ background: "#222", display: "block", margin: "40px auto" }}
    />
  );
}