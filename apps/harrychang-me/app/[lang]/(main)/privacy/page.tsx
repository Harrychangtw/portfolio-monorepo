import type { Metadata } from "next";
import PrivacyContent from "@/components/main/privacy-content";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How harrychang.me handles your data — cookies, analytics, and third-party services.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
