import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Pricing — LeadPulse AI",
  description:
    "Simple, transparent pricing for AI lead follow-up. Starter $97/mo, Growth $197/mo, Agency $397/mo.",
};

const plans = [
  {
    name: "Starter",
    price: 97,
    desc: "Perfect for solo operators and small teams getting started with automated lead follow-up.",
    features: [
      { text: "Up to 100 leads per month", included: true },
      { text: "AI lead scoring (0–100)", included: true },
      { text: "Suggested SMS + email templates", included: true },
      { text: "Admin dashboard", included: true },
      { text: "Supabase database storage", included: true },
      { text: "n8n webhook integration", included: true },
      { text: "Email support", included: true },
      { text: "Dify AI qualification", included: false },
      { text: "Twilio SMS automation", included: false },
      { text: "Multi-location support", included: false },
    ],
    cta: "Get Started",
    ctaHref: "/demo",
    featured: false,
  },
  {
    name: "Growth",
    price: 197,
    desc: "For growing businesses ready to automate the full follow-up pipeline.",
    features: [
      { text: "Up to 500 leads per month", included: true },
      { text: "AI lead scoring (0–100)", included: true },
      { text: "Suggested SMS + email templates", included: true },
      { text: "Admin dashboard", included: true },
      { text: "Supabase database storage", included: true },
      { text: "n8n webhook integration", included: true },
      { text: "Priority support", included: true },
      { text: "Dify AI qualification", included: true },
      { text: "Twilio SMS automation", included: true },
      { text: "Resend email automation", included: true },
    ],
    cta: "Start Free Trial",
    ctaHref: "/demo",
    featured: true,
  },
  {
    name: "Agency",
    price: 397,
    desc: "Run LeadPulse for multiple client locations. White-label included.",
    features: [
      { text: "Unlimited leads", included: true },
      { text: "Everything in Growth", included: true },
      { text: "Multi-location support", included: true },
      { text: "White-label branding", included: true },
      { text: "Stripe billing integration", included: true },
      { text: "Custom domain support", included: true },
      { text: "Dedicated onboarding call", included: true },
      { text: "SLA + uptime guarantee", included: true },
      { text: "API access", included: true },
      { text: "Custom integrations", included: true },
    ],
    cta: "Contact Sales",
    ctaHref: "/demo",
    featured: false,
  },
];

const faqs = [
  {
    q: "Is there a setup fee?",
    a: "No. All plans include free setup. Deploy to Vercel and connect Supabase in under an hour.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. No contracts, no cancellation fees. Cancel from your dashboard with one click.",
  },
  {
    q: "What counts as a lead?",
    a: "A lead is any form submission received through your LeadPulse capture form.",
  },
  {
    q: "Do you offer annual discounts?",
    a: "Yes — annual billing saves 20% on all plans. Contact us to switch.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="section-container section-padding">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Simple, transparent{" "}
              <span className="gradient-text">pricing</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              No hidden fees. No surprise bills. Pick the plan that matches your
              lead volume.
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`card-base p-8 flex flex-col relative ${
                  plan.featured ? "border-cyan-500 glow-cyan" : ""
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="px-4 py-1 rounded-full bg-cyan-500 text-slate-900 text-xs font-bold uppercase tracking-wide">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">
                    {plan.name}
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {plan.desc}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-white">
                      ${plan.price}
                    </span>
                    <span className="text-slate-400">/mo</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f.text}
                      className={`flex items-start gap-2.5 text-sm ${
                        f.included ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {f.included ? (
                        <svg
                          className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {f.text}
                    </li>
                  ))}
                </ul>

                <Link href={plan.ctaHref}>
                  <Button
                    variant={plan.featured ? "primary" : "outline"}
                    className="w-full"
                    size="md"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Pricing FAQ
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="card-base p-6">
                  <h3 className="font-semibold text-white mb-2 text-sm">
                    {faq.q}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-20">
            <p className="text-slate-400 mb-6">
              Not sure which plan is right? Try the demo first — no signup
              required.
            </p>
            <Link href="/demo">
              <Button size="lg">Try the Free Demo →</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
