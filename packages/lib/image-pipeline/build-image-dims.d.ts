export interface BuildImageDimsOptions {
  appRoot: string;
  optimizedDir?: string;
  outputFile?: string;
}

export interface BuildImageDimsResult {
  count: number;
  skipped: number;
  outputFile: string;
}

export function buildImageDims(
  options: BuildImageDimsOptions,
): BuildImageDimsResult;
