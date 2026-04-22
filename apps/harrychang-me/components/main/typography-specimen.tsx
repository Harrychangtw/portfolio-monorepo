"use client";

import type { FontFamily } from "@portfolio/lib/lib/typography";
import { useLanguage } from "@portfolio/lib/contexts/language-context";

interface TypographySpecimenProps {
  font: FontFamily;
  index: number;
}

export function TypographySpecimen({ font }: TypographySpecimenProps) {
  const fontClass =
    font.variable === "--font-ibm-plex-sans" ? "font-ibm-plex" : "font-heading";
  const { t } = useLanguage();

  return (
    <div className="space-y-12">
      <div className="space-y-0">
        {font.weights
          .filter((weight) => weight >= 300)
          .map((weight) => (
            <div
              key={weight}
              className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 md:gap-4 py-4 first:pt-0 divider-subtle last:border-b-0"
            >
              <div className="order-2 md:order-1 min-w-0">
                <p
                  className={`${fontClass} text-primary md:text-lg truncate`}
                  style={{ fontWeight: weight }}
                >
                  {t("design.pangram")}
                </p>
              </div>
              <div className="order-1 md:order-2 shrink-0 md:text-right">
                <span className="label-mono md:text-xs uppercase tracking-wider">
                  {t(`design.weightsLabel.${weight}`)} · {weight}
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* ── Character set ──────────────────────────────── */}
      <div className="pt-8">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs md:text-xs text-secondary uppercase tracking-wider">
            {t("design.characterSet")}
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] border-l border-t border-secondary">
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=↗↙[]{}"
              .split("")
              .map((char, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center aspect-square border-r border-b border-secondary hover:bg-foreground hover:text-background transition-colors cursor-default"
                >
                  <span
                    className={`${fontClass} text-lg md:text-xl transition-colors`}
                  >
                    {char}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
