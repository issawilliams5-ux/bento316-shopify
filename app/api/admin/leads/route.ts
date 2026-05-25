import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (
    process.env.ADMIN_SECRET &&
    secret !== process.env.ADMIN_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[admin/leads/GET] Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
    }

    const stats = {
      total: leads?.length ?? 0,
      new: leads?.filter((l) => l.status === "new").length ?? 0,
      contacted: leads?.filter((l) => l.status === "contacted").length ?? 0,
      booked: leads?.filter((l) => l.status === "booked").length ?? 0,
      hot: leads?.filter((l) => l.lead_score >= 80).length ?? 0,
      avg_score:
        leads && leads.length > 0
          ? Math.round(
              leads.reduce((sum, l) => sum + (l.lead_score ?? 0), 0) /
                leads.length
            )
          : 0,
    };

    return NextResponse.json({ success: true, leads, stats });
  } catch (err) {
    console.error("[admin/leads/GET] Unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (process.env.ADMIN_SECRET && secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    const validStatuses = ["new", "contacted", "qualified", "booked", "lost"];
    if (!id || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/leads/PATCH] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
