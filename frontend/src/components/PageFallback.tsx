export function PageFallback({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center bg-background text-sm text-muted-foreground ${
        fullScreen ? "min-h-screen" : "min-h-[50vh]"
      }`}
    >
      Loading…
    </div>
  )
}
