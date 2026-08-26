import { GitCommitHorizontal, FileSearch, Sparkles, Tags, UserCheck } from "lucide-react"

const STEPS = [
  { icon: GitCommitHorizontal, title: "Pick a commit", description: "Pull one straight from GitHub, or add it yourself." },
  { icon: FileSearch, title: "We read the details", description: "The message, the files, and the exact code that changed." },
  { icon: Sparkles, title: "OpenAI takes a look", description: "The same AI behind ChatGPT reviews it like an experienced engineer." },
  { icon: Tags, title: "You get a plain answer", description: "What kind of change it is, and how risky it looks, explained simply." },
  { icon: UserCheck, title: "You decide", description: "It's advice, not a verdict. You always have the final say." },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
        <p className="mt-3 text-muted-foreground">Five simple steps from a raw commit to an answer you can trust.</p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map(({ icon: Icon, title, description }, i) => (
          <div key={title} className="relative flex flex-col items-center text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full border border-border bg-card">
              <Icon className="size-5 text-primary" strokeWidth={2} />
            </div>
            <p className="text-sm font-medium">
              {i + 1}. {title}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
