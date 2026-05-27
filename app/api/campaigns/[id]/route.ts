import { NextResponse } from "next/server";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";
import { pick, CAMPAIGN_FIELDS, apiError } from "@/lib/api-helpers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { id } = await params;

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isDm = data.dm_id === session.user.id;
    if (!isDm) {
      // Check if user is a player
      const { data: player } = await supabase
        .from("campaign_players")
        .select("id")
        .eq("campaign_id", id)
        .eq("user_id", session.user.id)
        .single();
      if (!player) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(data);
  } catch (e) {
    return apiError(e);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { id } = await params;
    const body = await req.json();

    const { data, error } = await supabase
      .from("campaigns")
      .update({ ...pick(body, CAMPAIGN_FIELDS), updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("dm_id", session.user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { id } = await params;

    const { error } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", id)
      .eq("dm_id", session.user.id);

    if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return apiError(e);
  }
}
