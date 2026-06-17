import type { Metadata } from "next";
import HkTracker from "@/components/main/hk-tracker";

export const metadata: Metadata = {
  title: "HK Split",
  description: "Temporary split tracker for the Hong Kong trip.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HkSplitPage() {
  return <HkTracker />;
}
