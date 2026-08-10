import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkUsername } from "@/lib/username";
import { createClient } from "@/lib/supabaseClient";

vi.mock("@/lib/supabaseClient", () => ({
  createClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);

function mockRpc(result: { data: unknown; error: unknown }) {
  const rpc = vi.fn().mockResolvedValue(result);
  mockedCreateClient.mockReturnValue({ rpc } as unknown as ReturnType<typeof createClient>);
  return rpc;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkUsername", () => {
  it("rejects names shorter than the minimum without hitting the network", async () => {
    const rpc = mockRpc({ data: true, error: null });
    expect(await checkUsername(" a ")).toMatch(/al menos 2/);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects names over the maximum length", async () => {
    mockRpc({ data: true, error: null });
    expect(await checkUsername("x".repeat(51))).toMatch(/demasiado largo/i);
  });

  it("accepts a free name and asks the RPC with the trimmed value", async () => {
    const rpc = mockRpc({ data: true, error: null });
    expect(await checkUsername("  Kael  ")).toBeNull();
    expect(rpc).toHaveBeenCalledWith("username_available", { name: "Kael" });
  });

  it("reports a taken name", async () => {
    mockRpc({ data: false, error: null });
    expect(await checkUsername("Kael")).toMatch(/ya está en uso/);
  });

  it("lets the name through when the check itself fails — the unique index is the real guard", async () => {
    mockRpc({ data: null, error: { message: "network" } });
    expect(await checkUsername("Kael")).toBeNull();
  });
});
