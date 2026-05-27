import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function withAlpha(hex: string, alpha: number): string {
  // Accepts "#rrggbb" or "#rgb", returns "rgba(r,g,b,a)"
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
    MAX_W : 1100,
    MAX_H : 2000
  };


export const safeSet = (key: string, value: string): Error | null => {
  try {
    localStorage.setItem(key, value);
    return null;
  } catch (e) {
    console.warn(`localStorage failed for ${key}:`, e);
    return e instanceof Error ? e : new Error(String(e));
  }
};
