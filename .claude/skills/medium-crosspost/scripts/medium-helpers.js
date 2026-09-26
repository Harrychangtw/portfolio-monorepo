// In-page helpers for Medium's editor. Inject once per tab (and again after any navigation)
// by passing this whole file to javascript_tool; everything hangs off window.__mc.
window.__mc = {
  root: () => document.querySelector('[contenteditable="true"]'),

  // Synthetic paste into whatever is focused. Medium's paste handler accepts it and keeps
  // links, <em>, headings, blockquotes and lists. Also the only reliable way to enter CJK
  // text: the computer `type` action does not register CJK in Medium's inputs.
  paste(html, text) {
    const dt = new DataTransfer();
    dt.setData("text/html", html);
    dt.setData("text/plain", text ?? html.replace(/<[^>]+>/g, ""));
    const ev = new ClipboardEvent("paste", {
      clipboardData: dt,
      bubbles: true,
      cancelable: true,
    });
    document.activeElement.dispatchEvent(ev);
    return ev.defaultPrevented; // true = Medium handled it
  },

  // Put the caret at the end of the first block whose text starts with `prefix`,
  // then press Return (new paragraph) or shift+Return (<br>) with the computer tool.
  caretEnd(prefix) {
    const el = [...this.root().querySelectorAll("p,h3,h4,li,blockquote")].find(
      (e) => e.innerText.startsWith(prefix),
    );
    if (!el) return "not found";
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let t, last;
    while ((t = w.nextNode())) last = t;
    const r = document.createRange();
    r.setStart(last, last.length);
    r.collapse(true);
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
    el.scrollIntoView({ block: "center" });
    return el.innerText.slice(-40);
  },

  // Put the caret in the LAST empty block (bottom-up so indices don't shift); follow with
  // a BackSpace key press. Repeat until it returns 'none'.
  caretLastEmpty() {
    const empties = [
      ...this.root().querySelectorAll("h3,h4,p,blockquote"),
    ].filter((e) => !e.innerText.trim() && !e.querySelector("img"));
    const el = empties.at(-1);
    if (!el) return "none";
    const r = document.createRange();
    r.setStart(el, 0);
    r.collapse(true);
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
    return `${empties.length} left, ${el.tagName} after "${(el.previousElementSibling?.innerText || "").slice(0, 30)}"`;
  },

  // Stop "Add an image" from opening the native file picker (which blocks automation).
  // The <input type=file> is kept in the DOM so `find` + file_upload can target it.
  suppressFilePicker() {
    if (window.__mcOrigClick) return "already";
    window.__mcOrigClick = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = function () {
      if (this.type === "file") {
        if (!this.isConnected) {
          this.style.display = "none";
          document.body.appendChild(this);
        }
        return;
      }
      return window.__mcOrigClick.call(this);
    };
    return "ok";
  },

  // Set a React-controlled input/textarea on the settings page (needed for CJK SEO fields).
  setValue(el, value) {
    const proto =
      el.tagName === "TEXTAREA"
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return el.value;
  },

  // Settings page: [index, tag, value/placeholder] for every field, to pick targets for setValue.
  fields() {
    return [...document.querySelectorAll("input,textarea")]
      .map(
        (i, n) =>
          `${n} ${i.tagName} ${i.type} ${(i.value || "").slice(0, 50)} | ph: ${(i.placeholder || "").slice(0, 30)}`,
      )
      .join("\n");
  },

  // Editor outline for verification: block type, Medium graf classes, first chars.
  outline(head = 8, tail = 4) {
    const els = [
      ...this.root().querySelectorAll("h3,h4,p,blockquote,figure,li,hr"),
    ];
    const fmt = (e) =>
      `${e.tagName}.${[...e.classList].filter((c) => c.startsWith("graf--")).join(".")}: ` +
      (e.tagName === "FIGURE"
        ? `[img alt="${e.querySelector("img")?.alt || ""}"] `
        : "") +
      (e.innerText || "").replace(/\n/g, "⏎").slice(0, 60);
    const empties = els.filter(
      (e) => !e.innerText.trim() && !/HR|FIGURE/.test(e.tagName),
    ).length;
    return [
      `${els.length} blocks, ${empties} empty, ${this.root().querySelectorAll("img").length} images, url ${location.pathname}`,
      ...els.slice(0, head).map(fmt),
      "...",
      ...els.slice(-tail).map(fmt),
    ].join("\n");
  },
};
("medium helpers ready");
