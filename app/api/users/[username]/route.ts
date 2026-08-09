import { NextResponse } from "next/server";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const session = await requireAuth();
    const supabase = await createServerSupabase();
    const { username } = await params;

    // Sin email: es la única columna de profiles que no puede leer otro usuario.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, plan, avatar_url, is_public, created_at")
      .eq("username", username)
      .single();

    if (!profile || profileError) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // El interruptor "perfil público" de /account tiene que valer de algo.
    if (!profile.is_public && profile.id !== session.user.id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: characters } = await supabase
      .from("characters")
      .select("id, name, race_id, class_id, level, is_public")
      .eq("user_id", profile.id)
      .eq("is_public", true)
      .order("updated_at", { ascending: false });

    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, name, setting, cover_color, status, is_public")
      .eq("dm_id", profile.id)
      .eq("is_public", true)
      .order("updated_at", { ascending: false });

    const { count: followers } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profile.id);

    const { count: following } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profile.id);

    const { data: isFollowing } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", session.user.id)
      .eq("following_id", profile.id)
      .single();

    return NextResponse.json({
      user: {
        id: profile.id,
        username: profile.username,
        plan: profile.plan,
        avatarUrl: profile.avatar_url,
        createdAt: profile.created_at,
      },
      characters: characters || [],
      campaigns: campaigns || [],
      followers: followers || 0,
      following: following || 0,
      isFollowing: !!isFollowing,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
