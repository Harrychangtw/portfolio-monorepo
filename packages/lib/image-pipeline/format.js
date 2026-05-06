"use strict";

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);

const dim = c("2");
const bold = c("1");
const cyan = c("36");
const green = c("32");
const yellow = c("33");
const red = c("31");
const magenta = c("35");

function elapsed(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function fmtBytes(n) {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)}MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)}GB`;
}

const variantColor = {
  title: magenta,
  hero: yellow,
  fullscreen: yellow,
  portrait: cyan,
  landscape: cyan,
  square: cyan,
};

module.exports = {
  dim,
  bold,
  cyan,
  green,
  yellow,
  red,
  magenta,
  elapsed,
  fmtBytes,
  variantColor,
};
