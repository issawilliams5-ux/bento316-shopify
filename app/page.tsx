import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import FAQ from "@/components/FAQ";

const niches = [
  { icon: "💆", label: "Med Spas" },
  { icon: "✂️", label: "Salons & Estheticians" },
  { icon: "🔨", label: "Contractors" },
  { icon: "🏡", label: "Real Estate Agents" },
  { icon: "🦷", label: "Dental Offices" },
  { icon: "🧠", label: "Chiropractors" },
  { icon: "💪", label: "Fitness Studios" },
  { icon: "🌿", label: "Landscapers" },
];

const howItWorks = [
  {
    step: "01",
    title: "Lead Captured",
    desc: "Prospect fills out your form — on your site, a landing page, or a shared link.",
    icon: "📥",
  },
  {
    step: "02",
    title: "AI Qualifies",
    desc: "LeadPulse scores the lead 0-100 based on budget, urgency, and info quality.",
    icon: "🤖",
  },
  {
    step: "03",
    title: "Instant Follow-Up",
    desc: "A personalized SMS + email fires in seconds — before your competition even reads the inquiry.",
    icon: "⚡",
  },
  {
    step: "04",
    title: "Booking Push",
    desc: "Smart follow-up sequences keep nudging the lead toward a confirmed appointment.",
    icon: "📅",
  },
];

const problems = [
  {
    icon: "⏱️",
    title: "You reply too slowly",
    desc: "78% of customers book with the first business that responds. If you're not first, you've already lost.",
  },
  {
    icon: "🎯",
    title: "No lead qualification",
    desc: "You waste hours chasing tire-kickers while hot prospects go cold waiting for a callback.",
  },
  {
    icon: "💸",
    title: "Revenue leaking daily",
    desc: "Every missed follow-up is a lost booking. At $200–$500 per job, it adds up fast.",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-hero-glow">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(6,182,212,0.12),transparent)]" />
          <div className="section-container section-padding relative">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                AI-Powered Lead Response — Live in 24 hrs
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Stop losing leads because{" "}
                <span className="gradient-text">you reply too late.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                LeadPulse AI responds to new inquiries{" "}
                <strong className="text-white">instantly</strong>, qualifies
                prospects automatically, and pushes them toward booking — while
                you focus on doing the work.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link href="/demo">
                  <Button size="lg" className="w-full sm:w-auto shadow-cyan-500/30 shadow-xl">
                    Try the Lead Form →
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    View Pricing
                  </Button>
                </Link>
              </div>

              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
                {[
                  { value: "&lt;3 min", label: "Avg. response time" },
                  { value: "500+", label: "Leads processed" },
                  { value: "35%", label: "More bookings" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div
                      className="text-2xl sm:text-3xl font-bold text-cyan-400"
                      dangerouslySetInnerHTML={{ __html: stat.value }}
                    />
                    <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Problem ── */}
        <section className="section-padding bg-slate-800/40">
          <div className="section-container">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                The lead follow-up problem is{" "}
                <span className="gradient-text">costing you money</span>
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Every local service business faces the same painful cycle. Here's
                where revenue disappears.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {problems.map((p) => (
                <div key={p.title} className="card-base p-8">
                  <div className="text-4xl mb-4">{p.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {p.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="section-padding">
          <div className="section-container">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                How <span className="gradient-text">LeadPulse AI</span> works
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Four steps from inquiry to booked client — fully automated.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((step, i) => (
                <div key={step.step} className="relative">
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-cyan-500/40 to-transparent z-0" />
                  )}
                  <div className="card-base p-6 relative z-10">
                    <div className="text-3xl mb-4">{step.icon}</div>
                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">
                      Step {step.step}
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who It's For ── */}
        <section className="section-padding bg-slate-800/40">
          <div className="section-container">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Built for{" "}
                <span className="gradient-text">local service businesses</span>
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                If you rely on inbound leads to fill your calendar, LeadPulse AI
                was made for you.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {niches.map((n) => (
                <div
                  key={n.label}
                  className="card-base p-6 text-center hover:border-cyan-500/40 hover:bg-slate-700/50 transition-all duration-200 cursor-default"
                >
                  <div className="text-3xl mb-3">{n.icon}</div>
                  <div className="text-sm font-medium text-slate-200">
                    {n.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing Preview ── */}
        <section className="section-padding">
          <div className="section-container">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Simple, transparent{" "}
                <span className="gradient-text">pricing</span>
              </h2>
              <p className="text-slate-400">
                No setup fees. Cancel any time.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  name: "Starter",
                  price: "$97",
                  period: "/mo",
                  desc: "Perfect for solo operators and small teams.",
                  features: [
                    "Up to 100 leads/mo",
                    "AI lead scoring",
                    "SMS + email follow-up",
                    "Admin dashboard",
                    "n8n webhook integration",
                    "Email support",
                  ],
                  cta: "Get Started",
                  featured: false,
                },
                {
                  name: "Growth",
                  price: "$197",
                  period: "/mo",
                  desc: "For growing businesses ready to scale.",
                  features: [
                    "Up to 500 leads/mo",
                    "Everything in Starter",
                    "Dify AI qualification",
                    "Twilio SMS automation",
                    "Resend email automation",
                    "Priority support",
                  ],
                  cta: "Most Popular",
                  featured: true,
                },
                {
                  name: "Agency",
                  price: "$397",
                  period: "/mo",
                  desc: "Run LeadPulse for multiple client locations.",
                  features: [
                    "Unlimited leads",
                    "Everything in Growth",
                    "Multi-location support",
                    "White-label options",
                    "Stripe billing integration",
                    "Dedicated onboarding",
                  ],
                  cta: "Contact Sales",
                  featured: false,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`card-base p-8 flex flex-col ${
                    plan.featured
                      ? "border-cyan-500 glow-cyan relative"
                      : ""
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 rounded-full bg-cyan-500 text-slate-900 text-xs font-bold uppercase tracking-wide">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">{plan.desc}</p>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-slate-400">{plan.period}</span>
                    </div>
                    <ul className="space-y-2.5 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                          <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href="/demo" className="mt-auto">
                    <Button
                      variant={plan.featured ? "primary" : "outline"}
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="section-padding bg-slate-800/40">
          <div className="section-container max-w-3xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Frequently asked{" "}
                <span className="gradient-text">questions</span>
              </h2>
            </div>
            <FAQ />
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="section-padding">
          <div className="section-container">
            <div className="card-base p-10 sm:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(6,182,212,0.08),transparent)]" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to stop losing leads?
                </h2>
                <p className="text-slate-400 max-w-xl mx-auto mb-8 text-lg">
                  Try the live demo — submit a lead and watch LeadPulse AI score
                  it and generate your follow-up messages in real time.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/demo">
                    <Button size="lg" className="w-full sm:w-auto shadow-cyan-500/30 shadow-xl">
                      Try the Free Demo →
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      See Pricing
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
