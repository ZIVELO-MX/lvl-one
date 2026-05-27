import { NextResponse } from "next/server";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { id } = await params;

    const { data: group } = await supabase
      .from("groups")
      .select("dm_id, max_players")
      .eq("id", id)
      .single();

    if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { count } = await supabase
      .from("group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", id);

    if (count && count >= group.max_players) {
      return NextResponse.json({ error: "Group is full" }, { status: 400 });
    }

    const { error } = await supabase
      .from("group_members")
      .insert({ group_id: id, user_id: session.user.id, role: "player" });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Already a member" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const targetUserId = body.userId || session.user.id;

    if (targetUserId !== session.user.id) {
      const { data: group } = await supabase
        .from("groups")
        .select("dm_id")
        .eq("id", id)
        .single();

      if (!group || group.dm_id !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", id)
      .eq("user_id", targetUserId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
