export function GalleryLoadingSkeleton() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="w-full" style={{ paddingBottom: "66.67%" /* 3:2 aspect ratio */ }}>
        <div className="absolute inset-0 bg-muted overflow-hidden">
          {/* Shimmer effect */}
          <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-muted via-muted/50 to-muted" />
          
          {/* Loading indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-xs text-white">Loading image...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}