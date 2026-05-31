import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export const STORAGE = {
    USER_IMAGE: "editor.userImage",
    BG_IMAGE: "editor.bgImage",
    BG_GALLERY: "editor.bgGallery",          // NEW — JSON array of saved bg URLs
    BG_ACTIVE_INDEX: "editor.bgActiveIndex", // NEW — index into the gallery
    BG_GALLERY_MAX: 3,                       // NEW — maximum number of background images to store
    FILENAME: "editor.filename",
    PADDING: "editor.padding",
      CORNER_RADIUS: "editor.cornerRadius",   // ← new
    MAX_LOCALSTORAGE_SIZE_MB : 4,
    MAX_LOCALSTORAGE_SIZE_BYTES : 4 * 1024 * 1024,
    MAX_W : 2000,
    MAX_H : 2000
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
