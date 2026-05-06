"use strict";

const {
  dim,
  bold,
  cyan,
  green,
  red,
  elapsed,
  fmtBytes,
  variantColor,
} = require("./format");

function makeRenderer(total) {
  const isTTY = process.stdout.isTTY && !process.env.NO_COLOR;
  const inFlight = new Map();
  let counter = 0;
  let optimized = 0;
  let skipped = 0;
  let errors = 0;
  let totalIn = 0;
  let totalOut = 0;
  const startWall = Date.now();
  let lastRender = 0;
  let rafTimer = null;

  function bar(done, tot, width = 22) {
    const filled = Math.min(width, Math.round((done / tot) * width));
    return cyan("█".repeat(filled)) + dim("░".repeat(width - filled));
  }

  function render(force = false) {
    if (!isTTY) return;
    const now = Date.now();
    if (!force && now - lastRender < 80) return;
    lastRender = now;

    let current = "...";
    let currentVariant = "";
    if (inFlight.size > 0) {
      let latest = null;
      let latestT = 0;
      for (const [plan, t] of inFlight) {
        if (t > latestT) {
          latestT = t;
          latest = plan;
        }
      }
      if (latest) {
        current = latest.displayPath;
        const colorFn = variantColor[latest.variant] || cyan;
        currentVariant = colorFn(latest.variant);
      }
    }

    const pct = String(Math.round((counter / total) * 100)).padStart(3);
    const cnt = `${String(counter).padStart(String(total).length)}/${total}`;
    const elapsedS = ((now - startWall) / 1000).toFixed(1) + "s";
    const rate =
      counter > 0
        ? `${(counter / ((now - startWall) / 1000)).toFixed(1)}/s`
        : "—";
    const inFlightTag = inFlight.size > 1 ? dim(`+${inFlight.size - 1}`) : "";

    const cols = process.stdout.columns || 120;
    const meta = `${bar(counter, total)} ${bold(`${pct}%`)} ${dim(cnt)} ${dim("·")} ${dim(elapsedS)} ${dim("·")} ${dim(rate)}`;
    const prefix = `  ${meta} ${dim("▸")} ${currentVariant} `;
    const visible = prefix.replace(/\x1b\[[0-9;]*m/g, "").length;
    const room = Math.max(10, cols - visible - 6);
    const shownPath =
      current.length > room
        ? "…" + current.slice(current.length - room + 1)
        : current;
    const line = `${prefix}${shownPath} ${inFlightTag}`;

    process.stdout.write("\r\x1b[2K" + line);
  }

  function scheduleRender() {
    if (!isTTY) return;
    if (rafTimer) return;
    rafTimer = setTimeout(() => {
      rafTimer = null;
      render();
    }, 80);
  }

  function clearLine() {
    if (isTTY) process.stdout.write("\r\x1b[2K");
  }

  return {
    start(plan) {
      inFlight.set(plan, Date.now());
      if (!isTTY) {
        const colorFn = variantColor[plan.variant] || cyan;
        console.log(
          `  ${dim("▸")} ${plan.displayPath} ${dim("·")} ${colorFn(plan.variant)}`,
        );
      }
      scheduleRender();
    },
    complete(plan, result) {
      inFlight.delete(plan);
      counter++;
      if (result.status === "optimized") optimized++;
      else if (result.status === "skipped") skipped++;
      else errors++;
      totalIn += result.inputBytes || 0;
      totalOut += result.outputBytes || 0;
      if (!isTTY) {
        const tag =
          result.status === "optimized"
            ? green("✓")
            : result.status === "skipped"
              ? dim("∙")
              : red("✗");
        const colorFn = variantColor[result.variant] || cyan;
        const sizes =
          result.inputBytes && result.outputBytes
            ? ` ${dim(`${fmtBytes(result.inputBytes)} → ${fmtBytes(result.outputBytes)}`)}`
            : "";
        console.log(
          `    ${tag} ${result.displayPath} ${dim("·")} ${colorFn(result.variant)}${sizes} ${dim(`(${elapsed(result.ms)})`)}`,
        );
      }
      scheduleRender();
    },
    error(plan, err) {
      inFlight.delete(plan);
      counter++;
      errors++;
      clearLine();
      console.log(
        `  ${red("✗")} ${plan.displayPath} ${dim("·")} ${red(err.message)}`,
      );
      scheduleRender();
    },
    finalize() {
      if (rafTimer) {
        clearTimeout(rafTimer);
        rafTimer = null;
      }
      clearLine();
      const ratio = totalIn > 0 ? Math.round((totalOut / totalIn) * 100) : 0;
      const saved = Math.max(0, totalIn - totalOut);
      const sizeReport =
        totalIn > 0
          ? ` ${dim("·")} ${green(fmtBytes(totalIn))} ${dim("→")} ${green(fmtBytes(totalOut))} ${dim(`(${ratio}%, saved ${fmtBytes(saved)})`)}`
          : "";
      const totalMs = Date.now() - startWall;
      console.log(
        `${bold(green("✔"))} ${bold("Done")} ${dim("·")} ${green(`${optimized} optimized`)}, ${dim(`${skipped} skipped`)}${errors ? `, ${red(`${errors} errors`)}` : ""}${sizeReport} ${dim(`· ${elapsed(totalMs)}`)}`,
      );
      return { optimized, skipped, errors };
    },
  };
}

module.exports = { makeRenderer };
