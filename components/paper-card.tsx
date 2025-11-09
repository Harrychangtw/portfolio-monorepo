
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
    <div 
      className="border-b border-border py-4"
    >
      <h3 className="text-lg font-semibold break-words leading-tight">
        <Link 
          href={paper.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="link-external !whitespace-normal hover:text-primary transition-colors duration-200"
        >
          {paper.title}
        </Link>
      </h3>
      <p className="text-sm" style={{ color: '#4F4F4F' }}>{paper.authors.join(", ")}</p>
      <p className="text-sm" style={{ color: '#4F4F4F' }}>{formatDate(paper.date)}</p>
    </div>
  );
}
