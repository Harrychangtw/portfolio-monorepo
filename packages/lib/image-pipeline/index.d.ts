export interface VariantConfig {
  width: number;
  height?: number;
  quality: number;
}

export interface ThumbnailConfig {
  width: number;
  quality: number;
}

export interface CategoryConfig {
  landscape?: VariantConfig;
  portrait?: VariantConfig;
  hero?: VariantConfig;
  fullscreen?: VariantConfig;
  title?: VariantConfig;
  square?: VariantConfig;
  thumbnail: ThumbnailConfig;
}

export interface CategorySpec {
  mode: "flat" | "gallery" | "square";
  source: string;
  config: CategoryConfig;
  rotate?: boolean;
  responsiveWidths?: readonly number[];
}

export interface RunOptimizeOptions {
  directories: { optimized: string };
  categories: Record<string, CategorySpec>;
  concurrency?: number;
}

export interface RunOptimizeResult {
  optimized: number;
  skipped: number;
  errors: number;
}

export function runOptimize(
  options: RunOptimizeOptions,
): Promise<RunOptimizeResult>;

export const RESPONSIVE_WIDTHS: readonly number[];
