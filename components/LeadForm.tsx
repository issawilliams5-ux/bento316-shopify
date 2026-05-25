"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
import { LeadFormData } from "@/types/lead";

const BUSINESS_TYPES = [
  "Med Spa",
  "Salon / Esthetician",
  "Contractor / Remodeler",
  "Real Estate Agent",
  "Dental Office",
  "Chiropractor",
  "Fitness / Gym",
  "Cleaning Service",
  "Landscaping",
  "Other",
];

const BUDGETS = [
  "$5,000+",
  "$2,000–$5,000",
  "$1,000–$2,000",
  "Under $1,000",
  "Not sure",
];

const URGENCIES = [
  "Immediately / ASAP",
  "Within 1 week",
  "This month",
  "Next 3 months",
  "Just browsing",
];

const empty: LeadFormData = {
  name: "",
  phone: "",
  email: "",
  business_type: "",
  service: "",
  budget: "",
  urgency: "",
  notes: "",
};

export default function LeadForm() {
  const router = useRouter();
  const [form, setForm] = useState<LeadFormData>(empty);
  const [errors, setErrors] = useState<Partial<LeadFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  function set(field: keyof LeadFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate(): boolean {
    const newErrors: Partial<LeadFormData> = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      newErrors.name = "Full name is required";
    if (!form.phone.trim() && !form.email.trim())
      newErrors.phone = "Please provide a phone or email";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email address";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success || !data.lead) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push(`/thank-you?id=${data.lead.id}&score=${data.lead.lead_score}`);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className="label-base">
          Full Name <span className="text-cyan-400">*</span>
        </label>
        <input
          id="name"
          type="text"
          className="input-base"
          placeholder="Jane Smith"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          autoComplete="name"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Phone + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="phone" className="label-base">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            className="input-base"
            placeholder="(555) 867-5309"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            autoComplete="tel"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="label-base">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="input-base"
            placeholder="jane@medspa.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Business Type */}
      <div>
        <label htmlFor="business_type" className="label-base">
          Business Type
        </label>
        <select
          id="business_type"
          className="input-base"
          value={form.business_type}
          onChange={(e) => set("business_type", e.target.value)}
        >
          <option value="">Select your business type…</option>
          {BUSINESS_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Service */}
      <div>
        <label htmlFor="service" className="label-base">
          Service You're Interested In
        </label>
        <input
          id="service"
          type="text"
          className="input-base"
          placeholder="e.g. Botox, Kitchen remodel, Teeth whitening…"
          value={form.service}
          onChange={(e) => set("service", e.target.value)}
        />
      </div>

      {/* Budget + Urgency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="budget" className="label-base">
            Budget Range
          </label>
          <select
            id="budget"
            className="input-base"
            value={form.budget}
            onChange={(e) => set("budget", e.target.value)}
          >
            <option value="">Select a range…</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="urgency" className="label-base">
            When Do You Need This?
          </label>
          <select
            id="urgency"
            className="input-base"
            value={form.urgency}
            onChange={(e) => set("urgency", e.target.value)}
          >
            <option value="">Select timeline…</option>
            {URGENCIES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="label-base">
          Any additional details?
        </label>
        <textarea
          id="notes"
          rows={3}
          className="input-base resize-none"
          placeholder="Tell us anything else that would help us serve you better…"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>

      {serverError && (
        <div className="p-3 rounded-lg bg-red-900/40 border border-red-700 text-sm text-red-300">
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        loading={submitting}
        className="w-full"
      >
        {submitting ? "Submitting…" : "Submit My Inquiry →"}
      </Button>

      <p className="text-center text-xs text-slate-500">
        No spam. We only use your info to follow up on this request.
      </p>
    </form>
  );
}
