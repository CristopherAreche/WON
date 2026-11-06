export interface TrainingEntry {
  id: string;
  planId: string;
  sessionIndex: number;
  title: string;
  exercises: number;
  completedAt: string;
}

export interface TrainingHistory {
  entries: TrainingEntry[];
  active: Record<string, string>;
}

const key = (planId: string) => `won_training_history_v1_${planId}`;

export function readHistory(planId: string): TrainingHistory {
  try {
    const raw = JSON.parse(localStorage.getItem(key(planId)) || "null");
    if (!raw || !Array.isArray(raw.entries)) return { entries: [], active: {} };
    return {
      entries: raw.entries.filter((entry: TrainingEntry) =>
        entry && entry.planId === planId && typeof entry.id === "string" &&
        Number.isInteger(entry.sessionIndex) && typeof entry.title === "string" &&
        Number.isFinite(entry.exercises) && typeof entry.completedAt === "string" &&
        !Number.isNaN(Date.parse(entry.completedAt))),
      active: raw.active && typeof raw.active === "object" ? raw.active : {},
    };
  } catch {
    return { entries: [], active: {} };
  }
}

export function readTrainingEntries(planIds: string[]): TrainingEntry[] {
  return planIds.flatMap((id) => readHistory(id).entries)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

// Called only when a user changes an exercise, never to invent historical dates.
export function updateSessionHistory(input: Omit<TrainingEntry, "id" | "completedAt">, complete: boolean) {
  const history = readHistory(input.planId);
  const sessionKey = String(input.sessionIndex);
  const activeId = history.active[sessionKey];
  if (complete && !activeId) {
    const entry = { ...input, id: crypto.randomUUID(), completedAt: new Date().toISOString() };
    history.entries.push(entry);
    history.active[sessionKey] = entry.id;
  } else if (!complete && activeId) {
    // Unchecking a completed session is an undo, not another workout.
    history.entries = history.entries.filter((entry) => entry.id !== activeId);
    delete history.active[sessionKey];
  }
  localStorage.setItem(key(input.planId), JSON.stringify(history));
}

export function startSessionAgain(planId: string, sessionIndex: number) {
  const history = readHistory(planId);
  delete history.active[String(sessionIndex)];
  localStorage.setItem(key(planId), JSON.stringify(history));
}

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  return start;
}

export function entriesForWeek(entries: TrainingEntry[], date: Date): TrainingEntry[] {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return entries.filter((entry) => {
    const time = new Date(entry.completedAt).getTime();
    return time >= start.getTime() && time < end.getTime();
  });
}
