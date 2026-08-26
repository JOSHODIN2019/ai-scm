import { SearchCode } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <SearchCode className="size-4" />
          <span>AI-Driven Software Configuration Management System</span>
        </div>
        <p>Academic research project, AI-assisted decision support</p>
      </div>
    </footer>
  )
}
