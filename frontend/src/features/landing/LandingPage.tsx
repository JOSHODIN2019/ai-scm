import { Navbar } from "./components/Navbar"
import { Hero } from "./components/Hero"
import { Features } from "./components/Features"
import { HowItWorks } from "./components/HowItWorks"
import { About } from "./components/About"
import { CtaSection } from "./components/CtaSection"
import { Footer } from "./components/Footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <About />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
