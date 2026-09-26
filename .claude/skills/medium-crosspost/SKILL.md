---
name: medium-crosspost
description: Cross-post a blog post from apps/harrychang-me/content/posts to Medium (@chiwei_chang) as an EN + zh-tw pair of drafts via Claude in Chrome, with title card, caption, cross-links, custom slugs, canonical URLs, SEO title/description, and topics. Use when the user asks to add/prepare/cross-post a blog post to Medium. Takes an optional post slug (e.g. 16-all-c); defaults to the newest post. Stops at drafts; never publishes.
---

# Medium cross-post

Every post goes to Medium as **two separate stories**: EN and zh-tw. Each links to the other and to the
portfolio. Canonical URLs point back to harrychang.me. The skill **ends with two drafts**; the user
reviews them and clicks Publish. Never click Publish, Delete story, or "Submit to publication".

Paths below are relative to the repo root. Load the claude-in-chrome skill first, and batch the tools
you need into one ToolSearch call (include `javascript_tool`, `find`, `file_upload`, `browser_batch`).

## 0. Prepare the payload

```bash
node .claude/skills/medium-crosspost/scripts/prepare.mjs [slug] --out <scratchpad>
```

This writes `<scratchpad>/<slug>.medium.json` with the fields below for `en` and `zh`. `zh` is null if
the post has no `_zh-tw.md`; in that case skip every zh step and the cross-link lines.

| field                                     | use                                                                                                         |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `title`                                   | story title                                                                                                 |
| `subtitleHtml`                            | italic description paragraph under the title                                                                |
| `introHtml`                               | portfolio link + cross-link line. Contains `{{OTHER_MEDIUM_URL}}`                                           |
| `captionHtml`                             | title-image credit from Acknowledgments. null = no caption                                                  |
| `bodyHtml`                                | sections (become Medium large headings), blockquotes, lists. Relative links and images are already absolute |
| `bodyImages[]`                            | `{url, local}` for each inline image, to verify after pasting                                               |
| `canonical`                               | `https://www.harrychang.me/blog/<slug>[_zh-tw]`: www, matching the site's own `<link rel=canonical>`        |
| `seoDescription` / `seoDescriptionLength` | starting point for the SEO description                                                                      |
| `tags`                                    | starting point for topics                                                                                   |

The top-level `titlecard` gives `{path, sizeMB, overUploadLimit, fallback}`. `file_upload` caps at 10MB,
so use `fallback` (the optimized webp) when the original is over the cap.

Also decide the **custom slug** now. Strip the numeric or date prefix from the filename and use hyphens:
`16-all-c` → `all-c`, `2026_02_10_synecdoche_truman` → `synecdoche-truman`. zh gets a `-zh-tw` suffix.
Tell the user the slug in the final summary; they can rename it before publishing.

Also read `https://medium.com/me/stories?tab=posts-published` first: if the newest published pair
deviates from the format below, follow what's there and mention the difference.

## 1. Target format (what "done" looks like, per story)

```
HR
H3.graf--title        title
P                     <em>subtitle</em>
FIGURE.layoutFillWidth  title card, alt text, caption = credit (links kept)
P                     intro: portfolio link <br> cross-link to the other language
H3 …                  sections (body)
[H3 Acknowledgments + LI…]   only if there are bullets besides the image credit
```

There is no "Originally published at" footer and there are no empty blocks. `__mc.outline()` prints
this structure for checking.

## 2. Order of operations

The user asked for this order: **slug first, then the other language, then cross-link.**

1. **EN draft**: build it (§3) using `introHtml` **without** the `<br>…點此閱讀…` part.
2. **EN settings** (§4): custom slug `<slug>`, canonical, SEO, topics. EN final URL =
   `https://medium.com/@chiwei_chang/<slug>-<enPostId>`. The post id comes from the `/p/<id>/edit` URL.
3. **zh draft**: build it with `{{OTHER_MEDIUM_URL}}` replaced by the EN final URL.
4. **zh settings**: slug `<slug>-zh-tw`, canonical, SEO, topics. zh final URL =
   `https://medium.com/@chiwei_chang/<slug>-zh-tw-<zhPostId>`.
5. **Back in the EN editor**: `__mc.caretEnd('For the best reading')`, press `shift+Return`, then
   `__mc.paste('這篇文章也有中文版，歡迎<a href="ZH_URL">點此閱讀</a>。')`.
6. **Verify** (§5), then report.

## 3. Build a draft

1. Navigate a new tab to `https://medium.com/new-story`. Inject `scripts/medium-helpers.js` by passing
   the file's contents to `javascript_tool`. **Re-inject after every navigation.**
