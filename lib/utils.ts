import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



// Browser localStorage caps are ~5–10 MB per ORIGIN (Safari: ~5 MB,
// Chrome/Firefox: ~10 MB). That budget is shared across every key
// we write (user image + background gallery + filename + padding +
// corner radius). 4 MB per image leaves headroom for everything else
// and survives Safari. Images above this still load and display
// normally — they just won't be restored on a page refresh.
//
// If you need to persist larger images, switch to IndexedDB; raising
// this constant alone won't help, because the browser still rejects.
export const STORAGE = {
  USER_IMAGE:      "editor.userImage",
  BG_IMAGE:        "editor.bgImage",
  BG_GALLERY:      "editor.bgGallery",       // JSON array of saved bg data-URLs
  BG_ACTIVE_INDEX: "editor.bgActiveIndex",   // index into BG_GALLERY
  BG_GALLERY_MAX:  3,                        // max background images stored
  FILENAME:        "editor.filename",
  PADDING:         "editor.padding",
  CORNER_RADIUS:   "editor.cornerRadius",
  BG_COLOR:        "editor.bgColor",

  MAX_PERSISTED_IMAGE_BYTES: 4 * 1024 * 1024, // 4 MB — see comment above

  MAX_W: 4000,
  MAX_H: 4000,
};


export const safeSet = (key: string, value: string): Error | null => {
  try {
    localStorage.setItem(key, value);
    return null;
  } catch (e) {
    // console.warn(`localStorage failed for ${key}:`, e);
    return e instanceof Error ? e : new Error(String(e));
  }
};
