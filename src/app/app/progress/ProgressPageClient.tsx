"use client";

import Link from "next/link";
import { loadAccountTrainingHistory } from "@/lib/training-history-sync";
import { useEffect, useState } from "react";
import {
  entriesForWeek,
  localDateKey,
  startOfWeek,
  type TrainingEntry,
} from "@/lib/training-history";

export interface ProgressPlan {
  id: string;
  title: string;
  daysPerWeek?: number;
  createdAt: string;
}

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const shortDate = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fullDate = (date: Date) => date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

function Arrow({ direction }: { direction: "left" | "right" }) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 6 6 6-6 6"} /></svg>;
}

export default function ProgressPageClient({ plans, weeklyGoal, demo = false }: { plans: ProgressPlan[]; weeklyGoal: number | null; demo?: boolean }) {
  const [syncError, setSyncError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [entries, setEntries] = useState<TrainingEntry[]>([]);
  const [now, setNow] = useState<Date | null>(null);
  const [week, setWeek] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [historyLimit, setHistoryLimit] = useState(8);

  useEffect(() => {
    let cancelled = false;
    let refreshing = false;
    const refresh = async () => {
      if (refreshing) return;
      refreshing = true;
      const today = new Date();
      setNow(today);
      setWeek((value) => value || startOfWeek(today));
      setMonth((value) => value || new Date(today.getFullYear(), today.getMonth(), 1));
      if (demo) {
        setEntries([0, 2, 7, 9, 12, 16].map((daysAgo, index) => {
          const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo, 9);
          return { id: `example-${index}`, planId: "example", sessionIndex: index % 2, title: index % 2 ? "Lower body & core" : "Full body strength", exercises: index % 2 ? 5 : 6, completedAt: date.toISOString() };
        }));
      } else {
        try {
          const saved = await loadAccountTrainingHistory(plans.map((plan) => plan.id));
          if (!cancelled) { setEntries(saved); setSyncError(null); }
        } catch (error) {
          if (!cancelled) setSyncError(error instanceof Error ? error.message : "Unable to load your progress.");
        }
      }
      if (!cancelled) setHistoryLoaded(true);
      refreshing = false;

    };
    const onVisibility = () => { if (document.visibilityState === "visible") refresh(); };
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [plans, demo, refreshKey]);

  if (syncError) return <div role="alert" className="my-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900"><h1 className="text-xl font-semibold">Progress couldn’t sync</h1><p className="mt-3 text-sm">{syncError}</p><button onClick={() => { setSyncError(null); setHistoryLoaded(false); setRefreshKey((key) => key + 1); }} className="mt-4 rounded-full bg-indigo-600 px-5 py-3 text-sm font-medium text-white">Try again</button></div>;

  if (!historyLoaded || !now || !week || !month) return <div role="status" className="py-20 text-center text-slate-500">Loading your progress…</div>;

  const latestPlan = [...plans].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const rawGoal = weeklyGoal ?? latestPlan?.daysPerWeek;
  const goal = rawGoal && rawGoal > 0 ? Math.min(7, Math.round(rawGoal)) : null;
  const weekEntries = entriesForWeek(entries, week);
  const remaining = goal ? Math.max(0, goal - weekEntries.length) : null;
  const percent = goal ? Math.min(100, Math.round(weekEntries.length / goal * 100)) : 0;
  const daysTrained = new Set(weekEntries.map((entry) => localDateKey(new Date(entry.completedAt)))).size;
  const endOfWeek = new Date(week); endOfWeek.setDate(week.getDate() + 6);
  const isCurrentWeek = localDateKey(week) === localDateKey(startOfWeek(now));
  const monthDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (month.getDay() + 6) % 7;
  const activityByDay = new Map<string, number>();
  entries.forEach((entry) => {
    const date = localDateKey(new Date(entry.completedAt));
    activityByDay.set(date, (activityByDay.get(date) || 0) + 1);
  });
  const history = selectedDay ? entries.filter((entry) => localDateKey(new Date(entry.completedAt)) === selectedDay) : entries;
  const navClass = "h-10 w-10 shrink-0 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="space-y-8 py-5 text-slate-900 sm:py-8">
      {demo && <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"><strong>Preview with sample data.</strong> These sessions are fictional and are never saved to your account. <Link href="/app/progress" className="ml-1 underline underline-offset-2">Open my progress</Link></div>}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your consistency, in focus.</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">Every completed session is a step forward. See how your training adds up, one week at a time.</p>
        </div>
        <Link href="/app/home" className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700">View my workouts</Link>
      </header>

      <section aria-labelledby="weekly-title" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-7">
          <div>
            <h2 id="weekly-title" className="text-lg font-semibold">{isCurrentWeek ? "This week" : "Weekly summary"}</h2>
            <p className="mt-1 text-sm text-slate-500">{shortDate(week)} – {shortDate(endOfWeek)}, {endOfWeek.getFullYear()}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isCurrentWeek && <button onClick={() => setWeek(startOfWeek(now))} className="mr-1 text-sm font-medium text-indigo-700">This week</button>}
            <button aria-label="Previous week" className={navClass} onClick={() => { const date = new Date(week); date.setDate(date.getDate() - 7); setWeek(date); }}><Arrow direction="left" /></button>
            <button aria-label="Next week" disabled={isCurrentWeek} className={navClass} onClick={() => { const date = new Date(week); date.setDate(date.getDate() + 7); setWeek(date); }}><Arrow direction="right" /></button>
          </div>
        </div>
        <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
          <div>
            <p className="text-sm text-slate-500">Sessions completed</p>
            <p className="mt-2 flex items-baseline gap-2"><span className="text-6xl font-semibold tracking-tight">{weekEntries.length}</span><span className="text-lg text-slate-400">{goal ? `/ ${goal} goal` : "this week"}</span></p>
            {goal && <div role="progressbar" aria-label="Weekly session goal" aria-valuenow={Math.min(weekEntries.length, goal)} aria-valuemin={0} aria-valuemax={goal} className="mt-5 h-2.5 overflow-hidden rounded-full bg-indigo-50"><div className="h-full rounded-full bg-indigo-600 transition-[width]" style={{ width: `${percent}%` }} /></div>}
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{remaining === 0 ? "Weekly goal reached. Give yourself credit for showing up." : remaining !== null ? `${remaining} more ${remaining === 1 ? "session" : "sessions"} to reach your weekly goal.` : "Set your training frequency in your profile to see a weekly goal."}</p>
            <p className="mt-2 text-xs text-slate-400">{goal ? "Compared with your current training frequency." : ""}</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="grid grid-cols-7 gap-1 sm:gap-3">
              {weekdays.map((label, index) => {
                const date = new Date(week); date.setDate(date.getDate() + index);
                const dateKey = localDateKey(date);
                const count = activityByDay.get(dateKey) || 0;
                const today = dateKey === localDateKey(now);
                return <div key={label} className="text-center"><span className="text-xs text-slate-500">{label}</span><div aria-label={`${fullDate(date)}: ${count} completed sessions`} className={`mx-auto mt-3 flex aspect-square max-w-14 items-center justify-center rounded-full text-sm font-semibold ${count ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-500"} ${today ? "ring-2 ring-indigo-300 ring-offset-2" : ""}`}>{count ? <span aria-hidden="true">✓</span> : date.getDate()}</div>{today && <span className="mt-2 block text-[10px] font-medium text-indigo-600">Today</span>}</div>;
              })}
            </div>
            <p className="mt-5 text-center text-sm text-slate-500">Trained on <strong className="font-semibold text-slate-700">{daysTrained} {daysTrained === 1 ? "day" : "days"}</strong> this week</p>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-[0.95fr_1.25fr]">
        <section aria-labelledby="calendar-title" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 id="calendar-title" className="text-lg font-semibold">Training calendar</h2>
          <p className="mt-1 text-sm text-slate-500">Select a day to see its sessions.</p>
          <div className="my-5 flex items-center justify-between gap-2">
            <button aria-label="Previous month" className={navClass} onClick={() => { setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)); setSelectedDay(null); }}><Arrow direction="left" /></button>
            <h3 className="text-sm font-semibold">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
            <button aria-label="Next month" disabled={month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth()} className={navClass} onClick={() => { setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)); setSelectedDay(null); }}><Arrow direction="right" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdays.map((day) => <span key={day} className="pb-2 text-xs text-slate-400">{day.slice(0, 1)}</span>)}
            {Array.from({ length: offset }, (_, index) => <span key={`blank-${index}`} />)}
            {Array.from({ length: monthDays }, (_, index) => {
              const date = new Date(month.getFullYear(), month.getMonth(), index + 1);
              const dateKey = localDateKey(date);
              const count = activityByDay.get(dateKey) || 0;
              const today = dateKey === localDateKey(now);
              return <button key={dateKey} type="button" aria-label={`${fullDate(date)}: ${count} completed sessions${today ? ", today" : ""}`} aria-pressed={selectedDay === dateKey} disabled={dateKey > localDateKey(now)} onClick={() => { setSelectedDay(selectedDay === dateKey ? null : dateKey); setHistoryLimit(8); }} className={`relative flex min-h-10 flex-col items-center justify-center rounded-xl py-2 text-sm disabled:opacity-30 ${selectedDay === dateKey ? "bg-indigo-600 text-white" : count ? "bg-indigo-50 font-semibold text-indigo-700 hover:bg-indigo-100" : "text-slate-600 hover:bg-slate-50"} ${today ? "ring-1 ring-inset ring-indigo-400" : ""}`}><span>{index + 1}</span><span aria-hidden="true" className={`mt-1 h-1 w-1 rounded-full ${count ? selectedDay === dateKey ? "bg-white" : "bg-indigo-600" : "bg-transparent"}`} /></button>;
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-600" />Completed session</span><span className="flex items-center gap-2"><span className="h-3 w-3 rounded border border-indigo-400" />Today</span></div>
        </section>

        <section aria-labelledby="history-title" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 id="history-title" className="text-lg font-semibold">Session history</h2><p className="mt-1 text-sm text-slate-500">{selectedDay ? fullDate(new Date(`${selectedDay}T12:00:00`)) : `${entries.length} completed ${entries.length === 1 ? "session" : "sessions"} recorded`}</p></div>
            {selectedDay && <button onClick={() => setSelectedDay(null)} className="text-sm font-medium text-indigo-700">Show all</button>}
          </div>
          <div aria-live="polite" className="mt-5">
            {history.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center"><span aria-hidden="true" className="material-icons-round text-3xl text-indigo-400">event_available</span><h3 className="mt-3 font-semibold">{selectedDay ? "No sessions on this day" : "Your first session starts the story"}</h3><p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">{selectedDay ? "Choose another date or show all sessions to explore your history." : "Complete every exercise in a session to record it here. Small steps, repeated, build consistency."}</p><Link href="/app/home" className="mt-5 inline-block text-sm font-semibold text-indigo-700">Go to my workouts</Link></div> : <ul className="divide-y divide-slate-200 border-y border-slate-200">{history.slice(0, historyLimit).map((entry) => <li key={entry.id} className="flex items-start gap-3 py-5"><span aria-hidden="true" className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">✓</span><div className="min-w-0 flex-1"><Link href={demo ? "/demo" : entry.planId && plans.some((plan) => plan.id === entry.planId) ? `/app/workout/${entry.planId}?day=${entry.sessionIndex}` : "/app/home"} className="break-words font-medium hover:text-indigo-700 hover:underline">{entry.title}</Link><p className="mt-1 text-xs leading-relaxed text-slate-500">{new Date(entry.completedAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} · {entry.exercises} exercises</p><span className="mt-2 inline-block text-xs text-emerald-700">Completed</span></div></li>)}</ul>}
            {history.length > historyLimit && <button onClick={() => setHistoryLimit((limit) => limit + 8)} className="mt-4 w-full rounded-full border border-slate-200 px-4 py-3 text-sm font-medium hover:bg-white">Show more sessions</button>}
          </div>
        </section>
      </div>
      <p className="max-w-2xl text-xs leading-relaxed text-slate-500">{demo ? "You are exploring sample activity. Your personal history will appear after you complete sessions in WON." : <>History is saved to your account and syncs across devices. Earlier sessions saved in this browser are imported automatically. Sessions without a recorded completion date are not included.</>}</p>
    </div>
  );
}
