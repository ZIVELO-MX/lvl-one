import { NextResponse } from "next/server";
import { requireAuth } from "./supabaseServer";

export async function withAuth(handler: (userId: string, req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try {
      const session = await requireAuth();
      return handler(session.user.id, req);
    } catch (e) {
      return NextResponse.json(
        { error: (e as Error).message === "Unauthorized" ? "Unauthorized" : "Internal error" },
        { status: (e as Error).message === "Unauthorized" ? 401 : 500 },
      );
    }
  };
}
