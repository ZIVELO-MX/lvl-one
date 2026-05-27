import { NextResponse } from "next/server";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { id } = await params;

    const { data: comment } = await supabase
      .from("comments")
      .select("user_id, campaign_id")
      .eq("id", id)
      .single();

    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("dm_id")
      .eq("id", comment.campaign_id)
      .single();

    const isOwner = comment.user_id === session.user.id;
    const isDm = campaign?.dm_id === session.user.id;

    if (!isOwner && !isDm) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase.from("comments").delete().eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
