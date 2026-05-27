import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/characters/route";
import { createServerSupabase, requireAuth } from "@/lib/supabaseServer";

vi.mock("@/lib/supabaseServer", () => ({
  createServerSupabase: vi.fn(),
  requireAuth: vi.fn(),
}));

const mockedCreateServerSupabase = vi.mocked(createServerSupabase);
const mockedRequireAuth = vi.mocked(requireAuth);

const characterRow = {
  id: "char-1",
  user_id: "user-1",
  name: "Ilyra",
  updated_at: "2026-05-25T13:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedRequireAuth.mockResolvedValue({ user: { id: "user-1" } } as Awaited<ReturnType<typeof requireAuth>>);
});

describe("/api/characters", () => {
  it("returns authenticated user's characters", async () => {
    const order = vi.fn().mockResolvedValue({ data: [characterRow], error: null });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));

    mockedCreateServerSupabase.mockResolvedValue({ from } as unknown as Awaited<ReturnType<typeof createServerSupabase>>);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual([characterRow]);
    expect(from).toHaveBeenCalledWith("characters");
    expect(eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(order).toHaveBeenCalledWith("updated_at", { ascending: false });
  });

  it("inserts characters with the authenticated user_id", async () => {
    const single = vi.fn().mockResolvedValue({ data: characterRow, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn(() => ({ insert }));
    const request = new Request("http://localhost/api/characters", {
      method: "POST",
      body: JSON.stringify({ name: "Ilyra" }),
    });

    mockedCreateServerSupabase.mockResolvedValue({ from } as unknown as Awaited<ReturnType<typeof createServerSupabase>>);

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json).toEqual(characterRow);
    expect(insert).toHaveBeenCalledWith({ name: "Ilyra", user_id: "user-1" });
  });

  it("returns 401 when no authenticated session exists", async () => {
    mockedRequireAuth.mockRejectedValue(new Error("Unauthorized"));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });
  });
});
