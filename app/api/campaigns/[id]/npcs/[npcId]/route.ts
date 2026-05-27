import { NextResponse } from "next/server";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";
import { pick, NPC_FIELDS, apiError } from "@/lib/api-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; npcId: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { id, npcId } = await params;
    const { data: campaign } = await supabase.from("campaigns").select("dm_id").eq("id", id).single();
    if (!campaign || campaign.dm_id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();

    const { data, error } = await supabase
      .from("npcs")
      .update({ ...pick(body, NPC_FIELDS), updated_at: new Date().toISOString() })
      .eq("id", npcId)
      .eq("campaign_id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; npcId: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { id, npcId } = await params;
    const { data: campaign } = await supabase.from("campaigns").select("dm_id").eq("id", id).single();
    if (!campaign || campaign.dm_id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { error } = await supabase.from("npcs").delete().eq("id", npcId).eq("campaign_id", id);
    if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return apiError(e);
  }
}
