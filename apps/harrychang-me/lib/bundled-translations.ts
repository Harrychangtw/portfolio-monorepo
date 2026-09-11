import type { BundledTranslations } from "@portfolio/lib/contexts/language-context";

import enAbout from "@/public/locales/en/about.json";
import enCommon from "@/public/locales/en/common.json";
import enCv from "@/public/locales/en/cv.json";
import enUpdates from "@/public/locales/en/updates.json";
import enUses from "@/public/locales/en/uses.json";

import zhAbout from "@/public/locales/zh-TW/about.json";
import zhCommon from "@/public/locales/zh-TW/common.json";
import zhCv from "@/public/locales/zh-TW/cv.json";
import zhUpdates from "@/public/locales/zh-TW/updates.json";
import zhUses from "@/public/locales/zh-TW/uses.json";

/**
 * UI strings compiled into the bundle instead of fetched at runtime.
 *
 * These used to be five `fetch()` calls fired after hydration, with the whole
 * page hidden behind an opaque overlay until they resolved — the single
 * biggest contributor to mobile LCP. Importing them means the strings exist
 * during the server render, so pages ship real text in their HTML.
 *
 * The files under `public/locales/` are still served, and the provider still
 * falls back to fetching them for any locale absent here.
 *
 * Cost: ~80 KB of JSON across both locales, which compresses to roughly
 * 15-20 KB in the JS bundle and is then cached immutably by content hash —
 * versus five revalidated round-trips on every single page load.
 */
export const bundledTranslations: BundledTranslations = {
  en: {
    common: enCommon,
    about: enAbout,
    updates: enUpdates,
    uses: enUses,
    cv: enCv,
  },
  "zh-TW": {
    common: zhCommon,
    about: zhAbout,
    updates: zhUpdates,
    uses: zhUses,
    cv: zhCv,
  },
};
