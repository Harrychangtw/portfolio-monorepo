import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uses",
  description:
    "Tools I've collected along the way. The hardware, software, and gear behind Harry Chang's creative and development workflow.",
  openGraph: {
    title: "Uses | Harry Chang 張祺煒",
    description:
      "Tools I've collected along the way — the hardware, software, and gear behind Harry Chang's workflow.",
    images: [
      {
        url: "https://www.harrychang.me/images/og-image-uses.webp",
        width: 1200,
        height: 630,
        alt: "Uses & Setup | Harry Chang",
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function UsesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
