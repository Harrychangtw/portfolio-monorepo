#!/usr/bin/env node
// emilychang-me image-dims map. Core logic lives in
// @portfolio/lib/image-pipeline/build-image-dims; this wrapper only points it
// at this app's root. Output (content/generated/image-dims.json) is consumed
// by getDimsFromWebPath in @portfolio/lib markdown.ts.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildImageDims } from "@portfolio/lib/image-pipeline/build-image-dims";

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

buildImageDims({ appRoot });
