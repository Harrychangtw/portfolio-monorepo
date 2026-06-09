"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@portfolio/lib/contexts/language-context";

function Section({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 py-8 md:py-10 border-t border-border">
      <div className="col-span-1 hidden md:block">
        <span className="label-mono">{String(index).padStart(2, "0")}</span>
      </div>

      <div className="col-span-12 md:col-span-4 mb-4 md:mb-0">
        <h2 className="section-label">{title}</h2>
      </div>

      <div className="col-span-12 md:col-start-7 md:col-span-6">{children}</div>
    </div>
  );
}

export default function PrivacyContent() {
  const { t, tHtml } = useLanguage();

  return (
    <article className="container mt-24 md:mt-32 mb-24 md:mb-32">
      <div className="mb-6 md:mb-8">
        <h1 className="font-heading text-[clamp(2.25rem,5.5vw,4.5rem)] font-regular tracking-[-0.02em] text-foreground leading-[0.95]">
          {t("privacy.title")}
        </h1>
      </div>

      <Section index={1} title={t("privacy.overview.title")}>
        <p className="font-body text text-primary leading-relaxed">
          {tHtml("privacy.overview.body")}
        </p>
      </Section>

      <Section index={2} title={t("privacy.cookies.title")}>
        <p className="font-body text text-primary leading-relaxed">
          {tHtml("privacy.cookies.body")}
        </p>
      </Section>

      <Section index={3} title={t("privacy.analytics.title")}>
        <p className="font-body text text-primary leading-relaxed">
          {tHtml("privacy.analytics.body")}
        </p>
      </Section>

      <Section index={4} title={t("privacy.guestbook.title")}>
        <p className="font-body text text-primary leading-relaxed">
          {tHtml("privacy.guestbook.body")}
        </p>
      </Section>

      <Section index={5} title={t("privacy.thirdParty.title")}>
        <p className="font-body text text-primary leading-relaxed">
          {tHtml("privacy.thirdParty.body")}
        </p>
      </Section>

      <Section index={6} title={t("privacy.rights.title")}>
        <p className="font-body text text-primary leading-relaxed">
          {tHtml("privacy.rights.body")}
        </p>
      </Section>
    </article>
  );
}
