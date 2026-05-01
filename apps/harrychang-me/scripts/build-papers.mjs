import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { XMLParser } from "fast-xml-parser";

const ARXIV_API_URL = "http://export.arxiv.org/api/query?id_list=";

function getArxivPaperIds() {
    const arxivPapersFile = path.join(process.cwd(), "content/arxiv-papers.md");
    if (!fs.existsSync(arxivPapersFile)) return [];
    const fileContents = fs.readFileSync(arxivPapersFile, "utf8");
    const { content } = matter(fileContents);
    const lines = content.split("\n");
    const ids = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (/^\d{4}\.\d{4,5}$/.test(trimmed)) ids.push(trimmed);
    }
    return ids;
}

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 5000;
const MAX_RETRIES = 5;
const RETRY_BASE_MS = 15000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchArxivBatch(batch, parser) {
    const query = batch.join(",");
    const url = `${ARXIV_API_URL}${query}&max_results=${batch.length}`;
    let xmlText = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const res = await fetch(url, {
            headers: { "User-Agent": "portfolio-site (build step)" }
        });
        if (res.ok) {
            xmlText = await res.text();
            break;
        }
        const backoff = RETRY_BASE_MS * attempt;
        console.warn(`arXiv batch failed (${res.status}) for ${batch.length} ids — retry ${attempt}/${MAX_RETRIES} in ${backoff}ms`);
        await sleep(backoff);
    }
    if (!xmlText) {
        console.warn(`arXiv batch giving up after ${MAX_RETRIES} retries (${batch.length} ids)`);
        return [];
    }
    const result = parser.parse(xmlText);
    if (!result.feed || !result.feed.entry) return [];
    const entries = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];
    return entries.map((entry) => ({
        title: String(entry.title || "").replace(/\\n/g, " ").trim(),
        authors: Array.isArray(entry.author) ? entry.author.map((a) => a.name) : [entry.author.name],
        date: entry.published,
        url: entry.id,
        source: "arxiv"
    }));
}

async function fetchArxivPapers(ids) {
    if (!ids.length) return [];
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const all = [];
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE);
        if (i > 0) await sleep(BATCH_DELAY_MS);
        const papers = await fetchArxivBatch(batch, parser);
        all.push(...papers);
    }
    return all;
}

async function getManualPapers() {
    const papersDir = path.join(process.cwd(), "content/papers");
    if (!fs.existsSync(papersDir)) return [];
    const filenames = fs.readdirSync(papersDir);
    return filenames.map((filename) => {
        const filePath = path.join(papersDir, filename);
        const fileContents = fs.readFileSync(filePath, "utf8");
        const { data } = matter(fileContents);
        return {
            title: data.title,
            authors: data.authors,
            date: data.date,
            url: data.url,
            source: "manual"
        };
    });
}

async function main() {
    const ids = getArxivPaperIds();
    const [arxivPapers, manualPapers] = await Promise.all([
        fetchArxivPapers(ids),
        getManualPapers()
    ]);
    const all = [...arxivPapers, ...manualPapers].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const outDir = path.join(process.cwd(), "content/generated");
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, "papers.json");
    fs.writeFileSync(outFile, JSON.stringify(all, null, 2), "utf8");
    console.log(`Wrote ${all.length} papers to ${path.relative(process.cwd(), outFile)}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});