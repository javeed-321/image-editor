# Image Editor — Architecture

A client-side image editor built on **Next.js 16 (App Router) + React 19** with **Fabric.js 6** as the canvas engine. It's effectively a single-page app: `app/page.tsx` renders one `<Editor />`, and **`fabric-canvas.tsx` is the orchestrator** that owns all state and wires together a layer of focused Fabric hooks. Persistence is entirely `localStorage` — no backend.

---

## 1. High-level layers

```mermaid
flowchart TB
    subgraph APP["app/ — Next.js App Router"]
        page["page.tsx (SEO/metadata)"] --> editor["editor.tsx<br/>(dynamic import, ssr:false)"]
    end

    editor --> FC["fabric-canvas.tsx<br/><b>ORCHESTRATOR</b><br/>owns all state + refs"]

    subgraph UI["UI Components (components/editor/*)"]
        TB["EditorToolbar"]
        STB["SecondaryToolbar"]
        CROP["Crop action bar"]
        SAVE["SaveMenu"]
        UP["UploadScreen"]
        BG["BackgroundPopover"]
        FN["FilenameEditor"]
        DC["DiscardChangesDialog"]
    end

    subgraph HOOKS["Fabric hooks (components/editor/fabric/*)"]
        INIT["useCanvasInit"]
        FIT["useCanvasFit"]
        HIST["useCanvasHistory"]
        TOOL["useCanvasTool"]
        CR["useCrop"]
        BGH["useCanvasBackground"]
        RC["useRoundedCorners"]
    end

    subgraph ENGINE["Fabric.js 6 engine"]
        CANVAS["fabric.Canvas (fabricRef)"]
        IMG["userImage (userImageRef)"]
        OBJS["text / shapes / brush paths"]
    end

    FC --> UI
    FC --> HOOKS
    HOOKS --> ENGINE
    FC -. "persist" .-> LS[("localStorage<br/>STORAGE keys")]
```

---

## 2. Component tree

```mermaid
flowchart TD
    EDITOR["editor.tsx"] --> FC["fabric-canvas.tsx"]

    FC -->|no image| UP["UploadScreen<br/>file / URL / examples"]
    UP --> LAND["LandingContent"]
    UP --> URL["UploadFromURL"]

    FC -->|has image| TB["EditorToolbar<br/>tools · color · undo/redo · rotate · crop · save"]
    TB --> FN["FilenameEditor"]
    TB --> BG["BackgroundPopover<br/>color · gallery · padding · radius"]

    FC --> STB["SecondaryToolbar<br/>(floating pill)<br/>font/size · highlight · blur"]
    FC --> CROP["Crop action bar<br/>(above canvas, cropMode only)<br/>Cancel / Apply"]
    FC --> CANVASEL["&lt;canvas&gt; element"]
    FC --> DC["DiscardChangesDialog (mobile)"]
    FC --> SAVE["SaveMenu (mobile)<br/>format · resolution · download"]
```

> Note: the tree is intentionally **shallow** — one canvas plus a handful of overlay/toolbar children. Complexity lives in the hooks layer, not in nesting.

---

## 3. State + refs wiring (the orchestrator)

`fabric-canvas.tsx` holds the single source of truth and passes slices into each hook.

```mermaid
flowchart LR
    subgraph REFS["Refs (survive renders)"]
        fabricRef["fabricRef<br/>fabric.Canvas"]
        userImageRef["userImageRef<br/>FabricImage"]
        fitRef["fitRef<br/>() => void"]
        histRefs["historyRef / historyIdxRef"]
        canvasWrapRef["canvasWrapRef (viewport)"]
    end

    subgraph STATE["React state"]
        tool["tool"]
        color["color"]
        font["fontSize / fontFamily"]
        sizes["highlightSize / blurSize"]
        pad["padding / cornerRadius (debounced)"]
        bg["bgColor / bgGallery / bgActiveIndex"]
        meta["naturalSize / imageScale"]
        flags["imageSrc / hasImage / loading / cropMode"]
    end

    STATE --> FC["fabric-canvas.tsx"]
    REFS --> FC

    FC --> useCanvasInit["useCanvasInit<br/>(fabricRef, userImageRef, fitRef)"]
    FC --> useCanvasFit["useCanvasFit<br/>(fitRef, naturalSize, imageScale, padding)"]
    FC --> useCanvasHistory["useCanvasHistory<br/>(historyRef, idx, canUndo/Redo)"]
    FC --> useCanvasTool["useCanvasTool<br/>(tool, color, sizes, cropMode)"]
    FC --> useCrop["useCrop<br/>(cropMode, cropRectRef)"]
    FC --> useCanvasBackground["useCanvasBackground<br/>(bgImageUrl)"]
    FC --> useRoundedCorners["useRoundedCorners<br/>(cornerRadius)"]
```

