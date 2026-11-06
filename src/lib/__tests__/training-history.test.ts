import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { entriesForWeek, localDateKey, readTrainingEntries, startOfWeek, startSessionAgain, updateSessionHistory } from "../training-history";

const session = { planId: "plan-1", sessionIndex: 0, title: "Full body", exercises: 4 };

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
  });
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 6, 15));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("training history", () => {
  it("records completion only once, including after reading again", () => {
    updateSessionHistory(session, true);
    expect(readTrainingEntries([session.planId])).toHaveLength(1);
    updateSessionHistory(session, true);
    expect(readTrainingEntries([session.planId])).toHaveLength(1);
  });

  it("does not log partial sessions and removes an undone completion", () => {
    updateSessionHistory(session, false);
    expect(readTrainingEntries([session.planId])).toHaveLength(0);
    updateSessionHistory(session, true);
    updateSessionHistory(session, false);
    expect(readTrainingEntries([session.planId])).toHaveLength(0);
  });

  it("preserves a completed workout when starting and completing it again", () => {
    updateSessionHistory(session, true);
    startSessionAgain(session.planId, 0);
    updateSessionHistory(session, false);
    expect(readTrainingEntries([session.planId])).toHaveLength(1);
    vi.advanceTimersByTime(86400000);
    updateSessionHistory(session, true);
    const entries = readTrainingEntries([session.planId]);
    expect(entries).toHaveLength(2);
    expect(entries[0].completedAt > entries[1].completedAt).toBe(true);
  });

  it("only reads plans belonging to the current user", () => {
    updateSessionHistory(session, true);
    expect(readTrainingEntries(["another-plan"])).toHaveLength(0);
  });

  it("handles corrupt browser data", () => {
    localStorage.setItem("won_training_history_v1_plan-1", "broken");
    expect(readTrainingEntries([session.planId])).toEqual([]);
  });

  it("uses Monday through Sunday and excludes the following Monday", () => {
    const sunday = new Date(2026, 10, 8, 23, 59);
    expect(localDateKey(startOfWeek(sunday))).toBe("2026-11-02");
    const dates = [new Date(2026, 10, 1, 23, 59), new Date(2026, 10, 2), sunday, new Date(2026, 10, 9)];
    const entries = dates.map((date, index) => ({ ...session, id: String(index), completedAt: date.toISOString() }));
    expect(entriesForWeek(entries, sunday).map((entry) => entry.id)).toEqual(["1", "2"]);
  });
});
