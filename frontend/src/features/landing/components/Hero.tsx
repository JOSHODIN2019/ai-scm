import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center">
        <div className="h-[32rem] w-[64rem] rounded-full bg-primary/10 blur-3xl dark:bg-primary/5" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-28 text-center">
        <Badge variant="secondary" className="gap-1.5">
          Powered by OpenAI, the AI behind ChatGPT
        </Badge>

        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          A second pair of eyes on every code change
        </h1>

        <p className="text-balance max-w-2xl text-lg text-muted-foreground">
          Pull a real commit straight from GitHub and let OpenAI read it the way an
          experienced engineer would, in plain English. No jargon, no guessing: just a
          fast, dependable second opinion on what changed and how much it matters,
          from one of the most capable and widely trusted AI models available today.
        </p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" render={<Link to="/register">Get started</Link>} />
          <Button size="lg" variant="outline" render={<Link to="/login">Sign in</Link>} />
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowRight className="size-3.5" />
          <span>Advisory only: the developer remains responsible for the final decision</span>
        </div>
      </div>
    </section>
  )
}
