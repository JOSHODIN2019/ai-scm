import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
      <div className="rounded-2xl border border-border/60 bg-card px-8 py-14 ring-1 ring-foreground/5">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          See what OpenAI makes of your own code
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Pull in a real commit and get a clear, trustworthy answer in seconds, with no
          setup and no guesswork.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" render={<Link to="/register">Create an account</Link>} />
          <Button size="lg" variant="outline" render={<Link to="/login">Sign in</Link>} />
        </div>
      </div>
    </section>
  )
}
