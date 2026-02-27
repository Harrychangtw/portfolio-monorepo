diff --git a/apps/harrychang-me/components/lab/faq-section.tsx b/apps/harrychang-me/components/lab/faq-section.tsx
index 0506bef..a22bc63 100644
--- a/apps/harrychang-me/components/lab/faq-section.tsx
+++ b/apps/harrychang-me/components/lab/faq-section.tsx
@@ -51,7 +51,7 @@ export default function FaqSection() {
             </div>
 
             {/* Answer */}
-            <div className="col-span-12 md:col-span-7">
+            <div className="col-span-12 md:col-start-7 md:col-span-6">
               <p className="font-body text-secondary leading-relaxed">
                 {t(`lab.faq.a${index + 1}`, "common")}
               </p>
diff --git a/apps/harrychang-me/components/lab/lab-page-client.tsx b/apps/harrychang-me/components/lab/lab-page-client.tsx
index cf0c148..30338e5 100644
--- a/apps/harrychang-me/components/lab/lab-page-client.tsx
+++ b/apps/harrychang-me/components/lab/lab-page-client.tsx
@@ -59,7 +59,7 @@ export default function LabPageClient() {
               initial={{ opacity: 0, y: 4 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0, duration: 0.5, ease: "easeOut" }}
-              className="inline-block mb-10 md:mb-12"
+              className="inline-block mb-6 md:mb-10"
             >
               <div className="px-4 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-sm">
                 <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
diff --git a/apps/harrychang-me/public/locales/en/common.json b/apps/harrychang-me/public/locales/en/common.json
index e46c247..29e932a 100644
--- a/apps/harrychang-me/public/locales/en/common.json
+++ b/apps/harrychang-me/public/locales/en/common.json
@@ -172,9 +172,9 @@
   },
   "lab": {
     "capsule": "Open · Closing September 2026",
-    "heroLine1": "Skills to Lead Tomorrow.",
-    "heroLine2": "Tools to Create Today.",
-    "tagline": "Strategic consulting for admissions, research narrative, and public speaking. Extremely limited bandwidth—apply to work together.",
+    "heroLine1": "Narrative Architecture.",
+    "heroLine2": "Engineered to be Chosen.",
+    "tagline": "The strategy behind NTU CSIE Rank #1, a TMLR at 17, and IELTS 8.5.",
     "heroEmailPlaceholder": "your@email.com",
     "applyNow": "Apply Now",
     "formTitle": "Request a Consultation",
diff --git a/apps/harrychang-me/public/locales/zh-TW/common.json b/apps/harrychang-me/public/locales/zh-TW/common.json
index bc64305..7a2de4b 100644
--- a/apps/harrychang-me/public/locales/zh-TW/common.json
+++ b/apps/harrychang-me/public/locales/zh-TW/common.json
@@ -172,9 +172,9 @@
   },
   "lab": {
     "capsule": "開放申請中 · 九月前限定",
-    "heroLine1": "十七歲的實戰心法",
-    "heroLine2": "獻給走自己路的你",
-    "tagline": "備審、研究敘事與口說表達的策略諮詢。名額極度有限，歡迎提出申請。",
+    "heroLine1": "被看見。被記住。",
+    "heroLine2": "被無可爭議地選上。",
+    "tagline": "臺大資工特選正取一、17 歲發表 TMLR 論文、雅思 8.5 的底層策略。",
     "heroEmailPlaceholder": "your@email.com",
     "applyNow": "立即申請",
     "formTitle": "申請諮詢",
