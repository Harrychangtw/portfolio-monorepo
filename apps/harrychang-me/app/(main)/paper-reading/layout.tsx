import React from "react";

export default function PaperReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <main>{children}</main>
    </div>
  );
}
