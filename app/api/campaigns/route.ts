import { NextResponse } from "next/server";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";
import { pick, CAMPAIGN_FIELDS } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();

    const { data: userCampaigns, error: dmErr } = await supabase
      .from("campaigns")
      .select("*")
      .eq("dm_id", session.user.id)
      .order("updated_at", { ascending: false });

    const { data: playerLinks, error: linkErr } = await supabase
      .from("campaign_players")
      .select("campaign_id")
      .eq("user_id", session.user.id);

    if (dmErr || linkErr) return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });

    const playerCampaignIds = playerLinks?.map(p => p.campaign_id) ?? [];
    let allData = userCampaigns ?? [];

    if (playerCampaignIds.length > 0) {
      const { data: playerCampaigns } = await supabase
        .from("campaigns")
        .select("*")
        .in("id", playerCampaignIds)
        .order("updated_at", { ascending: false });
      if (playerCampaigns) {
        const existing = new Set(allData.map(c => c.id));
        for (const c of playerCampaigns) {
          if (!existing.has(c.id)) allData.push(c);
        }
      }
    }

    return NextResponse.json(allData);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const body = await req.json();

    const { data, error } = await supabase
      .from("campaigns")
      .insert({ ...pick(body, CAMPAIGN_FIELDS), dm_id: session.user.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
