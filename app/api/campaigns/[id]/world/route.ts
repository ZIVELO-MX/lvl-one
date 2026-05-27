import { NextResponse } from "next/server";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";
import { pick, LOCATION_FIELDS, FACTION_FIELDS } from "@/lib/api-helpers";

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

    const isMember = campaign.dm_id === session.user.id || (
      await supabase
        .from("campaign_players")
        .select("id")
        .eq("campaign_id", id)
        .eq("user_id", session.user.id)
        .maybeSingle()
    ).data;

    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [locationsRes, factionsRes] = await Promise.all([
      supabase.from("world_locations").select("*").eq("campaign_id", id).order("name"),
      supabase.from("factions").select("*").eq("campaign_id", id).order("name"),
    ]);

    return NextResponse.json({
      locations: locationsRes.data ?? [],
      factions: factionsRes.data ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { id } = await params;
    const body = await req.json();

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("dm_id")
      .eq("id", id)
      .single();

    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (campaign.dm_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { type, ...data } = body;
    let result;

    if (type === "location") {
      result = await supabase
        .from("world_locations")
        .insert({ ...pick(data, LOCATION_FIELDS), campaign_id: id })
        .select()
        .single();
    } else if (type === "faction") {
      result = await supabase
        .from("factions")
        .insert({ ...pick(data, FACTION_FIELDS), campaign_id: id })
        .select()
        .single();
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    return NextResponse.json(result.data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
