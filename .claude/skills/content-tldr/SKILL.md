---
name: content-tldr
description: Generate TL;DR summaries and shortNames for portfolio content (projects, posts, gallery) directly, without calling OpenRouter. Use when new markdown content is added to apps/harrychang-me/content and needs entries in section-summaries.json before rebuilding the knowledge graph.
---

# Content TL;DR generation

`content/generated/section-summaries.json` is the authoritative source of the tooltips
shown on knowledge-graph nodes. Every file, and every section inside it, needs an entry
or the graph falls back to LLM-generated descriptions at build time.

`scripts/backfill_alt_and_tldr.py` produces these by calling
`google/gemini-3-flash-preview` over OpenRouter. **This skill replaces that call**: you
write the summaries yourself and merge them into the JSON. Use the Python script only
when backfilling dozens of files at once.

All paths below are relative to `apps/harrychang-me/`.

## 1. Find what is missing

```bash
python3 .claude/skills/content-tldr/list_missing.py
```

Run it from the repo root. It prints one block per file that has no entry, listing the
exact section headings that need summaries, and exits 0 with "nothing missing" when the
JSON is already complete. Pass `--file <name.md>` to force a single file even if it
already has an entry (use this after rewriting content).

## 2. Write the summaries

Read each file reported above and write the summaries yourself. Match the constraints
the old prompts enforced, since existing entries were produced under them:

| Field               | Constraint                                                                          |
| ------------------- | ----------------------------------------------------------------------------------- |
| `tldr` (file level) | max 12 words, ideally 5-8                                                           |
| `sections[heading]` | max 10 words, ideally 5-8                                                           |
| `shortName`         | **English entries only**, 1-3 words, max 22 chars, Title Case, no leading `The`/`A` |

Rules for all of them:

- No trailing period. No surrounding quotes.
- Specific, not generic. "Precomputed artifacts with FastAPI fallback" beats "technical
  details of the project".
- Write in the file's own language: Traditional Chinese for `_zh-tw.md`, English otherwise.
  Do not translate the English summary; write the Chinese one from the Chinese body, or it
  will read like machine output.
- `shortName` is the label on the rangefinder 404 page, so it should feel human and
  concrete: `Lego Fan Mount`, `NTU CS Admission`, `SITCON ML Track`.

Read the Chinese ones back before merging. The remote model reliably produced duplicated
words (`互動式互動式`) and wrong homophone compounds (`預算` for `預運算`); you are replacing
it precisely so those do not ship.

## 3. Merge into the JSON

Never rewrite the whole file by hand. Write your entries to a temp JSON and merge:

```bash
python3 .claude/skills/content-tldr/merge.py /tmp/new-entries.json
```

`/tmp/new-entries.json` is a map of the same shape as the target:

```json
{
  "project/sitcon-camp-2026/en": {
    "title": "SITCON Camp 2026 ML Course",
    "locale": "en",
    "sections": {
      "Project Overview": "Interactive six-station ML course tracing MLP to Transformer",
      "How It Went": "Stable infrastructure, rushed Pixel Shuffle, strong Transformer discovery"
    },
    "tldr": "Interactive, slide-free ML course taught through browser stations",
    "shortName": "SITCON ML Track"
  }
}
```

`merge.py` validates the key format, the word limits, and that every section heading
actually exists in the source markdown, then writes the file minified (Prettier
reformats it in the next step).

### Key and schema rules

- Key is `{post|project|gallery}/{base_slug}/{locale}`.
- `base_slug` strips the `_zh-tw` suffix, so both locales of one entry share a slug.
- `locale` is `en` or `zh-TW` (**capital TW**, even though the filename suffix is lowercase).
- `title` must be the frontmatter `title` verbatim.
- Section keys must be the heading text **exactly** as written in the markdown, minus the
  `##` and surrounding whitespace. `build_graph.py` matches on the literal string; a
  mismatch silently falls back to the file-level `tldr`.
- Sections are h2, h3 and h4, flattened into one map. A section whose body is under 50
  characters is skipped, matching the original extractor.

## 4. Rebuild the graph

```bash
cd apps/harrychang-me
set -a; . ./.env.local; set +a
pnpm build:graph
```

`build_graph.py` does **not** read `.env.local` itself, so without the `set -a` line it
fails at step 4 with `OPENROUTER_API_KEY not set`. That key is for multimodal _embeddings_,
not summaries; pass `--no-multimodal` to skip it if the key is unavailable, at the cost of
image nodes losing their semantic edges.

`build:graph` chains `format:generated`, which pretty-prints the caches, so the diff on
`section-summaries.json` stays reviewable.

Confirm the run reports your new sections under `Applied N TL;DRs` and that
`[6.5/7]` says all chunks were covered. If it reports generating residual descriptions,
a section heading did not match.

## Do not run the image half of the backfill script

`backfill_alt_and_tldr.py` without `--skip-images` also fills in missing alt text, and it
currently wants to edit **112 inline images across unrelated files**. If you invoke the
script at all, pass `--skip-images` unless the alt-text sweep is what was asked for.
