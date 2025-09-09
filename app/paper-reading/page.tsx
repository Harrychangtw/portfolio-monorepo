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
