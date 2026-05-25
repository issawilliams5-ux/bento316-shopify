import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { calculateLeadScore } from "@/lib/lead-scoring";
import { generateSMS, generateEmail } from "@/lib/message-generator";
import { sendLeadToN8n } from "@/lib/integrations/n8n";
import { qualifyLeadWithDify } from "@/lib/integrations/dify";
import { LeadFormData } from "@/types/lead";

function validateLead(data: Partial<LeadFormData>): string | null {
  if (!data.name || data.name.trim().length < 2) return "Name is required";
  if (!data.phone && !data.email)
    return "Please provide at least a phone number or email";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return "Invalid email address";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const formData: LeadFormData = {
      name: (body.name ?? "").trim(),
      phone: (body.phone ?? "").trim(),
      email: (body.email ?? "").trim(),
      business_type: (body.business_type ?? "").trim(),
      service: (body.service ?? "").trim(),
      budget: body.budget ?? "",
      urgency: body.urgency ?? "",
      notes: (body.notes ?? "").trim(),
    };

    const validationError = validateLead(formData);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const lead_score = calculateLeadScore(formData);
    const suggested_sms = generateSMS(formData);
    const suggested_email = generateEmail(formData);

    const supabase = createServiceRoleClient();
    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        ...formData,
        lead_score,
        suggested_sms,
        suggested_email,
        status: "new",
      })
      .select()
      .single();

    if (error) {
      console.error("[leads/POST] Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save lead. Please try again." },
        { status: 500 }
      );
    }

    // Fire-and-forget integrations
    sendLeadToN8n(lead).catch(() => {});
    qualifyLeadWithDify(formData).catch(() => {});

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (err) {
    console.error("[leads/POST] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
