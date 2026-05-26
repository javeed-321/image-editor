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
    FILENAME: "editor.filename",
    PADDING: "editor.padding",
    MAX_LOCALSTORAGE_SIZE_MB : 30,
    MAX_LOCALSTORAGE_SIZE_BYTES : 30 * 1024 * 1024,
    MAX_W : 1100,
    MAX_H : 2000
  };


  export   const safeSet = (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn(`localStorage failed for ${key}:`, e);
      }
    };