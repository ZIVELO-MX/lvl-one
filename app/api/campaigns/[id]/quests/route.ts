import { NextResponse } from "next/server";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";
import { pick, QUEST_FIELDS, apiError } from "@/lib/api-helpers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { id } = await params;

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("dm_id")
      .eq("id", id)
      .single();

    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isDm = campaign.dm_id === session.user.id;
    if (!isDm) {
      const { data: player } = await supabase
        .from("campaign_players")
        .select("id")
        .eq("campaign_id", id)
        .eq("user_id", session.user.id)
        .single();
      if (!player) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("quests")
      .select("*")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { id } = await params;
    const { data: campaign } = await supabase.from("campaigns").select("dm_id").eq("id", id).single();
    if (!campaign || campaign.dm_id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();

    const { data, error } = await supabase
      .from("quests")
      .insert({ ...pick(body, QUEST_FIELDS), campaign_id: id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
