diff --git a/apps/emilychang-me/next.config.ts b/apps/emilychang-me/next.config.ts
index b1ce0b4..1bbf6f9 100644
--- a/apps/emilychang-me/next.config.ts
+++ b/apps/emilychang-me/next.config.ts
@@ -3,11 +3,7 @@ import type { NextConfig } from "next";
 const nextConfig: NextConfig = {
   // Image optimization configuration
   images: {
-    deviceSizes: [640, 768, 1024, 1280, 1536, 1920],
-    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 448, 640, 896],
-    formats: ['image/webp', 'image/avif'],
-    minimumCacheTTL: 31536000,
-    dangerouslyAllowSVG: true,
+    unoptimized: true,
     contentDispositionType: 'attachment',
     remotePatterns: [
       {
diff --git a/apps/harrychang-me/next.config.mjs b/apps/harrychang-me/next.config.mjs
index b19b4e6..15df7fe 100644
--- a/apps/harrychang-me/next.config.mjs
+++ b/apps/harrychang-me/next.config.mjs
@@ -5,12 +5,8 @@ let userConfig = undefined
 /** @type {import('next').NextConfig} */
 const nextConfig = {
   images: {
-    deviceSizes: [640, 768, 1024, 1280, 1536, 1920],
-    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 448, 640, 896],
-    qualities: [20, 50, 60, 70, 75, 80, 90, 95, 100],
-    formats: ['image/webp', 'image/avif'],
-    minimumCacheTTL: 31536000,
-    dangerouslyAllowSVG: true,
+    unoptimized: true,
+
     contentDispositionType: 'attachment',
     remotePatterns: [
       {
diff --git a/packages/ui/image-container.tsx b/packages/ui/image-container.tsx
index 26dba7a..4b2c0bc 100644
--- a/packages/ui/image-container.tsx
+++ b/packages/ui/image-container.tsx
@@ -150,8 +150,7 @@ export function ImageContainer({
                         blurComplete ? "opacity-0" : "opacity-100"
                       } ${imgClassName || ''}`}
                       sizes={sizes}
-                      priority={priority}
-                      quality={20}
+                      unoptimized={true}
                       onLoad={() => setThumbLoaded(true)}
                     />
                   )}
@@ -179,8 +178,7 @@ export function ImageContainer({
                         blurComplete || priority ? "opacity-100" : "opacity-0"
                       } ${imgClassName || ''}`}
                       sizes={sizes}
-                      priority={priority}
-                      quality={quality}
+                      unoptimized={true}
                       onLoad={() => {
                         setBlurComplete(true)
                       }}
