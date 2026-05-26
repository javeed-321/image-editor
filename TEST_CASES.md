# Manual Test Cases — Image / Screenshot Editor

A checklist for hand-testing every user-facing feature of the editor.
Run the app with `npm run dev` and open `http://localhost:3000`.

Legend: ✅ pass · ❌ fail · ➖ N/A

**Test environment**

| Item        | Value |
|-------------|-------|
| Date        |       |
| Browser     |       |
| OS          |       |
| Tester      |       |
| App version |       |

---

## 1. Upload Screen ([components/editor/upload-screen.tsx](components/editor/upload-screen.tsx))

The upload screen is shown when no image has been loaded yet.

### 1.1 First-load layout

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 1.1.1 | Open `/` on a clean browser profile (clear localStorage). | Upload card is centered, dashed border, "Edit Text on Screenshot" heading, "Choose a file" split button, "or drag and drop a file" hint, "Supports PNG, JPG, GIF, WebP" hint. | |
| 1.1.2 | Inspect the top toolbar on desktop (≥ md). | Date label on the left ("Screenshot {today}"), preview toolbar with 7 shape tools + color swatch + Undo/Redo + Crop/Rotate/Background/Delete is visible. | |
| 1.1.3 | Resize to mobile width (< md). | Date label hides; preview toolbar becomes horizontally scrollable. | |

### 1.2 Preview-toolbar hint

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 1.2.1 | Click **any** preview-toolbar tool (pen, text, blur, color, undo, crop, etc.) before uploading. | A Sonner toast appears at the top-center: "Please Upload an Image". No editor state changes. | |
| 1.2.2 | Click a second tool while the toast is still visible. | A new toast appears (or the existing one updates). No console errors. | |

### 1.3 File picker

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 1.3.1 | Click **Choose a file**. | OS native file picker opens. | |
| 1.3.2 | Pick a `.png`. | Picker closes, upload screen disappears, editor view loads with the image. | |
| 1.3.3 | Pick a `.jpg`, `.gif`, `.webp`. | Each loads successfully. | |
| 1.3.4 | Pick a non-image file (e.g. `.pdf`, `.txt`). | Error text appears below the card: "Please choose an image file (PNG, JPG, GIF, or WebP)." Upload screen stays. | |
| 1.3.5 | Pick a very large image (> 30 MB). | Image loads in the editor but a console warning appears that it is not persisted to localStorage. | |

### 1.4 Drag & drop

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 1.4.1 | Drag an image over the dashed card. | Border turns primary color and background tints (drag-over state). | |
| 1.4.2 | Drop the image. | Card returns to neutral colors, editor loads with the image. | |
| 1.4.3 | Drag over the card, then drag away. | Drag-over state clears (border returns to neutral). | |
| 1.4.4 | Drop a non-image file. | Error text appears: "Please choose an image file…". | |

### 1.5 Dropdown menu (chevron button)

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 1.5.1 | Click the chevron next to **Choose a file**. | Menu opens with two items: "From device", "From URL". | |
| 1.5.2 | Click outside the menu. | Menu does not auto-close (current behavior — only re-clicking the chevron closes it). Note this if tracking as a defect. | |
| 1.5.3 | Click **From device**. | Menu closes; OS file picker opens. | |
| 1.5.4 | Click **From URL**. | Menu closes; "Load image from URL" dialog opens. | |

### 1.6 Load from URL

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 1.6.1 | Open the URL dialog. | Input is auto-focused; placeholder shows `https://example.com/image.png`. "Load image" button is disabled (empty input). | |
| 1.6.2 | Type a valid public image URL (e.g. `https://picsum.photos/600`). Press **Load image**. | Spinner appears, then the editor loads with the image. Dialog closes. | |
| 1.6.3 | Type a valid URL and press **Enter** in the input. | Same as 1.6.2. | |
| 1.6.4 | Type a non-image URL or a 404. | Spinner shows briefly, dialog closes, then error text appears: "Image is not downloadable. Check the URL or try another image." | |
| 1.6.5 | Type only whitespace. | Load button stays disabled. | |
| 1.6.6 | Click **Cancel**. | Dialog closes; input is cleared. | |

---

## 2. Editor — first load behavior ([components/editor/fabric-canvas.tsx](components/editor/fabric-canvas.tsx))

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 2.1 | Load any image. | Image renders centered on a white canvas, scaled to fit the viewport. Filename appears in the toolbar (truncated if long). | |
| 2.2 | Reload the page after loading an image. | The image, background, and filename persist from localStorage (loading spinner shows briefly). | |
| 2.3 | Resize the browser window. | Canvas re-fits to the new viewport without distortion. | |

---

## 3. Shape & annotation tools

For each tool, start in the editor with an image loaded.

### 3.1 Pen ([shapes.ts](components/editor/shapes.ts) — free-draw via Fabric brush)

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 3.1.1 | Click **Pen**. | Tool button shows active style; cursor switches to crosshair on the canvas. | |
| 3.1.2 | Draw a stroke on the canvas. | A red (default color) stroke is drawn, width ≈ 4 px. | |
| 3.1.3 | Change color, draw again. | New stroke uses the new color. Previous stroke unchanged. | |

