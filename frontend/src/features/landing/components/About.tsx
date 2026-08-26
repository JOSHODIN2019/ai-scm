export function About() {
  return (
    <section id="about" className="mx-auto max-w-4xl px-6 py-24 text-center">
      <div className="rounded-2xl border border-border/60 bg-card px-8 py-14 ring-1 ring-foreground/5">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Why trust the AI behind it?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          This project is built on OpenAI's models, the same technology powering
          ChatGPT, used by hundreds of millions of people every week. That's not a
          random algorithm guessing at your code; it's one of the most capable AI
          systems available today, reading each change carefully and explaining its
          reasoning in plain language. It never touches your source code, and it never
          makes the final call. It gives you an informed second opinion, and you decide
          what to do with it.
        </p>
      </div>
    </section>
  )
}
