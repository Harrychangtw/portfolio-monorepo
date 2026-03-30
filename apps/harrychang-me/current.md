diff --git a/apps/harrychang-me/styles/lcp-optimize.css b/apps/harrychang-me/styles/lcp-optimize.css
index 1672a20..46e3d62 100644
--- a/apps/harrychang-me/styles/lcp-optimize.css
+++ b/apps/harrychang-me/styles/lcp-optimize.css
@@ -18,13 +18,8 @@
   text-size-adjust: 100%;
 }
 
-/* Force the browser to assign high priority to paint */
-@supports (content-visibility: auto) {
-  .page-transition-enter {
-    content-visibility: auto;
-    contain-intrinsic-size: 0 1000px;
-  }
-}
+/* Page transition content is always visible at load — content-visibility: auto
+   was causing CLS by estimating 1000px then reflowing to actual height. */
 
 /* Optimize for LCP */
 .gallery-image-container {
