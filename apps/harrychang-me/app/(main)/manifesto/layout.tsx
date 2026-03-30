import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "I was never taught to create — I was born curious enough to try. Harry Chang's philosophy on work, creation, and curiosity.",
  openGraph: {
    title: "Manifesto | Harry Chang 張祺煒",
    description:
      "I was never taught to create — I was born curious enough to try. A philosophy on work, creation, and what it means to remain unfinished.",
    images: [
      {
        url: "https://www.harrychang.me/images/og-image-manifesto.webp",
        width: 1200,
        height: 630,
        alt: "Manifesto | Harry Chang",
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ManifestoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
