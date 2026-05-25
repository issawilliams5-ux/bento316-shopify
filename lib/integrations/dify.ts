import { LeadFormData } from "@/types/lead";

export interface DifyResult {
  qualified: boolean;
  confidence: number;
  reasoning: string;
  recommended_action: string;
}

/**
 * Qualifies a lead using a Dify AI workflow.
 * Configure DIFY_API_KEY and DIFY_API_URL in your .env to enable.
 * In Dify: create a workflow with inputs matching the lead fields below.
 */
export async function qualifyLeadWithDify(
  lead: LeadFormData
): Promise<DifyResult | null> {
  const apiKey = process.env.DIFY_API_KEY;
  const apiUrl = process.env.DIFY_API_URL ?? "https://api.dify.ai/v1";

  if (!apiKey) {
    console.log("[Dify] DIFY_API_KEY not set — skipping AI qualification");
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/workflows/run`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {
          name: lead.name,
          business_type: lead.business_type,
          service: lead.service,
          budget: lead.budget,
          urgency: lead.urgency,
          notes: lead.notes,
        },
        response_mode: "blocking",
        user: "leadpulse-system",
      }),
    });

    if (!response.ok) {
      console.error("[Dify] API error:", response.status);
      return null;
    }

    const data = await response.json();
    return (data?.data?.outputs as DifyResult) ?? null;
  } catch (err) {
    console.error("[Dify] Failed to qualify lead:", err);
    return null;
  }
}
