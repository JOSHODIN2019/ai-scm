import { Link } from "react-router-dom"
import { SearchCode } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <SearchCode className="size-5 text-primary" strokeWidth={2.25} />
          <span className="whitespace-nowrap">AI-SCM</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how-it-works" className="hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#about" className="hover:text-foreground transition-colors">
            About
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button variant="ghost" className="hidden sm:inline-flex" render={<Link to="/login">Sign in</Link>} />
          <Button render={<Link to="/register">Get started</Link>} />
        </div>
      </div>
    </header>
  )
}
