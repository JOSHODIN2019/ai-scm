export function CodeViewer({ diff }: { diff: string }) {
  const lines = diff.split("\n")

  return (
    <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-muted/40 p-4 text-xs leading-relaxed">
      <code>
        {lines.map((line, i) => {
          const tone = line.startsWith("+")
            ? "text-emerald-700 dark:text-emerald-400"
            : line.startsWith("-")
              ? "text-red-700 dark:text-red-400"
              : "text-foreground"
          return (
            <div key={i} className={tone}>
              {line || " "}
            </div>
          )
        })}
      </code>
    </pre>
  )
}
