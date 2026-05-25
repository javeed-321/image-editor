const raw =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://image-edit-ten.vercel.app";

export const siteUrl = raw.replace(/\/+$/, "");
