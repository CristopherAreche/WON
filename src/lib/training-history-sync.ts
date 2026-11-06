import { readHistory, readTrainingEntries, updateSessionHistory, type TrainingEntry } from "./training-history";

async function requestProgress(method: "GET" | "POST" | "DELETE", entries?: TrainingEntry[], id?: string) {
  const response = await fetch(`/api/progress${id ? `/${encodeURIComponent(id)}` : ""}`, {
    method, credentials: "same-origin", cache: "no-store",
    ...(entries ? { headers: { "content-type": "application/json" }, body: JSON.stringify({ entries }) } : {}),
  });
  if (!response.ok) throw new Error(response.status === 401
    ? "Your session expired. Sign in again to sync your progress."
    : "We couldn’t sync your progress. Your saved history is safe. Please try again.");
  return response.json();
}

export async function importBrowserHistory(planIds: string[]) {
  for (const planId of planIds) {
    const marker = `won_training_imported_v1_${planId}`;
    if (localStorage.getItem(marker)) continue;
    const entries = readTrainingEntries([planId]);
    for (let index = 0; index < entries.length; index += 100) {
      await requestProgress("POST", entries.slice(index, index + 100));
    }
    // Only mark imported after the server confirms every batch. Repeated
    // requests use the same IDs and cannot duplicate sessions.
    localStorage.setItem(marker, "true");
  }
}

interface PendingChange {
  added: TrainingEntry[];
  removed: string[];
  afterRaw: string;
}

async function flushPendingChange(planId: string) {
  const pendingKey = `won_training_pending_v1_${planId}`;
  const raw = localStorage.getItem(pendingKey);
  if (!raw) return;
  const pending = JSON.parse(raw) as PendingChange;
  if (pending.added.length) await requestProgress("POST", pending.added);
  for (const id of pending.removed) await requestProgress("DELETE", undefined, id);
  localStorage.setItem(`won_training_history_v1_${planId}`, pending.afterRaw);
  localStorage.removeItem(pendingKey);
}

export async function loadAccountTrainingHistory(planIds: string[]): Promise<TrainingEntry[]> {
  await importBrowserHistory(planIds);
  for (const planId of planIds) await flushPendingChange(planId);
  const payload = await requestProgress("GET");
  return payload.entries;
}

export async function saveSessionToAccount(input: Omit<TrainingEntry, "id" | "completedAt">, complete: boolean) {
  await importBrowserHistory([input.planId]);
  await flushPendingChange(input.planId);
  const storageKey = `won_training_history_v1_${input.planId}`;
  const previousRaw = localStorage.getItem(storageKey);
  const before = readHistory(input.planId);
  updateSessionHistory(input, complete);
  const after = readHistory(input.planId);
  const added = after.entries.filter((entry) => !before.entries.some((old) => old.id === entry.id));
  const removed = before.entries.filter((entry) => !after.entries.some((next) => next.id === entry.id)).map((entry) => entry.id);
  const afterRaw = JSON.stringify(after);
  if (!added.length && !removed.length) return;
  // Keep the same IDs across timeouts, retries and reloads. A lost response
  // must never turn one workout into two records on the server.
  if (previousRaw === null) localStorage.removeItem(storageKey);
  else localStorage.setItem(storageKey, previousRaw);
  localStorage.setItem(`won_training_pending_v1_${input.planId}`, JSON.stringify({ added, removed, afterRaw }));
  await flushPendingChange(input.planId);
}
