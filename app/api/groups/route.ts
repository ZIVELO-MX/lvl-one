import { NextResponse } from "next/server";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";
import { pick } from "@/lib/api-helpers";

const GROUP_FIELDS = ["name", "description", "is_public", "max_players"] as const;

export async function GET(req: Request) {
  try {
    await requireAuth();
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("groups")
      .select("*, members:group_members(count)")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });

    const groups = (data || []).map((g: Record<string, unknown>) => ({
      ...g,
      memberCount: (g.members as { count: number }[])?.[0]?.count || 0,
      members: undefined,
    }));

    return NextResponse.json(groups);
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
      .from("groups")
      .insert({ ...pick(body, GROUP_FIELDS), dm_id: session.user.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });

    await supabase
      .from("group_members")
      .insert({ group_id: data.id, user_id: session.user.id, role: "dm" });

    const { data: withCount } = await supabase
      .from("groups")
      .select("*, members:group_members(count)")
      .eq("id", data.id)
      .single();

    return NextResponse.json({
      ...withCount,
      memberCount: (withCount?.members as { count: number }[])?.[0]?.count || 1,
      members: undefined,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
