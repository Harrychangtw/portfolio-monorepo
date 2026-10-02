import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import DocumentShell from "@/components/document-shell";
import NotFound from "./[lang]/not-found";

// Every page lives under the `[lang]` root layout, so a URL that matches no
// route never reaches a layout — this renders the whole document for it, with
// a real 404 status. notFound() calls inside a route still use
// [lang]/not-found.tsx and [lang]/(main)/not-found.tsx.
export const metadata: Metadata = {
  title: siteConfig.metadata.title.default,
  description: siteConfig.metadata.description,
};

export default function GlobalNotFound() {
  return (
    <DocumentShell language="en">
      <NotFound />
    </DocumentShell>
  );
}
