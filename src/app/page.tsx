import Link from "next/link";

const features = [
  { title: "A plan that fits your week", text: "Choose your goal, training experience, available days, and session length." },
  { title: "Train with what you have", text: "Set your equipment and training location before generating a workout plan." },
  { title: "Keep track of your work", text: "Review your sessions and mark exercises complete as you train." },
];

export default function Landing() {
  return (
    <div className="min-h-dvh bg-background-light text-slate-900">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <Link href="/" aria-label="WON home" className="flex items-center gap-2 text-xl font-bold"><span aria-hidden="true" className="material-symbols-outlined text-primary">fitness_center</span>WON</Link>
        <Link href="/auth/login" className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-white">Sign in</Link>
      </header>
      <main>
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-10 sm:px-8 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div className="min-w-0">
            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Your next workout starts with a plan.</h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">Build a workout routine around your goals, your schedule, and the equipment you have. Keep your sessions and progress in one place.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth/signup" className="rounded-full bg-primary px-6 py-3.5 font-semibold text-white hover:bg-blue-700">Create your plan</Link>
              <Link href="/demo" className="rounded-full border border-slate-300 bg-white px-6 py-3.5 font-semibold hover:bg-slate-100">Explore the demo</Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">Try an example workout without creating an account.</p>
          </div>
          <div className="min-w-0 rounded-3xl bg-accent-periwinkle p-5 sm:p-8">
            <div className="rounded-2xl bg-white p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium text-slate-500">Example workout</p><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">45 min</span></div>
              <h2 className="mt-4 text-2xl font-bold">Full-body strength</h2>
              <p className="mt-2 text-sm text-slate-500">A preview of how your sessions are organized.</p>
              <ul className="mt-6 divide-y divide-slate-100">
                {[['Goblet squat', '3 sets · 10 reps'], ['Dumbbell row', '3 sets · 10 reps'], ['Push-up', '3 sets · 8 reps']].map(([name, detail]) => <li key={name} className="flex flex-wrap items-center justify-between gap-2 py-4"><span className="font-medium">{name}</span><span className="text-sm text-slate-500">{detail}</span></li>)}
              </ul>
              <Link href="/demo" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline underline-offset-4">Open this example</Link>
            </div>
          </div>
        </section>
        <section aria-label="How WON works" className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-3 sm:py-14">
          {features.map((feature) => <div key={feature.title}><h2 className="text-lg font-semibold">{feature.title}</h2><p className="mt-3 text-base leading-relaxed text-slate-600">{feature.text}</p></div>)}
        </section>
        <section className="mx-auto w-full max-w-6xl px-5 pb-14 sm:px-8"><div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-accent-seafoam p-6 sm:p-10 md:flex-row md:items-center"><div><h2 className="text-2xl font-bold">Make room for your next session.</h2><p className="mt-2 text-slate-600">Set your preferences and generate your first plan.</p></div><Link href="/auth/signup" className="shrink-0 rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-blue-700">Get started</Link></div></section>
      </main>
      <footer className="mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-3 px-5 py-6 text-sm text-slate-500 sm:px-8"><span>WON · Personal workout planning</span><Link href="/demo" className="underline underline-offset-4">View example workout</Link></footer>
    </div>
  );
}
