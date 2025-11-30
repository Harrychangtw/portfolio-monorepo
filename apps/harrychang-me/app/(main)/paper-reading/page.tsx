import { fetchArxivPapers, getManualPapers, getArxivPaperIds, getPrebuiltPapers } from "@portfolio/lib/lib/arxiv";
import { Paper } from "@portfolio/lib/types/paper";
import PaperReadingPageClient from "@/components/main/paper-reading-page-client";

export default async function PaperReadingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Try prebuilt cache first (build-time fetch)
  let allPapers: Paper[] = getPrebuiltPapers();

  // Fallback for local dev if cache missing
  if (!allPapers.length) {
    const arxivPaperIds = getArxivPaperIds();
    const [arxivPapers, manualPapers] = await Promise.all([
      fetchArxivPapers(arxivPaperIds),
      getManualPapers()
    ]);
    allPapers = [...arxivPapers, ...manualPapers].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

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
