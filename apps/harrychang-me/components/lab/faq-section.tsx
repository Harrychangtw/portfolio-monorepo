"use client";

import { motion } from "motion/react";
import { useLanguage } from "@portfolio/lib/contexts/language-context";

const faqKeys = ["q1", "q2", "q3", "q4"] as const;

export default function FaqSection() {
  const { t } = useLanguage();

  return (
    <section className="container mt-24 md:mt-32">
      {/* Section Header */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-36px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="font-heading text-sm uppercase tracking-[0.2em] text-secondary mb-10 md:mb-12"
      >
        {t("lab.faq.title", "common")}
      </motion.h2>

      {/* FAQ Grid */}
      <div className="space-y-0">
        {faqKeys.map((key, index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-25px" }}
            transition={{
              duration: 1,
              ease: "easeOut",
              delay: index * 0.2, // Adjusted delay for whileInView
            }}
            className="grid grid-cols-12 gap-4 md:gap-6 py-6 md:py-8 border-t border-border first:border-t-0"
          >
            {/* Index Number */}
            <div className="col-span-1 hidden md:block">
              <span className="font-mono text-xs text-secondary/60">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Question */}
            <div className="col-span-12 md:col-span-4">
              <h3 className="font-heading font-medium text-foreground leading-snug">
                {t(`lab.faq.${key}`, "common")}
              </h3>
            </div>

            {/* Answer */}
            <div className="col-span-12 md:col-span-7">
              <p className="font-body text-secondary leading-relaxed">
                {t(`lab.faq.a${index + 1}`, "common")}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
