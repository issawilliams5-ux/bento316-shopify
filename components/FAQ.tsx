"use client";

import { useState } from "react";

const faqs = [
  {
    q: "How quickly does LeadPulse respond to a new lead?",
    a: "Within seconds of form submission. The AI scoring runs instantly server-side, and the follow-up SMS and email are queued immediately. Most leads receive a message in under 3 minutes.",
  },
  {
    q: "Do I need to know how to code to set this up?",
    a: "No. The setup guide walks you through connecting Supabase, copying your n8n webhook URL, and deploying to Vercel — all with point-and-click tools. Most businesses are live in under an hour.",
  },
  {
    q: "Can I customize the follow-up messages?",
    a: "Yes. The message templates live in your codebase and are easy to edit. You can also connect a Dify AI workflow to generate fully custom, AI-written messages based on each lead's specific details.",
  },
  {
    q: "What integrations does LeadPulse support?",
    a: "Out of the box: Supabase (database), n8n (workflow automation), Dify (AI qualification), Twilio (SMS), Resend (email), and Stripe (billing). The webhook architecture means you can connect virtually any CRM or tool.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — you can try the full lead form demo right now with no signup required. The demo shows you the exact AI scoring and message generation your leads will receive. When you're ready, choose a plan to go live.",
  },
  {
    q: "Can I use LeadPulse for multiple locations or clients?",
    a: "Absolutely. The Agency plan supports multi-location deployments and white-label options, making it ideal for marketing agencies or franchise operators managing multiple storefronts.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="card-base overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
          >
            <span className="font-medium text-white text-sm sm:text-base">
              {faq.q}
            </span>
            <svg
              className={`w-5 h-5 text-cyan-400 flex-shrink-0 transition-transform duration-200 ${
                open === i ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-slate-700 pt-4">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