### 3.2 Text

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 3.2.1 | Click **Text**. | An editable "Edit me" text object is added near top-left and becomes the active selection. | |
| 3.2.2 | Double-click it. | Enters text-edit mode; type to replace. | |
| 3.2.3 | Move/resize/rotate it via handles. | All transforms work; text stays selectable. | |

### 3.3 Highlight

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 3.3.1 | Click **Highlight**. Draw a stroke across text in the image. | Yellow translucent stroke (≈ 30 px wide) overlays the text but underlying content is still visible. | |

### 3.4 Blur (current implementation is a thick white brush)

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 3.4.1 | Click **Blur**. Draw across sensitive text. | A thick (~19 px) opaque white stroke covers the text. *Note: current implementation paints solid white, not a true blur. Flag if blur effect is expected.* | |

### 3.5 Rectangle

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 3.5.1 | Click **Rectangle**. | A transparent-fill, colored-stroke rectangle is added and selected. | |
| 3.5.2 | Resize/move it. | Transforms apply normally. | |

### 3.6 Circle

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 3.6.1 | Click **Circle**. | A transparent-fill, colored-stroke circle is added and selected. | |

### 3.7 Arrow

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 3.7.1 | Click **Arrow**. | A diagonal line with a triangle head is added as a single group. | |
| 3.7.2 | Move and rotate the arrow. | The group moves/rotates as one piece; head stays attached to the line tail. | |

---

## 4. Color picker

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 4.1 | Click the colored circle in the toolbar. | Color popover opens below the swatch, showing 7 preset chips + a conic-gradient custom-color tile. | |
| 4.2 | Click each preset chip. | Active color updates; ring/offset marks the selected chip; popover closes. | |
| 4.3 | Open the popover, click the custom-color tile, pick a custom color from the OS picker. | New color is applied; swatch in the toolbar updates. | |
| 4.4 | Pick a color, then draw with pen / add a rect / add a circle. | The new color is used for all subsequent shapes and strokes (existing shapes are not retroactively recolored). | |

---

## 5. Undo / Redo

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 5.1 | Add a text object, then click **Undo**. | Text disappears. | |
| 5.2 | Click **Redo**. | Text reappears. | |
| 5.3 | Draw 3 pen strokes, undo 3 times. | Each undo removes one stroke; canvas matches the original image after the third undo. | |
| 5.4 | Undo past the start of history. | No error, nothing changes. | |
| 5.5 | Redo past the end of history. | No error, nothing changes. | |
| 5.6 | Add shape A, undo, then add shape B. | Redo of A is no longer possible; history is replaced from the undo point. | |

---

## 6. Crop

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 6.1 | Click **Crop**. | A dashed blue rectangle appears on the image; a floating "Cancel / Apply" toolbar appears at the bottom. | |
| 6.2 | Drag the rectangle. | Rectangle moves; it cannot be moved outside the image bounds. | |
| 6.3 | Resize via corner handles. | Rectangle scales; edges are clamped to the image bounds. Rotation handle is hidden. | |
| 6.4 | Click **Apply**. | Image is cropped to the selected region; canvas re-fits; crop toolbar disappears. | |
| 6.5 | Enter crop again, shrink to a 1×1-pixel region, click Apply. | Apply is silently cancelled (no error); crop UI exits. | |
| 6.6 | Click **Cancel**. | Crop rectangle is removed; image untouched. | |
| 6.7 | Crop twice in sequence. | Second crop is applied relative to the already-cropped image (compounds correctly). | |

---

## 7. Rotate

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 7.1 | Click **Rotate**. | Image rotates 90° clockwise; canvas dimensions swap; all annotations rotate with it and remain in place relative to the image. | |
| 7.2 | Click Rotate 4 times. | Image returns to original orientation. | |
| 7.3 | Add a text object, rotate, then move the text. | Text rotated with the image and is still movable. | |

---

## 8. Background popover ([background-dialog.tsx](components/editor/background-dialog.tsx))

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 8.1 | Click **Background**. | Popover opens with Padding slider, Corner Radius slider, color chips, custom-color, and Background-image uploader. | |
| 8.2 | Drag Padding slider 0 → 200. | Padding around the image grows; current value shown next to label (in steps of 10 px). | |
| 8.3 | Drag Corner Radius slider 0 → 200. | Image corners round progressively (clip-path on the image). | |
| 8.4 | Click each preset background color chip. | Canvas background changes; selected chip shows ring/offset. | |
| 8.5 | Pick a custom background color. | Background updates accordingly. | |
| 8.6 | Click **Upload image** under "Background image". | OS file picker opens. | |
| 8.7 | Pick a valid image. | The padded area behind the image is filled with the new background image; preview swatch appears in the popover. | |
| 8.8 | Pick a non-image file. | Nothing happens (silently rejected). | |
| 8.9 | Click the trash icon next to the background-image swatch. | Background image is removed; background color shows again. | |
| 8.10 | Reload the page. | Background image persists from localStorage; padding and corner radius reset to default (not persisted). | |

