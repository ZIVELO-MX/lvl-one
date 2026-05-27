import { NextResponse } from "next/server";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";
import { pick, PLAYER_FIELDS } from "@/lib/api-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; playerId: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { id, playerId } = await params;
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

    const { data, error } = await supabase
      .from("campaign_players")
      .update(pick(body, PLAYER_FIELDS))
      .eq("id", playerId)
      .eq("campaign_id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; playerId: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { id, playerId } = await params;

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("dm_id")
      .eq("id", id)
      .single();

    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (campaign.dm_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("campaign_players")
      .delete()
      .eq("id", playerId)
      .eq("campaign_id", id);

    if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
