const configured =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teramis-clone.vercel.app";
export const SITE_URL = new URL(configured).origin;
export const siteUrl = (path = "/") => new URL(path, SITE_URL).toString();
