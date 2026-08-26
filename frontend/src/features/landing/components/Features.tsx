import { GitCommitHorizontal, Sparkles, GitFork, ShieldQuestion } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const FEATURES = [
  {
    icon: GitFork,
    title: "Pulled straight from GitHub",
    description: "No copy-pasting. Browse a repository's real commits and pull one in with a single click.",
  },
  {
    icon: GitCommitHorizontal,
    title: "Nothing gets missed",
    description: "Every changed file and every line of the diff is captured automatically, exactly as it happened.",
  },
  {
    icon: Sparkles,
    title: "Read by a trusted AI",
    description: "OpenAI, the company behind ChatGPT, reads the change and explains, in plain English, what it actually does.",
  },
  {
    icon: ShieldQuestion,
    title: "A risk score you can trust",
    description: "Low, Medium, or High, with a clear reason behind it, so you know what deserves a closer look before it ships.",
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          The same AI millions already trust, now reviewing your code
        </h2>
        <p className="mt-3 text-muted-foreground">
          Advisory classification and risk assessment. The developer makes the final call.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="border-border/60">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-5 text-primary" strokeWidth={2} />
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
