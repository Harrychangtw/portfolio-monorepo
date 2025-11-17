
export interface Paper {
  title: string;
  authors: string[];
  date: string;
  url: string;
  source: "arxiv" | "manual";
}
