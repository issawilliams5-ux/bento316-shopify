"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ScoreBadge, StatusBadge } from "@/components/ui/Badge";
import { Lead } from "@/types/lead";

interface Stats {
  total: number;
  new: number;
  contacted: number;
  booked: number;
  hot: number;
  avg_score: number;
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="card-base p-6">
      <div className="text-sm text-slate-400 mb-1">{label}</div>
      <div
        className={`text-3xl font-bold ${accent ? "text-cyan-400" : "text-white"}`}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function LeadRow({
  lead,
  onStatusChange,
}: {
  lead: Lead;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-slate-700/50 hover:bg-slate-800/50 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 text-sm font-medium text-white">
          {lead.name}
        </td>
        <td className="px-4 py-3 text-sm text-slate-400 hidden sm:table-cell">
          {lead.phone || lead.email || "—"}
        </td>
        <td className="px-4 py-3 text-sm text-slate-400 hidden md:table-cell">
          {lead.business_type || "—"}
        </td>
        <td className="px-4 py-3">
          <ScoreBadge score={lead.lead_score} />
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={lead.status} />
        </td>
        <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">
          {new Date(lead.created_at).toLocaleDateString()}
        </td>
        <td className="px-4 py-3">
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-800/30">
          <td colSpan={7} className="px-4 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
              {/* Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  Lead Details
                </h4>
                {[
                  ["Service", lead.service],
                  ["Budget", lead.budget],
                  ["Urgency", lead.urgency],
                  ["Email", lead.email],
                  ["Phone", lead.phone],
                  ["Notes", lead.notes],
                ].map(([label, val]) =>
                  val ? (
                    <div key={label} className="flex gap-2">
                      <span className="text-slate-500 w-20 flex-shrink-0">{label}:</span>
                      <span className="text-slate-200">{val}</span>
                    </div>
                  ) : null
                )}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-slate-500 text-xs">Update status:</span>
                  <select
                    className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                    value={lead.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      onStatusChange(lead.id, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {["new", "contacted", "qualified", "booked", "lost"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
              {/* Messages */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    📱 Suggested SMS
                  </h4>
                  <div className="bg-slate-700/50 rounded-lg p-3 text-xs text-slate-200 whitespace-pre-wrap font-mono">
                    {lead.suggested_sms || "No SMS generated"}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    📧 Suggested Email
                  </h4>
                  <div className="bg-slate-700/50 rounded-lg p-3 text-xs text-slate-200 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                    {lead.suggested_email || "No email generated"}
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch("/api/admin/leads", {
          headers: {
            "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "",
          },
        });
        if (!res.ok) {
          setError("Failed to load leads. Check your Supabase configuration.");
          return;
        }
        const data = await res.json();
        setLeads(data.leads ?? []);
        setStats(data.stats ?? null);
      } catch {
        setError("Network error loading leads.");
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  async function handleStatusChange(id: string, status: string) {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: status as Lead["status"] } : l))
    );
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "",
      },
      body: JSON.stringify({ id, status }),
    });
  }

  const filtered = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="section-container section-padding">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Lead Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage and track all incoming leads
              </p>
            </div>
            <Link href="/demo">
              <button className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm transition-colors">
                + New Test Lead
              </button>
            </Link>
          </div>

          {/* Supabase notice */}
          <div className="card-base p-4 mb-6 flex items-start gap-3 border-yellow-700 bg-yellow-900/20">
            <span className="text-xl">⚠️</span>
            <div className="text-sm text-yellow-200">
              <strong>Demo Mode:</strong> The dashboard requires Supabase to be
              configured. Set{" "}
              <code className="bg-yellow-900/50 px-1 rounded text-xs">
                NEXT_PUBLIC_SUPABASE_URL
              </code>{" "}
              and{" "}
              <code className="bg-yellow-900/50 px-1 rounded text-xs">
                SUPABASE_SERVICE_ROLE_KEY
              </code>{" "}
              in your environment to activate live data.{" "}
              <Link href="/setup" className="text-cyan-400 hover:underline">
                See setup guide →
              </Link>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <StatCard label="Total Leads" value={stats.total} />
              <StatCard label="New" value={stats.new} accent />
              <StatCard label="Contacted" value={stats.contacted} />
              <StatCard label="Booked" value={stats.booked} accent />
              <StatCard label="Hot Leads 🔥" value={stats.hot} accent />
              <StatCard label="Avg Score" value={stats.avg_score} sub="out of 100" />
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 flex-wrap mb-4">
            {["all", "new", "contacted", "qualified", "booked", "lost"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  filter === f
                    ? "bg-cyan-500 text-slate-900"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {f}
                {f === "all" && leads.length > 0 && (
                  <span className="ml-1 opacity-70">({leads.length})</span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="card-base overflow-hidden">
            {loading ? (
              <div className="p-16 text-center text-slate-400">
                <div className="text-3xl mb-4 animate-pulse">⏳</div>
                Loading leads…
              </div>
            ) : error ? (
              <div className="p-16 text-center">
                <div className="text-3xl mb-4">🔌</div>
                <p className="text-slate-400 text-sm mb-4">{error}</p>
                <Link href="/setup" className="text-cyan-400 text-sm hover:underline">
                  Configure Supabase →
                </Link>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-slate-400 text-sm mb-4">
                  {leads.length === 0
                    ? "No leads yet. Submit a test lead to get started."
                    : "No leads match this filter."}
                </p>
                <Link
                  href="/demo"
                  className="inline-block px-4 py-2 rounded-xl bg-cyan-500 text-slate-900 text-sm font-semibold"
                >
                  Submit a Test Lead
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-700 bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                        Business
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                        Date
                      </th>
                      <th className="px-4 py-3 w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((lead) => (
                      <LeadRow
                        key={lead.id}
                        lead={lead}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