2. Click the Title placeholder, then `__mc.paste(title, title)`, then press `Return`.
3. `__mc.paste(subtitleHtml + introHtml + bodyHtml)`. Pass the strings verbatim from the JSON.
4. Remove empty blocks: loop `__mc.caretLastEmpty()` then `BackSpace` until it returns `none`. Batch
   about 4 pairs per `browser_batch`.
5. **Title card**:
   - `__mc.caretEnd(<first chars of subtitle>)`, then press `Return`. The ⊕ button appears left of the
     empty line.
   - Run `__mc.suppressFilePicker()` **before** clicking anything image-related.
   - Click ⊕, then `find` "Add an image" and click it.
   - `find` "input type=file", then `file_upload` the title card path.
   - Wait about 6s.
   - With the image selected, click the rightmost layout icon in the floating toolbar (full width).
6. **Alt text**: select the image, `find` the "Alt text" button, then click it.
   - Click the text field, then use `__mc.paste(alt)`. Don't use `type`: CJK doesn't register and the
     dialog ignores it.
   - Click Save, then check `document.querySelector('figure img').alt`.
   - Write the alt text yourself: a one-line description of the painting in the story's language.
7. **Caption**: click the image, then click "Type caption for image" under it, then
   `__mc.paste(captionHtml)`. Check that the figcaption has the expected `<a>` count.
8. **Body images**: if `bodyImages` is non-empty, compare the editor's `<img>` count with the expected
   count. Pasted remote images may not import. For each missing one, put the caret at the right spot and
   upload `local` the same way as the title card.

## 4. Story settings

Open settings from the editor's `…` menu → "More settings", or go to
`https://medium.com/p/<id>/settings`.

- **Advanced Settings** (click the header to expand):
  - Customize Story Link: choose Custom, click the field, `cmd+a`, type the slug, click
    "Save story link". Medium appends `-<id>` itself.
  - Customize Canonical Link: tick "originally published elsewhere", click "Edit canonical link",
    `cmd+a`, type `canonical`, then "Save canonical link".
- **SEO Title**: the story title if it's 60 chars or fewer including ` | Medium`; otherwise shorten it,
  keeping the key words. The default includes "by Harry Chang" or the subtitle, so always overwrite it.
- **SEO Description**:
  - EN: 140–156 chars. If `seoDescriptionLength` > 156, write a tighter version that keeps concrete
    keywords (e.g. NTU, place names).
  - zh: the subtitle, lightly keyword-enriched (e.g. 台大), is fine.
  - The zh default is often body text, so always overwrite it.
- **How to set SEO fields**:
  - Use `__mc.fields()` to find the indexes, then `__mc.setValue(document.querySelectorAll('input,textarea')[i], value)`.
  - Click that field's Save button. A toast confirms, and the button greys out.
- **Reader Interests**: pick 5 topics; the same 5 go on both stories. Start from `tags` (e.g. Memoir,
  Personal → Memoir, Personal Essay) and add broad reach topics.
  - Per topic: type the name, wait 3s, press `Down`, press `Return`.
  - Clicking a suggestion does **not** register, and Return without Down only works for single words.

## 5. Verify, then report

Reload both settings pages and confirm:

- slug (Custom checked, final URL),
- canonical checkbox and URL,
- SEO title and description,
- all 5 topics under Reader Interests.

In each editor, run `__mc.outline()` and check the §1 structure, 0 empty blocks, and the cross-link
`href`s.

Leave both tabs open. Give the user a table: draft edit URLs, final URLs, canonical, SEO title and
description, topics. Also list anything that deviated or needs a manual look.

## Gotchas

- **Coordinates**: JS `getBoundingClientRect()` is in CSS px, but screenshots use a different frame
  (e.g. viewport 1200 → frame 1120). Scale before clicking, or use `find` refs.
- **`cmd+k` over a selection made by JS** replaces the text with the URL instead of linking it.
  Paste HTML with `<a>` instead.
- **Italic**: `triple_click` the paragraph, then `cmd+i`.
- **Import**: `medium.com/p/import` of the live page is an alternative for EN only. zh import pulls
  English, because i18n is client-side. Import leaves an empty H3 after every heading, empty
  blockquote lines, and an "Originally published at" footer. It also drops Acknowledgments bullets.
  Paste is cleaner.
- `javascript_tool` output gets blocked (`[BLOCKED: Cookie/query string data]`) when it contains URLs
  with query strings. Strip the query or return counts instead.
