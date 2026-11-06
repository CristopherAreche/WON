"use client";
import Link from "next/link";
import { useState } from "react";

const sessions = [
  { day: "Monday", title: "Full-body strength", minutes: 45, exercises: [{ name: "Goblet squat", sets: "3 × 10", equipment: "Dumbbell" }, { name: "Dumbbell row", sets: "3 × 10", equipment: "Dumbbell" }, { name: "Push-up", sets: "3 × 8", equipment: "Bodyweight" }] },
  { day: "Wednesday", title: "Strength & control", minutes: 40, exercises: [{ name: "Reverse lunge", sets: "3 × 8", equipment: "Bodyweight" }, { name: "Dumbbell shoulder press", sets: "3 × 10", equipment: "Dumbbells" }, { name: "Dead bug", sets: "3 × 8", equipment: "Bodyweight" }] },
  { day: "Friday", title: "Full-body conditioning", minutes: 45, exercises: [{ name: "Bodyweight squat", sets: "3 × 12", equipment: "Bodyweight" }, { name: "Incline push-up", sets: "3 × 10", equipment: "Bodyweight" }, { name: "Glute bridge", sets: "3 × 12", equipment: "Bodyweight" }] },
];

export default function DemoPage() {
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const session = sessions[active];
  const total = sessions.reduce((sum, item) => sum + item.exercises.length, 0);
  const percent = Math.round(completed.length / total * 100);
  function toggle(id: string) { setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }

  return <div className="min-h-dvh bg-background-light text-slate-900">
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 sm:px-8"><Link href="/" className="text-xl font-bold">WON</Link><Link href="/auth/signup" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Create your own plan</Link></header>
    <main className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
      <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900"><strong>Interactive demo.</strong> This is a fixed example plan, not an AI-generated or personalized recommendation. Changes stay on this page and reset when you reload. No account or personal information is needed.</div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">A week of training, at a glance.</h1><p className="mt-3 text-slate-600">Choose a session and mark exercises complete to try the workout tracker.</p></div><button type="button" onClick={() => {setActive(0);setCompleted([]);}} className="min-h-11 rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold hover:bg-white">Reset demo</button></div>
      <div className="grid min-w-0 gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Example preferences</h2><dl className="mt-4 space-y-3 text-sm">{[['Goal','General strength'],['Schedule','3 days per week'],['Equipment','Dumbbells & bodyweight']].map(([name,value])=><div key={name}><dt className="text-slate-500">{name}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}</dl></section>
          <section className="rounded-2xl bg-accent-seafoam p-5"><h2 className="font-semibold">Weekly completion</h2><p aria-live="polite" className="mt-3 text-3xl font-bold">{percent}%</p><p className="mt-1 text-sm text-slate-600">{completed.length} of {total} exercises</p><div role="progressbar" aria-label="Weekly exercise completion" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed.length} className="mt-4 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-primary transition-all" style={{width: `${percent}%`}} /></div></section>
        </aside>
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-7">
          <div role="group" aria-label="Choose a workout session" className="grid grid-cols-3 gap-2">{sessions.map((item,index)=><button key={item.day} type="button" aria-pressed={active===index} onClick={()=>setActive(index)} className={`min-h-12 rounded-xl px-2 py-3 text-sm font-semibold ${active===index?'bg-primary text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item.day}</button>)}</div>
          <div className="my-7 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-2xl font-bold">{session.title}</h2><p className="mt-2 text-sm text-slate-500">{session.day} · {session.exercises.length} exercises</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-primary">{session.minutes} min</span></div>
          <ul className="divide-y divide-slate-100">{session.exercises.map((exercise,index)=>{const id=`${active}-${index}`;const checked=completed.includes(id);return <li key={id}><label className="flex cursor-pointer items-center gap-4 py-5"><input type="checkbox" checked={checked} onChange={()=>toggle(id)} className="h-5 w-5 shrink-0 accent-primary"/><span className="min-w-0 flex-1"><span className={`block font-semibold ${checked?'text-slate-400 line-through':'text-slate-900'}`}>{exercise.name}</span><span className="mt-1 block text-sm text-slate-500">{exercise.sets} · {exercise.equipment}</span></span><span className="text-xs font-medium text-slate-500">{checked?'Done':'To do'}</span></label></li>})}</ul>
          <p className="mt-6 border-t border-slate-100 pt-5 text-sm leading-relaxed text-slate-500">Ready for a plan based on your preferences? Create an account to set your goals and generate a workout.</p><Link href="/auth/signup" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Get started</Link>
        </section>
      </div>
    </main>
  </div>;
}
