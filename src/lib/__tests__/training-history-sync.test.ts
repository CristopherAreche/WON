import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadAccountTrainingHistory, saveSessionToAccount } from "../training-history-sync";
import { updateSessionHistory, type TrainingEntry } from "../training-history";

const input = { planId: "plan-1", sessionIndex: 0, title: "Strength", exercises: 3 };
let store: Map<string, string>;
let server: Map<string, TrainingEntry>;
let loseNextPostResponse: boolean;

beforeEach(() => {
  store = new Map(); server = new Map(); loseNextPostResponse = false;
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
  });
  vi.stubGlobal("fetch", vi.fn(async (url: string, options: RequestInit) => {
    if (options.method === "POST") {
      const { entries } = JSON.parse(options.body as string) as { entries: TrainingEntry[] };
      entries.forEach((entry) => { if (!server.has(entry.id)) server.set(entry.id, entry); });
      if (loseNextPostResponse) { loseNextPostResponse = false; throw new Error("Connection lost after save"); }
    }
    if (options.method === "DELETE") server.delete(url.split("/").pop()!);
    return new Response(JSON.stringify(options.method === "GET" ? { entries: [...server.values()] } : { ok: true }), { status: 200 });
  }));
});
afterEach(() => vi.unstubAllGlobals());

describe("account training history sync", () => {
  it("loads the same account history with an empty browser on another device", async () => {
    await saveSessionToAccount(input, true);
    const firstDevice = await loadAccountTrainingHistory([input.planId]);
    store.clear();
    expect(await loadAccountTrainingHistory([input.planId])).toEqual(firstDevice);
    expect(server.size).toBe(1);
  });
  it("imports old browser records only once and preserves their dates", async () => {
    updateSessionHistory(input, true);
    const imported = await loadAccountTrainingHistory([input.planId]);
    expect(imported).toHaveLength(1);
    await saveSessionToAccount(input, false);
    expect(await loadAccountTrainingHistory([input.planId])).toHaveLength(0);
    expect(server.size).toBe(0);
  });
  it("retries a lost save response with the same record ID", async () => {
    loseNextPostResponse = true;
    await expect(saveSessionToAccount(input, true)).rejects.toThrow("Connection lost");
    expect(server.size).toBe(1);
    await saveSessionToAccount(input, true);
    expect(server.size).toBe(1);
    expect(store.has("won_training_pending_v1_plan-1")).toBe(false);
  });
  it("recovers a pending save after reloading without duplicating it", async () => {
    loseNextPostResponse = true;
    await expect(saveSessionToAccount(input, true)).rejects.toThrow();
    expect(await loadAccountTrainingHistory([input.planId])).toHaveLength(1);
    expect(server.size).toBe(1);
  });
  it("does not mark a failed import as complete", async () => {
    updateSessionHistory(input, true);
    vi.mocked(fetch).mockResolvedValueOnce(new Response("{}", { status: 500 }));
    await expect(loadAccountTrainingHistory([input.planId])).rejects.toThrow("couldn’t sync");
    expect(store.has("won_training_imported_v1_plan-1")).toBe(false);
    expect(await loadAccountTrainingHistory([input.planId])).toHaveLength(1);
  });
  it("does not erase a pending undo if the server is unavailable", async () => {
    await saveSessionToAccount(input, true);
    vi.mocked(fetch).mockResolvedValueOnce(new Response("{}", { status: 503 }));
    await expect(saveSessionToAccount(input, false)).rejects.toThrow();
    expect(server.size).toBe(1);
    await saveSessionToAccount(input, false);
    expect(server.size).toBe(0);
  });
});
