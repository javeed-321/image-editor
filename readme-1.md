When does fit() actually run?
Four triggers, all routed through the same function:

Container resizes — orientation change, browser resize, toolbar wrapping, address bar collapse:


const ro = new ResizeObserver(fit);
ro.observe(wrap);                              // line 182-183
ResizeObserver also fires once immediately when you call .observe() — that's our initial fit.

A dep changes — padding, bgColor, zoom, or hasImage flips. The whole useEffect re-runs (line 185), which builds a new fit closure (with the latest values), stores it in fitRef, and re-observes.

User rotates — rotate() (line 276) does the math to spin every object 90° around the old center, then calls fitRef.current() at the end (line 308) to resize the canvas to the swapped dimensions.

Background image loads — the bgImage effect (line 199) assigns c.backgroundImage, then calls fitRef.current() to re-stretch and re-render in one go.


Refs (mutable, survive renders, don't trigger re-renders)
fabric-canvas.tsx:33-40

Ref	Purpose
canvasElRef	Points to the raw <canvas> DOM element. Fabric needs this to attach.
canvasWrapRef	Points to the wrapping <div> — used by ResizeObserver and to read available width/height for fit-to-viewport.
fabricRef	The live fabric.Canvas instance (the scene graph). Every render/mutation goes through this.
historyRef	Array of JSON snapshots for undo/redo.
historyIdxRef	Current position inside historyRef.
restoringRef	Guard flag — while restoring from history, suppress pushHistory so undo/redo don't pollute the stack.
userImageRef	The user's uploaded FabricImage object — kept separately so it can be protected from deletion and rotated as the anchor.
fitRef	Holds the current fit() function so external handlers (rotate, bg image load) can call it without depending on stale closures.

fabric-canvas.tsx — Full Walkthrough
This is the central editor component. It wraps a raw <canvas> DOM element with a Fabric.js scene graph, manages state for the image/tools/zoom/background, and wires React state changes into Fabric rendering through a chain of useEffects.

The mental model (also drawn in the ASCII diagram at the bottom of the file):

React state → triggers useEffect → mutates fabric.Canvas (scene graph) → which paints onto <canvas> DOM pixels.

1. Refs and State — what each one holds
Refs (mutable, survive renders, don't trigger re-renders)
fabric-canvas.tsx:33-40

Ref	Purpose
canvasElRef	Points to the raw <canvas> DOM element. Fabric needs this to attach.
canvasWrapRef	Points to the wrapping <div> — used by ResizeObserver and to read available width/height for fit-to-viewport.
fabricRef	The live fabric.Canvas instance (the scene graph). Every render/mutation goes through this.
historyRef	Array of JSON snapshots for undo/redo.
historyIdxRef	Current position inside historyRef.
restoringRef	Guard flag — while restoring from history, suppress pushHistory so undo/redo don't pollute the stack.
userImageRef	The user's uploaded FabricImage object — kept separately so it can be protected from deletion and rotated as the anchor.
fitRef	Holds the current fit() function so external handlers (rotate, bg image load) can call it without depending on stale closures.
State (triggers React re-render when changed)
fabric-canvas.tsx:42-64

State	Effect when changed
imageSrc	If null → show UploadScreen. If set → triggers effect at L82 to create the canvas and load the image.
filename	Used only for the save filename and toolbar label.
bgImageUrl	Triggers effect at L188 that loads & attaches a background image.
tool	Triggers effect at L124 — switches pen mode on/off.
color	Same effect — re-creates the pen brush.
zoom	Triggers the fit effect at L138 — recomputes canvas size.
hasImage	Gate flag — fit effect and bg effect only run after the image is on the canvas.
padding	Recomputes framed canvas dimensions in fit().
bgColor	Sets c.backgroundColor inside fit().
bgDialogOpen	UI-only — opens the background settings dialog.
The three persisted values (imageSrc, filename, bgImageUrl) seed from localStorage on first render via lazy initializers, so a refresh restores the session.

2. Initial Render Path

First render
   │
   ├─ imageSrc is null (no prior upload) ──► return <UploadScreen/> [L234]
   │     User picks file / URL → uploadFromFile/URL sets imageSrc
   │     React re-renders
   │
   ▼
imageSrc is set ──► render the editor JSX (toolbar + <canvas>) [L358]
   │
   ▼
useEffect [L82] fires because imageSrc changed
   ├─ Creates fabric.Canvas bound to canvasElRef
   ├─ Loads imageSrc as FabricImage
   ├─ Scales to fit MAX_W (1100) × MAX_H (2000)
   ├─ Locks it (selectable:false, evented:false) so the user can't drag the base image
   ├─ Sets canvas dimensions to scaled image size
   ├─ Stores it in userImageRef
   ├─ setHasImage(true)  ← unlocks the next effects
   └─ Subscribes path:created and object:modified to pushHistory
   
   Cleanup: cancels in-flight load, disposes Fabric canvas
3. The fit() Effect — the Render Pipeline Heart
fabric-canvas.tsx:138-185

This is the most important effect. It runs whenever hasImage, padding, bgColor, or zoom changes, and also runs on every container resize via ResizeObserver.

What fit() actually does in order:

Reads the image's axis-aligned bounding box with getBoundingRect(). The comment at L146 is key — after rotation, this auto-swaps width/height for 90°/270°, so the framed canvas size is always correct.
Computes framed dimensions: framedW = bounds.width + 2*padding. Padding inflates the frame around the image.
Centers the user image at (framedW/2, framedH/2) and calls setCoords() to refresh hit-detection.
Applies bgColor as the canvas background.
Rescales the background image (if any) to cover the framed area exactly.
Computes fit-to-viewport zoom from the wrapper's measured size minus 24px padding, capped at 1×. Multiplies by user zoom (state), clamped to ≥ 0.1.
Applies zoom + sets canvas dimensions to framedW * z × framedH * z so the DOM canvas physically matches the visible zoomed area.
Seeds history with the initial state if empty.
fitRef.current = fit lets rotate() and the bg-image effect re-trigger fit without taking the dep array into their own scope.

The ResizeObserver (on the wrapping div) re-runs fit whenever the container resizes — so the canvas re-fits responsively when the window or sidebar layout changes.

4. Tool/Color Effect — Pen Mode
fabric-canvas.tsx:124-136

If tool === "pen": enables isDrawingMode, creates a PencilBrush with current color and width 4. Fabric handles all mouse events automatically — strokes are added as Path objects, which fire path:created → pushHistory.
Otherwise: turns isDrawingMode off. Selection mode (default Fabric behavior) is restored.
Changing color while in pen mode re-runs this effect and replaces the brush with a new one.

5. Background Image Effect
fabric-canvas.tsx:188-209

If bgImageUrl is null → clears c.backgroundImage.
If set → loads it as a FabricImage, assigns it, then calls fitRef.current() which rescales it to match framed dimensions.
Gated on hasImage so this can't run before the user image is loaded.
cancelled flag protects against state changes during async load.
6. Toolbar Actions
handleTool(id) L243
Sets the tool state. For shape tools (text/rect/circle/arrow), it directly calls the helper from ./shapes which adds the object to the canvas. For non-pen/non-select tools, pushes a history snapshot immediately. Pen and select have their own history triggers (path:created, object:modified).

restore(delta) — Undo/Redo L255
delta = -1 (undo) or +1 (redo).
Bounds-checks nextIndex, sets restoringRef = true (so loadFromJSON events don't push to history), loads the snapshot, then clears the flag.
rotate() — 90° CW L276
The trickiest method. After rotation, the framed canvas swaps W↔H, so every object needs to be both rotated and re-anchored:

Captures old framed center (oldCx, oldCy).
Computes new center as if W↔H swapped.
For each object: treats (left, top) as a vector from oldCx, oldCy, applies a 90° CW rotation (x,y) → (-y, x), re-anchors to newCx, newCy, and adds 90° to the object's angle.
Calls fitRef.current() to resize the DOM canvas and rescale the bg image.
This way shapes/text added by the user rotate together with the image, staying in the same relative position.

deleteSelected() L313
Removes active objects except the user image (protected via userImageRef identity check), discards selection, re-renders, pushes history.

cancel() L326
Resets all state to initial values, clears history, and clears userImageRef. Setting imageSrc to null causes the next render to return <UploadScreen/>, which by virtue of the effect cleanup at L117 disposes the Fabric canvas. Note: this does NOT clear localStorage, so refreshing will rehydrate the prior image.

save() L341
Uses toDataURL({format:"png", multiplier:1}) and a programmatic anchor click to trigger a download.

handleBgImgChange(url) L351
Sets bgImageUrl state and persists it to localStorage (or removes if null). The state change cascades into the bg-image effect.

7. Upload Path
fabric-canvas.tsx:212-229

uploadFromFile: reads file via FileReader as a base64 data URL, stores in state + localStorage.
uploadFromURL: stores the URL directly (no persistence — likely a small bug, since the file path persists but URL doesn't).
Both setting imageSrc will trigger the main canvas-init effect.

8. JSX Layout
fabric-canvas.tsx:358-424

<EditorToolbar> — top bar with tool buttons, color picker, undo/redo, rotate, background, save, cancel. All callbacks wired here.
<BackgroundDialog> — modal for changing padding, bg color, bg image.
Canvas wrap (canvasWrapRef) — the scrollable centered container. The <canvas> lives inside a styled rounded border.
Zoom pill — − / % / + buttons that adjust zoom state (clamped 0.25–2). State change triggers fit effect.
Mobile bottom bar — duplicate Cancel/Save for small screens.
9. Cause → Effect Cheatsheet
User action	Trigger	Outcome
Upload image	setImageSrc	Canvas-init effect fires → image loaded, sized, locked
Switch to Pen	setTool("pen")	Tool effect → isDrawingMode=true, brush set
Change color in Pen	setColor	Tool effect → new brush with new color
Add Rect/Text/etc	handleTool	Shape helper adds object → pushHistory
Draw a stroke	Fabric path:created event	pushHistory
Move/resize object	Fabric object:modified event	pushHistory
Change padding/bgColor/zoom	State change	Fit effect → recompute framed size, re-zoom, redraw bg
Add bg image	setBgImageUrl	Bg effect → load + attach + call fit()
Rotate	rotate()	Manually rotates all objects, then fit()
Container resize	ResizeObserver	fit() fires
Undo/Redo	restore(±1)	loadFromJSON with restoringRef guard
Cancel	cancel()	All state reset → UploadScreen returns; effect cleanup disposes canvas
Save	save()	toDataURL → triggers download
10. Subtle Points / Gotchas
Why fitRef? Because the fit function closes over padding, bgColor, zoom from the effect scope. rotate() and the bg-image effect live outside that scope but need to call the current fit. Storing it in a ref gives them the freshest version without dependency hell.
Why lock the user image? selectable:false, evented:false prevents the user from accidentally dragging or resizing the base image — only added shapes/text are interactive.
Why protect it from delete? deleteSelected filters out userImageRef so multi-select+Delete doesn't wipe the base.
History is JSON, not commands — every snapshot is the full canvas serialized. Simple but memory-hungry for big sessions.
restoringRef guard — prevents an infinite loop where loadFromJSON triggers object:modified which would push history again during undo/redo.
uploadFromURL doesn't persist to localStorage like uploadFromFile does — likely a minor inconsistency.
cancel() doesn't clear localStorage — refresh after cancel brings back the prior session.





It's not because of access — you're right that you could put it outside the effect (but still inside the component) and it would access state fine.

The real reasons are:

Reason 1: fit() is subscribed to a ResizeObserver

const ro = new ResizeObserver(fit);
ro.observe(wrap);
return () => ro.disconnect();
The observer needs setup (subscribe) and cleanup (disconnect). That's exactly what useEffect is for. Since fit is what gets passed to the observer, declaring it right next to the subscription keeps the wiring in one place.

Reason 2: When state changes, the observer needs a new fit
If padding changes:

A new render runs.
A new fit closure is created that captures the new padding.
The old ResizeObserver (which is still holding the old fit) must be disconnected.
A new observer must be created with the new fit.
useEffect with [padding, bgColor, zoom] in deps handles all of that automatically — cleanup → re-run → new subscription.