---

## 9. Delete

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 9.1 | Select a shape, click **Delete**. | Shape is removed. | |
| 9.2 | Select the underlying image and click Delete. | Image is **not** deleted (it is the protected user image). | |
| 9.3 | Multi-select two shapes (drag-rectangle or Shift-click), click Delete. | Both removed in one action. | |
| 9.4 | Click Delete with nothing selected. | No-op, no error. | |
| 9.5 | After deleting, click Undo. | Deleted shape comes back. | |

---

## 10. Zoom

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 10.1 | Click **+**. | Zoom % increases by 5; canvas grows. | |
| 10.2 | Click **−** until ≤ 25%. | Zoom clamps at 25%. | |
| 10.3 | Click **+** until ≥ 200%. | Zoom clamps at 200%. | |
| 10.4 | Zoom in, then resize the window. | Canvas re-fits using current zoom multiplier. | |

---

## 11. Cancel / Discard changes ([discard-changes.tsx](components/editor/discard-changes.tsx))

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 11.1 | Click **Cancel** in the toolbar. | "Discard changes?" dialog opens. | |
| 11.2 | Press **Esc** or click **Cancel** in the dialog. | Dialog closes; editor state unchanged. | |
| 11.3 | Press **Enter** while the dialog is open. | Same as clicking "Yes, restart": editor resets and Upload screen returns. | |
| 11.4 | Click **Yes, restart**. | Editor state cleared; Upload screen returns; localStorage entries for image/filename/bg are cleared. | |

---

## 12. Save / Export ([save-menu.tsx](components/editor/save-menu.tsx))

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 12.1 | Click **Save**. | Dropdown opens showing filename input (pre-filled with current filename or "untitled") and 7 export sizes. | |
| 12.2 | Click each preset (Instagram Post, Story, Twitter, YouTube, Full HD, Facebook Cover). | A PNG downloads at the listed dimensions; the canvas aspect ratio is preserved (image is scaled, not distorted). | |
| 12.3 | Click **Original**. | A PNG downloads at the canvas's natural (un-zoomed) size. | |
| 12.4 | Change the file name to `custom-name`, click **Original**. | Downloaded file is `custom-name.png` (or browser-appended `.png`). | |
| 12.5 | Open the menu, then click outside it. | Menu closes. | |
| 12.6 | On mobile (< lg), open the bottom-bar Save menu. | Same options work; menu opens upward (top placement). | |

---

## 13. Persistence (localStorage)

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 13.1 | Load an image < 30 MB. Reload. | Image and filename restore from localStorage. | |
| 13.2 | Load an image > 30 MB. | Console warning logged; image is **not** persisted. Reload → upload screen. | |
| 13.3 | Set a background image, reload. | Background image persists. | |
| 13.4 | Click Cancel → Yes, restart. | All editor.* keys are removed from localStorage. | |

---

## 14. Responsive layout

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 14.1 | Resize to ≤ 768 px (mobile). | Toolbar becomes horizontally scrollable; Save button moves to a fixed bottom bar; Cancel button is in the same bottom bar. | |
| 14.2 | Resize to ≥ 1024 px (desktop). | Save and Cancel appear in the top toolbar; bottom bar is hidden. | |
| 14.3 | Test on touch device (drag-draw with finger). | Pen, highlight, blur strokes work via touch. | |

---

## 15. Accessibility / Keyboard

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 15.1 | Tab through the upload screen. | Choose-file button, chevron menu, and drop area are reachable; focus rings visible. | |
| 15.2 | Open the URL dialog with keyboard, type URL, press Enter. | Submits; behavior identical to clicking Load. | |
| 15.3 | Open the Save menu, Tab through filename input and size buttons. | All controls reachable via keyboard. | |
| 15.4 | Verify `aria-haspopup` / `aria-expanded` on the chevron toggle and color toggle. | Attributes update correctly when menus open/close. | |

---

## 16. Error & edge cases

| # | Steps | Expected | Result |
|---|-------|----------|--------|
| 16.1 | Try a CORS-blocked image URL (e.g. some hot-link-protected host). | Probe fails → error message shown. | |
| 16.2 | Reload while loading is in progress. | Loads cleanly; no orphan spinner. | |
| 16.3 | Open the app with localStorage disabled (private mode strict). | App still works; uploads use only in-memory state; console warns about persistence failures. | |
| 16.4 | Watch the dev console throughout testing. | No uncaught errors. Warnings only for known cases (oversized image, blocked localStorage). | |

---

## Defects observed

| # | Area | Severity (Crit/Maj/Min) | Description | Repro steps |
|---|------|-------------------------|-------------|-------------|
|   |      |                         |             |             |

---

## Notes during testing

-
-
-
