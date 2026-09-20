/**
 * Names of the request headers the middleware uses to carry the original URL
 * into Server Components.
 *
 * Kept in their own module with no imports: `middleware.ts` runs on the edge
 * runtime and must not pull in `next/headers`, which server-language.ts does.
 */
export const PATHNAME_HEADER = "x-pathname";
export const SEARCH_HEADER = "x-search";
