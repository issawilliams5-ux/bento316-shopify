import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-900 font-bold text-sm">
                LP
              </div>
              <span className="font-bold text-lg">
                LeadPulse <span className="text-cyan-400">AI</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Stop losing leads because you reply too late. LeadPulse AI
              responds instantly, qualifies prospects, and drives bookings —
              automatically.
            </p>
            <div className="flex gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">3 min</div>
                <div className="text-xs text-slate-500">Avg response</div>
              </div>
              <div className="w-px bg-slate-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">500+</div>
                <div className="text-xs text-slate-500">Leads captured</div>
              </div>
              <div className="w-px bg-slate-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">35%</div>
                <div className="text-xs text-slate-500">Book rate lift</div>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Product
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "How It Works", href: "/#how-it-works" },
                { label: "Pricing", href: "/pricing" },
                { label: "Try Demo", href: "/demo" },
                { label: "Admin Dashboard", href: "/admin" },
                { label: "Setup Guide", href: "/setup" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Integrations */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Integrations
            </h3>
            <ul className="space-y-2.5">
              {["n8n Workflows", "Dify AI", "Twilio SMS", "Resend Email", "Supabase", "Stripe Billing"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-sm text-slate-400">{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} LeadPulse AI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
