export type SessionStatus = "red" | "yellow" | "green";
export type PlanProgressState = "start" | "continue" | "completed";
export type CompletionMap = Record<string, boolean>;

export interface SessionLike {
  items?: unknown[] | null;
}

export interface PlanProgressSummary {
  totalExercises: number;
  completedExercises: number;
  pendingExercises: number;
  sessionStatuses: SessionStatus[];
  planState: PlanProgressState;
}

export function getWorkoutProgressStorageKey(planId: string) {
  return `workout_progress_${planId}`;
}

export function getWorkoutCompletedAtStorageKey(planId: string) {
  return `workout_completed_at_${planId}`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function readCompletionMap(planId: string): CompletionMap {
  if (!isBrowser()) return {};

  try {
    const raw = localStorage.getItem(getWorkoutProgressStorageKey(planId));
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};

    const normalized: CompletionMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "boolean") {
        normalized[key] = value;
      }
    }
    return normalized;
  } catch {
    return {};
  }
}

export function writeCompletionMap(planId: string, completionMap: CompletionMap) {
  if (!isBrowser()) return;

  const hasEntries = Object.keys(completionMap).length > 0;
  if (!hasEntries) {
    localStorage.removeItem(getWorkoutProgressStorageKey(planId));
    return;
  }

  localStorage.setItem(getWorkoutProgressStorageKey(planId), JSON.stringify(completionMap));
}

export function readWorkoutCompletedAt(planId: string): string | null {
  if (!isBrowser()) return null;

  const value = localStorage.getItem(getWorkoutCompletedAtStorageKey(planId));
  if (!value) return null;

  return Number.isNaN(Date.parse(value)) ? null : value;
}

export function setWorkoutCompletedAt(planId: string, isoTimestamp: string) {
  if (!isBrowser()) return;
  localStorage.setItem(getWorkoutCompletedAtStorageKey(planId), isoTimestamp);
}

export function clearWorkoutCompletedAt(planId: string) {
  if (!isBrowser()) return;
  localStorage.removeItem(getWorkoutCompletedAtStorageKey(planId));
}

export function getSessionExerciseCount(session: SessionLike): number {
  return Array.isArray(session.items) ? session.items.length : 0;
}

export function countTotalExercises(sessions: SessionLike[]): number {
  return sessions.reduce((acc, session) => acc + getSessionExerciseCount(session), 0);
}

export function countCompletedExercises(sessions: SessionLike[], completionMap: CompletionMap): number {
  let completed = 0;

  sessions.forEach((session, sessionIndex) => {
    const exerciseCount = getSessionExerciseCount(session);
    for (let exerciseIndex = 0; exerciseIndex < exerciseCount; exerciseIndex += 1) {
      if (completionMap[`${sessionIndex}-${exerciseIndex}`]) {
        completed += 1;
      }
    }
  });

  return completed;
}

export function computeSessionStatuses(
  sessions: SessionLike[],
  completionMap: CompletionMap
): SessionStatus[] {
  return sessions.map((session, sessionIndex) => {
    const totalExercises = getSessionExerciseCount(session);
    if (totalExercises === 0) return "red";

    let completedCount = 0;
    for (let exerciseIndex = 0; exerciseIndex < totalExercises; exerciseIndex += 1) {
      if (completionMap[`${sessionIndex}-${exerciseIndex}`]) {
        completedCount += 1;
      }
    }

    if (completedCount === 0) return "red";
    if (completedCount === totalExercises) return "green";
    return "yellow";
  });
}

export function computePlanProgressState(sessionStatuses: SessionStatus[]): PlanProgressState {
  if (sessionStatuses.length > 0 && sessionStatuses.every((status) => status === "green")) {
    return "completed";
  }

  if (sessionStatuses.some((status) => status === "yellow" || status === "green")) {
    return "continue";
  }

  return "start";
}

export function isPlanCompleted(sessions: SessionLike[], completionMap: CompletionMap) {
  const sessionStatuses = computeSessionStatuses(sessions, completionMap);
  return (
    sessionStatuses.length > 0 &&
    sessionStatuses.every((status) => status === "green")
  );
}

export function computePlanProgressSummary(
  sessions: SessionLike[],
  completionMap: CompletionMap
): PlanProgressSummary {
  const totalExercises = countTotalExercises(sessions);
  const completedExercises = countCompletedExercises(sessions, completionMap);
  const pendingExercises = Math.max(totalExercises - completedExercises, 0);
  const sessionStatuses = computeSessionStatuses(sessions, completionMap);

  return {
    totalExercises,
    completedExercises,
    pendingExercises,
    sessionStatuses,
    planState: computePlanProgressState(sessionStatuses),
  };
}
