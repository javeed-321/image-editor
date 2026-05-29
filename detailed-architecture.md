# Screenshot Editor — Architecture & Product Report

> A free, browser-based screenshot annotation editor: upload an image, annotate it (pen,
> text, shapes, highlight, redaction), frame it (padding, rounded corners, backgrounds),
> crop/rotate, and export — all client-side, no signup, no servers.

| | |
|---|---|
| **Prepared for** | Leadership / Engineering Review |
| **Date** | 2026-05-29 |
| **Status** | Pre-production (hardening in progress) |
| **Live demo** | https://image-editor-two-iota.vercel.app/ |

---

## 1. Overview

A single-page, **fully client-side** image annotation tool. Images are read locally, edited
on an HTML canvas, saved to `localStorage`, and exported straight to disk — so the product
is fast, private, and **zero-cost to operate** (no servers or storage bills). The UX is
modeled on Evernote's "Edit text on screenshot," built with **Fabric.js + a custom UI**.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Framework / runtime | Next.js 16 (App Router), React 19 |
| Canvas engine | Fabric.js 6 (drawing, shapes, text, transforms, serialization) |
| Styling / UI | Tailwind CSS 4, Radix/Base UI primitives, lucide-react icons |
| Language / testing | TypeScript 5, Vitest |

---

## 3. Architecture

```
Next.js route (app/page.tsx) → <Editor/>  (+ SEO metadata, JSON-LD)
        │  dynamic import, ssr:false
        ▼
FabricCanvas (orchestrator)
  • React state: tool, color, padding, radius, fonts
  • Imperative refs: canvas, user image, fit fn
  • Hooks: Init · History · Fit · Tool · Background · RoundedCorners · Crop
        │
        ▼
Fabric.js — two stacked canvases (static render + interaction layer)
        │
        ▼
localStorage (image, settings, background gallery)
```

- **Two-layer canvas:** Fabric renders a static *lower* canvas (committed objects) plus a
  transparent *upper* canvas for interaction (selection, handles, drag previews) — so
  dragging never re-renders the whole scene.
- **Hook-per-concern:** instead of one giant component, each capability is an isolated
  custom hook sharing a few refs (`fabricRef`, `userImageRef`, `fitRef`, history). Refs hold
  imperative Fabric objects; React state is reserved for UI controls that should re-render.
- **Persistence:** a `safeSet()` wrapper around `localStorage` returns quota errors instead
  of throwing, so oversized images degrade into a toast rather than a crash.

### Hook responsibilities

| Hook / module | Responsibility |
|---|---|
| `useCanvasInit` | Create canvas, load & scale image, wire edit→history, dispose on unmount |
| `useCanvasHistory` | Undo/redo snapshots (de-duped); re-points the image ref after restore |
| `useCanvasFit` | Frame size (image + padding), center, fit-to-viewport zoom, resize observer |
| `useCanvasTool` | Switch tool / brush (pen, highlight, blur) or selection mode |
| `useCanvasBackground` / `useRoundedCorners` | Apply background image / rounded-corner clip |
| `useCrop` | Crop mode + rotation-aware mapping to source pixels |
| `canvas-actions.ts` / `shapes.ts` | Rotate, delete, export / shape factories |

---

## 4. Features

| Category | Features |
|---|---|
| **Annotate** | Pen, Text, Arrow, Rectangle, Circle, Highlight, Blur/redact |
| **Transform** | Crop, Rotate (90°) |
| **Frame** | Padding, corner radius, background color & image gallery |
| **Export** | PNG at preset/custom sizes via native "Save As" dialog |
| **Workflow** | Undo/Redo, keyboard shortcuts, upload from device or URL, auto-save |

---

## 5. UI / UX

```
┌──────────────┐   upload file / URL    ┌──────────────┐
│ Upload Screen │ ─────────────────────► │ Editor Screen │
│ drag-drop,    │ ◄───────────────────── │ toolbars,     │
│ picker, URL   │      "New Image"       │ canvas, save  │
└──────────────┘                        └──────────────┘
```

| Component | Role |
|---|---|
| `fabric-canvas.tsx` | Orchestrator — state, refs, hook wiring, screen switching |
| `editor-toolbar.tsx` | Tools, color, undo/redo, crop, rotate, background, delete |
| `secondary-toolbar.tsx` | Contextual controls (font/size, brush size) |
| `background-dialog.tsx` | Padding, corner radius, bg color & image gallery |
| `save-menu.tsx` / `upload-screen.tsx` | Export panel / upload + landing |

- **Responsive:** desktop actions live in the top toolbar; mobile uses a fixed bottom bar
  and horizontally scrolling tools.
- **Keyboard shortcuts:** Undo `Ctrl/Cmd+Z`, Redo `Ctrl/Cmd+Shift+Z` / `Ctrl+Y`,
  Save `Ctrl/Cmd+S`, Delete `Delete`/`Backspace` — all suppressed while typing.

---

## 6. Key Technical Solutions

- **Confining annotations to the image** — a per-object `clipPath` keeps shapes/strokes from
  spilling into the padded frame, without clipping the image or background.
- **Rotation-aware crop** — crop-rectangle corners are mapped through the inverse image
  transform matrix, so crops are correct at any rotation (not just 0°).
- **Reliable undo/redo** — JSON snapshots with de-duplication; the image reference is
  re-acquired after each restore; the transient crop rectangle is excluded from history.
- **Fit & zoom** — image is framed (bounds + padding) and scaled to the container; a
  `ResizeObserver` keeps it fitted on window/layout changes.
- **Export** — renders at the chosen size and saves via the File System Access API ("Save
  As" dialog) with a download fallback, and a CORS guard that shows a toast instead of
  crashing.

**SEO/AEO:** static + dynamic metadata, JSON-LD, sitemap, robots, Open Graph / Twitter cards.
**Testing:** Vitest suite — 6 files, 28 tests passing.

---

## 7. Production Readiness

**Resolved:** crop-after-rotate math, rounded corners after crop, undo reference loss,
crop lines lingering on undo, CORS-tainted export crash, keyboard shortcuts, native save
dialog, upload spinner timing.

**Open before launch:**

| Priority | Item |
|---|---|
| 🔴 P0 | Toast when a large image exceeds `localStorage` quota |
| 🟠 P1 | Clamp custom export width (prevent out-of-memory) + sanitize filename |
| 🟡 P2 | Pre-downscale huge mobile photos · add error boundary · minor cleanup |

---

## 8. Roadmap & Delivery Status

**Next up:** Step/number tool, explicit zoom controls, padding sub-toolbar,
extra export formats (JPG/WebP).

| Task | Status |
|---|---|
| Responsiveness, documentation, crop & highlighting | ✅ Completed |
| Multi-size saving, upload progress, image-name editing | ✅ Completed |
| SEO / AEO (metadata, JSON-LD, sitemap, robots, OG/Twitter) | ✅ Completed |
| Padding in separate navbar | ⏳ Pending |

**Verdict:** feature-complete and ready for a controlled launch with a short known-issues list.
