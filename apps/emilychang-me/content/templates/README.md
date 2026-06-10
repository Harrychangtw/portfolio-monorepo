# Obsidian authoring templates

Low-friction content authoring for emilychang-me. Emily writes in Obsidian; the
technical owner runs the image/optimize step and commits.

## One-time Obsidian setup

1. **Open this folder as a vault** — point Obsidian at `apps/emilychang-me/`.
2. Enable the core **Templates** plugin (Settings → Core plugins → Templates),
   and set _Template folder location_ to `content/templates`.
3. Set the attachment folder (Settings → Files & Links → _Default location for
   new attachments_ → "In the folder specified below") to `public/images/_inbox`.
   Every dragged-in image lands there; the intake step sorts them per piece.

## Authoring a piece

1. Create a new note **inside `content/projects/` or `content/gallery/`**.
2. Name the file as the slug — lowercase with dashes, e.g. `urban-sketches`.
3. Run _Insert template_ and pick `project-template` or `canvas-template`.
   `{{title}}` and `{{date}}` fill in automatically.
4. Write the text, drag in images, fill the obvious fields, delete the HOW-TO
   comment block. Done — no git, no terminal, no `optimized` paths.

## Conventions baked into the templates

- **Raw image paths only.** Reference `/images/<category>/<slug>/<file>.jpg`. The
  site rewrites these to the responsive `/images/optimized/...` variants at
  runtime — never type `optimized` yourself.
- **`<slug>` placeholder** in paths = the note's filename. Replace it, or leave it
  for the intake step to resolve.
- **`locked: false`** publishes once committed; set `true` to keep it hidden.
- **`pinned`** is a number (`-1` = unpinned; `1`, `2`, … force sort order).

## Owner's last mile (not Emily's job)

After pulling Emily's edits: sort inbox images into
`public/images/<category>/<slug>/`, then run
`pnpm --filter emilychang-me optimize-images` and review before committing.
