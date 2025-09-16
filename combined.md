</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/paper-reading-page-client.tsx>
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import AnimatedPaperList from "@/components/animated-paper-list";
import PaginationControls from "@/components/pagination-controls";
import { Paper } from "@/types/paper";
import { motion } from "framer-motion";

interface PaperReadingPageClientProps {
  paginatedPapers: Paper[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function PaperReadingPageClient({
  paginatedPapers,
  hasNextPage,
  hasPrevPage,
}: PaperReadingPageClientProps) {
  const { t } = useLanguage();

  return (
    <div className="page-transition-enter">
      <div className="container mx-auto px-4 py-8">
        <motion.h1 
          className="text-3xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
        </motion.h1>
        <AnimatedPaperList papers={paginatedPapers} />
        <PaginationControls hasNextPage={hasNextPage} hasPrevPage={hasPrevPage} />
      </div>
    </div>
  );
}
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/paper-reading-page-client.tsx>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/lib/arxiv.ts>

import { Paper } from "@/types/paper";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { XMLParser } from "fast-xml-parser";

const ARXIV_API_URL = "http://export.arxiv.org/api/query?id_list=";

export function getArxivPaperIds(): string[] {
  const arxivPapersFile = path.join(process.cwd(), "content/arxiv-papers.md");
  if (!fs.existsSync(arxivPapersFile)) {
    return [];
  }
  
  const fileContents = fs.readFileSync(arxivPapersFile, "utf8");
  const { content } = matter(fileContents);
  
  // Extract paper IDs from the markdown content
  const lines = content.split('\n');
  const paperIds: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    // Check if line matches arxiv ID pattern (4 digits.5 digits)
    if (/^\d{4}\.\d{5}$/.test(trimmedLine)) {
      paperIds.push(trimmedLine);
    }
  }
  
  return paperIds;
}

export async function fetchArxivPapers(ids: string[]): Promise<Paper[]> {
  if (ids.length === 0) {
    return [];
  }
  const query = ids.join(",");
  const response = await fetch(
    `${ARXIV_API_URL}${query}&max_results=${ids.length}`
  );
  const xmlText = await response.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const result = parser.parse(xmlText);

  if (!result.feed || !result.feed.entry) {
    return [];
  }

  const entries = Array.isArray(result.feed.entry)
    ? result.feed.entry
    : [result.feed.entry];

  return entries.map((entry: any) => ({
    title: entry.title.replace(/\\n/g, " ").trim(),
    authors: Array.isArray(entry.author)
      ? entry.author.map((a: any) => a.name)
      : [entry.author.name],
    date: entry.published,
    url: entry.id,
    source: "arxiv",
  }));
}

export async function getManualPapers(): Promise<Paper[]> {
  const papersDir = path.join(process.cwd(), "content/papers");
  if (!fs.existsSync(papersDir)) {
    return [];
  }
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
      source: "manual",
    };
  });
}
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/lib/arxiv.ts>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/paper-card.tsx>

import { Paper } from "@/types/paper";
import Link from "next/link";
import { motion } from "framer-motion";

interface PaperCardProps {
  paper: Paper;
}

export default function PaperCard({ paper }: PaperCardProps) {
  // Format date as yyyy-mm-dd
  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toISOString().split('T')[0];
  };
  
  return (
    <motion.div 
      className="border-b border-border py-4"
      whileHover={{ 
        scale: 1.01,
        transition: { duration: 0.1 }
      }}
    >
      <h3 className="text-lg font-semibold">
        <Link href={paper.url} target="_blank" rel="noopener noreferrer" className="link-external hover:text-primary transition-colors duration-200">
          {paper.title}
        </Link>
      </h3>
      <p className="text-sm text-gray-600">{paper.authors.join(", ")}</p>
      <p className="text-sm text-gray-500">{formatDate(paper.date)}</p>
    </motion.div>
  );
}
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/paper-card.tsx>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/animated-paper-list.tsx>
"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Paper } from "@/types/paper"
import PaperCard from "./paper-card"

interface AnimatedPaperListProps {
  papers: Paper[]
}

export default function AnimatedPaperList({ papers }: AnimatedPaperListProps) {
  const searchParams = useSearchParams()
  const currentPage = searchParams.get("page") ?? "1"

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.2,
          ease: "easeInOut"
        }}
        className="space-y-4"
      >
        {papers.map((paper, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5,
              delay: index * 0.04,
              ease: "easeOut"
            }}
          >
            <PaperCard paper={paper} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/components/animated-paper-list.tsx>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/paper-reading/page.tsx>
import { fetchArxivPapers, getManualPapers, getArxivPaperIds } from "@/lib/arxiv";
import { Paper } from "@/types/paper";
import PaperReadingPageClient from "@/components/paper-reading-page-client";
export default async function PaperReadingPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const arxivPaperIds = getArxivPaperIds();
  const arxivPapers = await fetchArxivPapers(arxivPaperIds);
  const manualPapers = await getManualPapers();

  const allPapers: Paper[] = [...arxivPapers, ...manualPapers].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const pageParam = await searchParams;
  const page = pageParam["page"] ?? "1";
  const currentPage = Number(page);
  const papersPerPage = 15;

  const paginatedPapers = allPapers.slice(
    (currentPage - 1) * papersPerPage,
    currentPage * papersPerPage
  );

  const hasPrevPage = currentPage > 1;
  const hasNextPage = allPapers.length > currentPage * papersPerPage;

  return (
    <PaperReadingPageClient 
      paginatedPapers={paginatedPapers}
      hasNextPage={hasNextPage}
      hasPrevPage={hasPrevPage}
    />
  );
}
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/paper-reading/page.tsx>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/paper-reading/layout.tsx>

import React from "react";
import Link from "next/link";

export default function PaperReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <main>{children}</main>
    </div>
  );
}
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/app/paper-reading/layout.tsx>

</Users/zhangqiwei/Documents/01_dev-project/portfolio_site/types/paper.ts>

export interface Paper {
  title: string;
  authors: string[];
  date: string;
  url: string;
  source: "arxiv" | "manual";
}
<//Users/zhangqiwei/Documents/01_dev-project/portfolio_site/types/paper.ts>

