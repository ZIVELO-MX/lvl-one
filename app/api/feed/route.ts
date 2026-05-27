import { NextResponse } from "next/server";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 50);

    const { data: following } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", session.user.id);

    const followingIds = following?.map(f => f.following_id) || [];
    followingIds.push(session.user.id);

    let query = supabase
      .from("activity_feed")
      .select("*")
      .in("user_id", followingIds)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const nextCursor = data && data.length === limit ? data[data.length - 1].created_at : null;

    return NextResponse.json({
      events: data || [],
      nextCursor,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
