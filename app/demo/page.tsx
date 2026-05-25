import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Try the Demo — Submit a Lead",
  description:
    "Submit a sample lead and see LeadPulse AI score it and generate follow-up messages in real time.",
};

export default function DemoPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="section-container section-padding">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Live Demo — Real AI Scoring
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Submit a lead and watch{" "}
                <span className="gradient-text">LeadPulse AI</span> work
              </h1>
              <p className="text-slate-400 leading-relaxed">
                Fill out the form below as if you were a prospective customer.
                LeadPulse will score your lead 0–100 and generate a personalized
                SMS + email follow-up — in seconds.
              </p>
            </div>

            {/* What happens next callout */}
            <div className="card-base p-5 mb-8 flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xl">
                ⚡
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  What happens after you submit?
                </h3>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>Your lead is saved to Supabase</li>
                  <li>AI calculates a quality score (0–100)</li>
                  <li>Personalized SMS + email messages are generated</li>
                  <li>Webhook fires to n8n (if configured)</li>
                  <li>You land on the Thank You page with your results</li>
                </ul>
              </div>
            </div>

            {/* Form */}
            <div className="card-base p-6 sm:p-8">
              <LeadForm />
            </div>

            {/* Trust signals */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { icon: "🔒", label: "Secure & private" },
                { icon: "⚡", label: "Instant results" },
                { icon: "🆓", label: "No signup needed" },
              ].map((t) => (
                <div key={t.label} className="text-xs text-slate-500">
                  <div className="text-xl mb-1">{t.icon}</div>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
