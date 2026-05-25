import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Setup Guide — LeadPulse AI",
  description: "Step-by-step integration guide for Supabase, n8n, Dify, Twilio, Resend, and Vercel.",
};

function Step({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-base p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
          {num}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
          <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs text-cyan-300 overflow-x-auto whitespace-pre font-mono leading-relaxed">
      {children}
    </pre>
  );
}

function Tag({ children }: { children: string }) {
  return (
    <code className="bg-slate-700/60 px-1.5 py-0.5 rounded text-xs text-cyan-300 font-mono">
      {children}
    </code>
  );
}

export default function SetupPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="section-container section-padding">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-14">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Integration{" "}
                <span className="gradient-text">Setup Guide</span>
              </h1>
              <p className="text-slate-400">
                Follow these steps to go from clone to live in under an hour.
              </p>
            </div>

            {/* Overview */}
            <div className="card-base p-6 mb-8 bg-slate-800/60">
              <h2 className="text-sm font-semibold text-white mb-4">
                What you&apos;ll connect
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: "🗄️", name: "Supabase", desc: "Lead database" },
                  { icon: "🔄", name: "n8n", desc: "Workflow automation" },
                  { icon: "🤖", name: "Dify", desc: "AI qualification" },
                  { icon: "📱", name: "Twilio", desc: "SMS sending" },
                  { icon: "📧", name: "Resend", desc: "Email delivery" },
                  { icon: "▲", name: "Vercel", desc: "Deployment" },
                ].map((i) => (
                  <div key={i.name} className="flex items-center gap-2 text-sm">
                    <span className="text-xl">{i.icon}</span>
                    <div>
                      <div className="text-white font-medium">{i.name}</div>
                      <div className="text-slate-500 text-xs">{i.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Step 1 — Clone & install */}
              <Step num="1" title="Clone & install dependencies">
                <p>Clone the repo and install packages:</p>
                <CodeBlock>{`git clone https://github.com/your-org/leadpulse-ai.git
cd leadpulse-ai
npm install`}</CodeBlock>
                <p>
                  Copy the example environment file:
                </p>
                <CodeBlock>cp .env.example .env.local</CodeBlock>
              </Step>

              {/* Step 2 — Supabase */}
              <Step num="2" title="Set up Supabase">
                <p>
                  1. Create a free project at{" "}
                  <strong className="text-white">supabase.com</strong>
                </p>
                <p>2. In the SQL Editor, run this schema:</p>
                <CodeBlock>{`CREATE TABLE leads (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text NOT NULL,
  phone         text,
  email         text,
  business_type text,
  service       text,
  budget        text,
  urgency       text,
  notes         text,
  lead_score    integer DEFAULT 0,
  status        text DEFAULT 'new',
  suggested_sms   text,
  suggested_email text,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON leads
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "anon_insert" ON leads
  FOR INSERT TO anon WITH CHECK (true);`}</CodeBlock>
                <p>
                  3. Copy your Project URL and keys from{" "}
                  <strong className="text-white">
                    Settings → API
                  </strong>{" "}
                  into <Tag>.env.local</Tag>:
                </p>
                <CodeBlock>{`NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...`}</CodeBlock>
              </Step>

              {/* Step 3 — n8n */}
              <Step num="3" title="Connect n8n for workflow automation">
                <p>
                  n8n lets you trigger CRM updates, Slack alerts, and more
                  whenever a new lead is captured.
                </p>
                <p>
                  1. In your n8n instance, create a new workflow with a{" "}
                  <strong className="text-white">Webhook</strong> trigger node
                </p>
                <p>
                  2. Set the HTTP Method to <Tag>POST</Tag> and copy the{" "}
                  <strong className="text-white">Test URL</strong>
                </p>
                <p>
                  3. Add your webhook URL to <Tag>.env.local</Tag>:
                </p>
                <CodeBlock>{`N8N_WEBHOOK_URL=https://your-n8n.app.n8n.cloud/webhook/leadpulse`}</CodeBlock>
                <p>
                  The payload sent to n8n includes the full lead object:{" "}
                  name, phone, email, score, urgency, budget, and the suggested
                  SMS + email templates.
                </p>
              </Step>

              {/* Step 4 — Dify */}
              <Step num="4" title="Add Dify AI qualification (optional)">
                <p>
                  Dify lets you build a custom AI workflow that further
                  qualifies leads based on their notes and responses.
                </p>
                <p>
                  1. Create an account at{" "}
                  <strong className="text-white">dify.ai</strong>
                </p>
                <p>
                  2. Create a new <strong className="text-white">Workflow</strong> with these input variables:
                </p>
                <CodeBlock>{`name, business_type, service, budget, urgency, notes`}</CodeBlock>
                <p>
                  3. Build your qualification logic and publish the workflow
                </p>
                <p>
                  4. Copy your API key and add to <Tag>.env.local</Tag>:
                </p>
                <CodeBlock>{`DIFY_API_KEY=app-xxxxxxxxxxxx
DIFY_API_URL=https://api.dify.ai/v1`}</CodeBlock>
              </Step>

              {/* Step 5 — Twilio */}
              <Step num="5" title="Configure Twilio for SMS (optional)">
                <p>
                  Twilio sends the AI-generated SMS to your leads automatically.
                </p>
                <p>
                  1. Create an account at{" "}
                  <strong className="text-white">twilio.com</strong> and get a phone number
                </p>
                <p>
                  2. Add your credentials to <Tag>.env.local</Tag>:
                </p>
                <CodeBlock>{`TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15551234567`}</CodeBlock>
                <p>
                  3. Install the Twilio package and wire it into{" "}
                  <Tag>app/api/leads/route.ts</Tag> after lead creation.
                </p>
                <CodeBlock>{`npm install twilio`}</CodeBlock>
              </Step>

              {/* Step 6 — Resend */}
              <Step num="6" title="Configure Resend for email (optional)">
                <p>
                  Resend delivers the personalized follow-up email to each lead.
                </p>
                <p>
                  1. Create an account at{" "}
                  <strong className="text-white">resend.com</strong> and verify
                  your sending domain
                </p>
                <p>
                  2. Add your API key to <Tag>.env.local</Tag>:
                </p>
                <CodeBlock>{`RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=hello@yourdomain.com`}</CodeBlock>
                <p>
                  3. Install the Resend SDK and add the send call in{" "}
                  <Tag>app/api/leads/route.ts</Tag>:
                </p>
                <CodeBlock>{`npm install resend`}</CodeBlock>
              </Step>

              {/* Step 7 — Vercel */}
              <Step num="7" title="Deploy to Vercel">
                <p>LeadPulse AI is Vercel-ready out of the box.</p>
                <p>1. Push your code to GitHub</p>
                <p>
                  2. Import the repo at{" "}
                  <strong className="text-white">vercel.com/new</strong>
                </p>
                <p>
                  3. In Vercel project settings, add all your environment
                  variables from <Tag>.env.local</Tag>
                </p>
                <p>
                  4. Click{" "}
                  <strong className="text-white">Deploy</strong> — you&apos;re
                  live!
                </p>
                <CodeBlock>{`# Or deploy via CLI:
npm install -g vercel
vercel --prod`}</CodeBlock>
              </Step>

              {/* Step 8 — Admin secret */}
              <Step num="8" title="Secure the admin dashboard">
                <p>
                  Set a strong admin secret to protect the dashboard API:
                </p>
                <CodeBlock>{`ADMIN_SECRET=change_this_to_a_long_random_string`}</CodeBlock>
                <p>
                  For production, consider adding Next.js middleware or
                  Supabase Auth to protect the <Tag>/admin</Tag> route.
                </p>
              </Step>
            </div>

            {/* Done */}
            <div className="mt-10 card-base p-8 text-center bg-slate-800/60">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-white mb-2">
                You&apos;re all set!
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Once configured, submit a test lead to verify everything is
                working end-to-end.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/demo"
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm transition-colors"
                >
                  Submit a Test Lead
                </Link>
                <Link
                  href="/admin"
                  className="px-6 py-3 rounded-xl border border-slate-600 hover:border-cyan-500 text-slate-300 hover:text-white font-semibold text-sm transition-colors"
                >
                  Open Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
