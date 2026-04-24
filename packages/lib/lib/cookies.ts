/**
 * Cross-subdomain cookie helpers.
 * Sets cookies on the root domain (.harrychang.me) so preferences
 * persist across main site and lab subdomain.
 */

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1] || null
  );
}

export function setCookie(name: string, value: string): void {
  const domain = window.location.hostname.includes("harrychang.me")
    ? "; domain=.harrychang.me"
    : "";
  document.cookie = `${name}=${value}; path=/${domain}; max-age=31536000`; // 1 year
}
