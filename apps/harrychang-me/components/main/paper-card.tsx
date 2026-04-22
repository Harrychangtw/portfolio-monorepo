import { Paper } from "@portfolio/lib/types/paper";
import { ArrowUpRight } from "lucide-react";

interface PaperCardProps {
  paper: Paper;
}

export default function PaperCard({ paper }: PaperCardProps) {
  // Format date as yyyy-mm-dd
  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toISOString().split("T")[0];
  };

  return (
    <a
      href={paper.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col md:flex-row md:items-baseline justify-between gap-2 md:gap-6 py-6 divider-subtle hover:border-border transition-colors duration-300"
    >
      <div className="order-2 md:order-1 min-w-0 md:max-w-[75%]">
        <h3 className="font-heading text-lg md:text-xl font-medium text-foreground group-hover:text-accent transition-colors duration-300 leading-snug mb-2 md:mb-1.5">
          {paper.title}
        </h3>
        <p className="text-body-secondary leading-relaxed">
          {paper.authors.join(", ")}
        </p>
      </div>

      <div className="order-1 md:order-2 shrink-0 md:text-right flex items-center justify-between md:justify-end gap-3 text-secondary group-hover:text-accent transition-colors duration-300 mb-2 md:mb-0">
        <span className="font-mono text-sm tracking-wider uppercase">
          {formatDate(paper.date)}
        </span>
        <ArrowUpRight className="w-4 h-4 shrink-0 transition-transform duration-300 md:group-hover:-translate-y-1 md:group-hover:translate-x-1" />
      </div>
    </a>
  );
}
