#!/usr/bin/env node
// Build Medium-ready payloads (EN + zh-tw) for one blog post.
//
//   node .claude/skills/medium-crosspost/scripts/prepare.mjs [slug] [--out <dir>]
//
// slug = post filename without .md / _zh-tw.md (e.g. 16-all-c). Omit for the newest post by
// frontmatter date. Writes <out>/<slug>.medium.json and prints a short summary.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const APP = path.join(ROOT, 'apps/harrychang-me');
const POSTS = path.join(APP, 'content/posts');
const SITE = 'https://www.harrychang.me';

// remark / remark-html / gray-matter are app dependencies, resolve them from there.
const req = createRequire(path.join(APP, 'package.json'));
const load = async (m) => (await import(pathToFileURL(req.resolve(m)).href)).default;
const [{ remark }, remarkHtml, matter] = await Promise.all([
  import(pathToFileURL(req.resolve('remark')).href),
  load('remark-html'),
  load('gray-matter'),
]);

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : process.cwd();
let slug = args.find((a, i) => !a.startsWith('--') && i !== outIdx + 1);

if (!slug) {
  const newest = fs
    .readdirSync(POSTS)
    .filter((f) => f.endsWith('.md') && !f.endsWith('_zh-tw.md'))
    .map((f) => ({ f, date: String(matter(fs.readFileSync(path.join(POSTS, f), 'utf8')).data.date || '') }))
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  slug = newest.f.replace(/\.md$/, '');
}

const md2html = async (src) =>
  String(await remark().use(remarkHtml, { sanitize: false }).process(src))
    .replace(/\n/g, '')
    // repo-relative images -> absolute URLs on the live site
    .replace(/src="(?!https?:)\/?([^"]+)"/g, `src="${SITE}/$1"`)
    .replace(/href="\/(?!\/)([^"]*)"/g, `href="${SITE}/$1"`)
    .replace(/alt="framed:[^"]*"/g, 'alt=""');

const inline = async (src) => (await md2html(src)).replace(/^<p>|<\/p>$/g, '');

// Acknowledgments: the title-image credit becomes the title-card caption; other bullets stay.
const ACK_HEAD = { en: /^## Acknowledgments\s*$/m, zh: /^## 致謝\s*$/m };
const CREDIT = { en: /^- Title image:\s*/, zh: /^- 封面照：\s*/ };

async function build(lang) {
  const file = path.join(POSTS, lang === 'en' ? `${slug}.md` : `${slug}_zh-tw.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));

  let body = content;
  let caption = null;
  let ackItems = [];
  const m = body.match(ACK_HEAD[lang]);
  if (m) {
    const ack = body.slice(m.index + m[0].length);
    body = body.slice(0, m.index).replace(/\n-{3,}\s*$/, '\n').trimEnd() + '\n';
    for (const line of ack.split('\n').filter((l) => l.startsWith('- '))) {
      if (!caption && CREDIT[lang].test(line)) caption = await inline(line.replace(CREDIT[lang], ''));
      else ackItems.push(line);
    }
  }
  if (ackItems.length) {
    body += `\n## ${lang === 'en' ? 'Acknowledgments' : '致謝'}\n\n${ackItems.join('\n')}\n`;
  }

  const pageUrl = `${SITE}/blog/${lang === 'en' ? slug : `${slug}_zh-tw`}`;
  const intro =
    lang === 'en'
      ? `<p>For the best reading experience, please view the <a href="${pageUrl}">original version on my portfolio.</a>` +
        `<br>這篇文章也有中文版，歡迎<a href="{{OTHER_MEDIUM_URL}}">點此閱讀</a>。</p>`
      : `<p>為了更佳的閱讀體驗，建議前往<a href="${pageUrl}">我的個人網站</a>閱讀。` +
        `<br>This article is also available in English. You can read it <a href="{{OTHER_MEDIUM_URL}}">here</a>.</p>`;

  const bodyHtml = await md2html(body);
  return {
    file: path.relative(ROOT, file),
    title: data.title,
    subtitle: data.description,
    seoTitle: data.title,
    seoDescription: data.description,
    seoDescriptionLength: [...(data.description || '')].length,
    canonical: pageUrl,
    subtitleHtml: `<p><em>${data.description}</em></p>`,
    introHtml: intro,
    captionHtml: caption,
    bodyHtml,
    bodyImages: [...bodyHtml.matchAll(/<img [^>]*src="([^"]+)"/g)].map((x) => ({
      url: x[1],
      local: x[1].startsWith(SITE) ? path.join(APP, 'public', x[1].slice(SITE.length)) : null,
    })),
    tags: data.tags || [],
  };
}

// Title card: frontmatter imageUrl points at the optimized webp; prefer the original upload.
function titlecard(imageUrl) {
  if (!imageUrl) return null;
  const rel = imageUrl.replace(/^\/?images\/optimized\//, 'images/');
  const base = path.join(APP, 'public', rel).replace(/\.[a-z]+$/i, '');
  const candidates = ['.png', '.jpg', '.jpeg', '.webp'].map((e) => base + e);
  candidates.push(path.join(APP, 'public', imageUrl.replace(/^\//, '')));
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      const mb = fs.statSync(c).size / 1e6;
      const optimized = path.join(APP, 'public', imageUrl.replace(/^\//, ''));
      return {
        path: c,
        sizeMB: +mb.toFixed(2),
        overUploadLimit: mb >= 10,
        // file_upload caps at 10MB; fall back to the optimized webp the site serves
        fallback: mb >= 10 && fs.existsSync(optimized) ? optimized : null,
      };
    }
  }
  return null;
}

const en = await build('en');
if (!en) {
  console.error(`No post found: ${path.join(POSTS, slug + '.md')}`);
  process.exit(1);
}
const zh = await build('zh');
const fm = matter(fs.readFileSync(path.join(POSTS, `${slug}.md`), 'utf8')).data;
const out = { slug, date: fm.date, titlecard: titlecard(fm.imageUrl), en, zh };

fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `${slug}.medium.json`);
fs.writeFileSync(outFile, JSON.stringify(out, null, 2));

const line = (l, p) =>
  p
    ? `  ${l}: "${p.title}" | subtitle ${p.seoDescriptionLength} chars | caption ${p.captionHtml ? 'yes' : 'NO'} | ` +
      `${(p.bodyHtml.match(/<h2/g) || []).length} sections | ${p.bodyImages.length} body images`
    : `  ${l}: (no _zh-tw file, EN only)`;
console.log(`slug: ${slug} (${fm.date})`);
console.log(line('en', en));
console.log(line('zh', zh));
console.log(
  `  titlecard: ${out.titlecard ? `${out.titlecard.path} (${out.titlecard.sizeMB} MB${out.titlecard.overUploadLimit ? ', OVER 10MB, use fallback ' + out.titlecard.fallback : ''})` : 'NOT FOUND'}`,
);
console.log(`wrote ${outFile}`);
