import { NextResponse } from "next/server";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";
import { pick } from "@/lib/api-helpers";

const GROUP_EDIT_FIELDS = ["name", "description", "is_public", "max_players"] as const;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { id } = await params;

    const { data: group, error } = await supabase
      .from("groups")
      .select("*, members:group_members(user_id, role, joined_at, profile:profiles(id, username, avatar_url))")
      .eq("id", id)
      .single();

    if (!group || error) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!group.is_public) {
      const members = group.members as Array<{ user_id: string }>;
      const allowed = group.dm_id === session.user.id || members.some(m => m.user_id === session.user.id);
      if (!allowed) return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...group,
      memberCount: (group.members as unknown[])?.length || 0,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { id } = await params;
    const body = await req.json();

    const { data: group } = await supabase
      .from("groups")
      .select("dm_id")
      .eq("id", id)
      .single();

    if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (group.dm_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("groups")
      .update(pick(body, GROUP_EDIT_FIELDS))
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { id } = await params;

    const { data: group } = await supabase
      .from("groups")
      .select("dm_id")
      .eq("id", id)
      .single();

    if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (group.dm_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase.from("groups").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
