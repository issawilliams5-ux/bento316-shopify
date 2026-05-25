import { LeadFormData } from "@/types/lead";

export function generateSMS(data: LeadFormData): string {
  const firstName = data.name.trim().split(" ")[0];
  const service = data.service || "our services";
  const urgencyLine =
    data.urgency === "Immediately / ASAP" || data.urgency === "Within 1 week"
      ? " We can usually get you in quickly — "
      : " ";

  return `Hi ${firstName}! 👋 Thanks for reaching out about ${service}.${urgencyLine}When's a good time for a quick call? Book directly: [BOOKING_LINK] — [Business Name]`;
}

export function generateEmail(data: LeadFormData): string {
  const firstName = data.name.trim().split(" ")[0];
  const service = data.service || "our services";
  const budgetLine = data.budget
    ? `\nYour mentioned budget range: ${data.budget}`
    : "";
  const urgencyLine = data.urgency
    ? `\nTimeline: ${data.urgency}`
    : "";
  const isUrgent =
    data.urgency === "Immediately / ASAP" ||
    data.urgency === "Within 1 week";

  return `Subject: Your inquiry about ${service} — [Business Name]

Hi ${firstName},

Thank you for reaching out! We received your inquiry and we're excited to help.
${budgetLine}${urgencyLine}

${
  isUrgent
    ? `Since you mentioned needing this ${data.urgency.toLowerCase()}, we're prioritizing your request right now.`
    : "We'll make sure to find the right fit for your timeline and goals."
}

Here's what happens next:
• A team member will personally review your request within the hour
• We'll reach out to confirm a time that works for you
• You'll receive a custom plan tailored to your needs

Ready to move faster? Book a free 15-minute consultation now:
👉 [BOOKING_LINK]

We look forward to working with you!

Warm regards,
[Your Name]
[Business Name]
[Phone] | [Website]

---
You're receiving this because you submitted an inquiry. Questions? Reply directly to this email.`;
}