### Hook responsibilities

| Hook | Responsibility | Key refs/state |
|---|---|---|
| `useCanvasInit` | Create `fabric.Canvas`, load image, attach `path:created`/`object:modified` → `pushHistory` | `fabricRef`, `userImageRef`, sets `fitRef` consumer |
| `useCanvasFit` | Size canvas to viewport, center image, apply padding/rotation; **provides `fit()`** | `fitRef` (setter), `setNaturalSize`, `setImageScale` |
| `useCanvasHistory` | Undo/redo via JSON snapshots; restore = `loadFromJSON` + repoint `userImageRef` + refit | `historyRef`, `historyIdxRef`, `canUndo/canRedo` |
| `useCanvasTool` | Switch drawing mode: pen / highlight / blur / select; disabled in crop | `fabricRef`, `tool`, `color`, sizes, `cropMode` |
| `useCrop` | Enter/cancel/apply crop; inset rect with custom handles; apply mutates `img.cropX/Y/W/H` | `cropRectRef`, `cropMode` |
| `useCanvasBackground` | Load bg image → `canvas.backgroundImage` → `fit()` (cover math) | `bgImageUrl`, `fitRef` |
| `useRoundedCorners` | `clipPath` rounded rect on `userImageRef` | `cornerRadius` |

---

## 4. Data flow — upload → edit → export

```mermaid
sequenceDiagram
    participant U as User
    participant FC as fabric-canvas
    participant Init as useCanvasInit
    participant Fit as useCanvasFit
    participant Hist as useCanvasHistory
    participant Canvas as fabric.Canvas
    participant LS as localStorage

    U->>FC: upload file / URL
    FC->>LS: persist USER_IMAGE, FILENAME
    FC->>Init: imageSrc changes
    Init->>Canvas: new Canvas + load FabricImage
    Init->>Fit: fitRef.current()
    Fit->>Canvas: size + center + padding/rotation
    Fit->>FC: setNaturalSize / setImageScale
    Fit->>Hist: seed initial snapshot

    loop Editing
        U->>FC: pick tool / draw / add shape / type
        FC->>Canvas: addText/addRect/addCircle/addArrow or brush
        Canvas->>Hist: object:modified / path:created → pushHistory()
    end

    U->>FC: Undo / Redo
    FC->>Hist: restore(±1)
    Hist->>Canvas: loadFromJSON + repoint userImageRef
    Hist->>Fit: fit()

    U->>FC: Save
    FC->>Canvas: exportCanvas() → toDataURL(multiplier)
    Canvas-->>U: download PNG/JPG
```

---

## 5. Persistence (localStorage via `lib/utils.ts` → `STORAGE`)

| Key | Holds | Written |
|---|---|---|
| `editor.userImage` | image data-URL (≤ 4 MB) | on upload |
| `editor.filename` | export filename | on rename |
| `editor.bgColor` | canvas background hex | debounced |
| `editor.padding` / `editor.cornerRadius` | frame sliders | debounced |
| `editor.bgGallery` | JSON array of bg data-URLs | on add/remove |
| `editor.bgActiveIndex` | active gallery item | on select |

Guards: `MAX_PERSISTED_IMAGE_BYTES = 4MB`, `MAX_W/MAX_H = 4000px`, `safeSet()` swallows quota errors.

---

## 6. Key mechanics worth knowing

- **CSS-downscale rendering**: backstore renders at native resolution; the `<canvas>` element is CSS-shrunk to fit. `cssScaleOf()` converts screen-px sizes → canvas-px so handles/strokes/fonts stay a constant on-screen size at any image resolution.
- **History = JSON snapshots**: `toObject([...])` strings pushed to `historyRef`; `loadFromJSON` rebuilds **new** object instances, so restore must repoint `userImageRef` and refit.
- **`fitRef` indirection**: `useCanvasFit` writes `fit()` into `fitRef` so other hooks (history, crop, background, rotate) can re-fit without import cycles.
- **Font cap**: corner-resizing text clamps **scale** (not `fontSize`) to keep box + glyphs in lockstep, bounded by `MIN_FONT`/`MAX_FONT`.

---

## 7. Tech stack

`fabric@6.9.1` · `next@16.2.6` · `react@19.2` · `@radix-ui` + `shadcn` UI · `lucide-react` icons · `tailwindcss@4` · `sonner` toasts · `vitest` tests.
