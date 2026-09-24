// Links out to the public Vendcliq site and the app stores, shared by the
// marketing-style header and footer on the sign-in page.
export const SITE_URL = "https://vendcliq.com";

export const siteUrl = (path: string) => `${SITE_URL}${path}`;

export const BUY_DRINKS_URL = siteUrl("/market-place");

export const APP_STORE_URL =
  "https://apps.apple.com/ng/app/vendcliq-app/id6758526174";
export const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.vendcliq.app.prod";
