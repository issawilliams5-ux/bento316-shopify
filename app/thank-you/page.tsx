import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import { createServiceRoleClient } from "@/lib/supabase";
import { getScoreLabel } from "@/lib/lead-scoring";
import { Lead } from "@/types/lead";

export const metadata: Metadata = {
  title: "Your Lead Was Received",
};

async function getLead(id: string): Promise<Lead | null> {
  try {
    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();
    return data as Lead | null;
  } catch {
    return null;
  }
}

function ScoreGauge({ score }: { score: number }) {
  const { label, colorClass } = getScoreLabel(score);
  const circumference = 2 * Math.PI * 44;
  const dashOffset = circumference - (score / 100) * circumference;

  let strokeColor = "#ef4444";
  if (score >= 80) strokeColor = "#4ade80";
  else if (score >= 60) strokeColor = "#facc15";
  else if (score >= 40) strokeColor = "#fb923c";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>
      <span className={`text-lg font-semibold ${colorClass}`}>{label}</span>
    </div>
  );
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: { id?: string; score?: string };
}) {
  const id = searchParams.id;
  if (!id) notFound();

  const lead = await getLead(id);
  const score = lead?.lead_score ?? parseInt(searchParams.score ?? "0", 10);
  const { label } = getScoreLabel(score);

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="section-container section-padding">
          <div className="max-w-2xl mx-auto">
            {/* Success header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-green-900/40 border border-green-700 flex items-center justify-center text-3xl mx-auto mb-6">
                ✅
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Lead received!
              </h1>
              <p className="text-slate-400">
                Here&apos;s what LeadPulse AI generated — in real time.
              </p>
            </div>

            {/* Score card */}
            <div className="card-base p-8 mb-6 text-center">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">
                Lead Quality Score
              </h2>
              <ScoreGauge score={score} />
              <p className="text-slate-400 text-sm mt-4 max-w-sm mx-auto">
                This score is calculated from phone, email, budget, urgency, and
                service details. A{" "}
                <strong className="text-white">{label}</strong> gets priority
                follow-up.
              </p>
            </div>

            {lead ? (
              <>
                {/* Lead summary */}
                <div className="card-base p-6 mb-6">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
                    Lead Summary
                  </h2>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: "Name", value: lead.name },
                      { label: "Business", value: lead.business_type || "—" },
                      { label: "Service", value: lead.service || "—" },
                      { label: "Budget", value: lead.budget || "—" },
                      { label: "Urgency", value: lead.urgency || "—" },
                      { label: "Status", value: lead.status },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="text-slate-500 text-xs mb-0.5">
                          {row.label}
                        </div>
                        <div className="text-white font-medium">{row.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested SMS */}
                <div className="card-base p-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📱</span>
                    <h2 className="text-sm font-semibold text-white uppercase tracking-widest">
                      Suggested SMS
                    </h2>
                    <span className="ml-auto px-2 py-0.5 rounded text-xs bg-cyan-900/50 text-cyan-400 border border-cyan-700">
                      Auto-generated
                    </span>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4 text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                    {lead.suggested_sms}
                  </div>
                </div>

                {/* Suggested Email */}
                <div className="card-base p-6 mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📧</span>
                    <h2 className="text-sm font-semibold text-white uppercase tracking-widest">
                      Suggested Email
                    </h2>
                    <span className="ml-auto px-2 py-0.5 rounded text-xs bg-cyan-900/50 text-cyan-400 border border-cyan-700">
                      Auto-generated
                    </span>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4 text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-wrap overflow-x-auto">
                    {lead.suggested_email}
                  </div>
                </div>
              </>
            ) : (
              <div className="card-base p-8 text-center mb-8">
                <p className="text-slate-400">
                  Lead saved successfully.{" "}
                  <Link href="/admin" className="text-cyan-400 hover:underline">
                    View in dashboard →
                  </Link>
                </p>
              </div>
            )}

            {/* What's next */}
            <div className="card-base p-6 mb-8 bg-slate-800/60">
              <h2 className="text-sm font-semibold text-white mb-4">
                In a live deployment, here&apos;s what would happen next:
              </h2>
              <ul className="space-y-2.5">
                {[
                  "📱 SMS sent to the lead via Twilio within 60 seconds",
                  "📧 Email delivered via Resend with the personalized template",
                  "🔄 Lead payload sent to n8n for CRM sync and workflow automation",
                  "🤖 Dify AI qualification runs in the background",
                  "📊 Lead appears in your admin dashboard with real-time score",
                  "⏰ Follow-up sequence schedules reminders for 24h, 48h, 7 days",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="text-base">{item.split(" ")[0]}</span>
                    <span>{item.substring(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/admin" className="flex-1">
                <Button variant="outline" className="w-full">
                  View Admin Dashboard
                </Button>
              </Link>
              <Link href="/demo" className="flex-1">
                <Button className="w-full">Submit Another Lead</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
