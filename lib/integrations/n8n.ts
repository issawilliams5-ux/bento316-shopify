import { Lead } from "@/types/lead";

/**
 * Sends a newly created lead to an n8n webhook for automation.
 * Configure N8N_WEBHOOK_URL in your .env to enable.
 * In n8n: create a Webhook trigger node → connect to SMS/email/CRM nodes.
 */
export async function sendLeadToN8n(lead: Lead): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log("[n8n] N8N_WEBHOOK_URL not set — skipping webhook");
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "lead.created",
        timestamp: new Date().toISOString(),
        lead: {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          business_type: lead.business_type,
          service: lead.service,
          budget: lead.budget,
          urgency: lead.urgency,
          notes: lead.notes,
          lead_score: lead.lead_score,
          suggested_sms: lead.suggested_sms,
          suggested_email: lead.suggested_email,
        },
      }),
    });

    if (!response.ok) {
      console.error("[n8n] Webhook returned error:", response.status);
    } else {
      console.log("[n8n] Lead successfully sent to n8n webhook");
    }
  } catch (err) {
    console.error("[n8n] Failed to send lead to webhook:", err);
  }
}
