"use client";

import Link from "next/link";

export default function ProgressPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center animate-fade-in">
      <div className="w-24 h-24 bg-surface-light text-indigo-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 relative overflow-hidden">
        {/* Decorative Grid Line */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:12px_12px]"></div>
        <span className="material-icons-round text-5xl relative z-10">monitoring</span>
      </div>

      <h1 className="font-serif text-3xl text-slate-900 leading-tight mb-3">
        Track your <span className="text-indigo-500 italic">Progress</span><br />
      </h1>

      <p className="text-slate-500 max-w-xs mx-auto mb-8 text-sm">
        Coming soon: real-time charts, personal records, and performance analytics to make steady progress visible.
      </p>

      <Link
        href="/app/home"
        className="bg-indigo-600 text-white font-medium px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors shadow-indigo-600/20"
      >
        Back to Home
      </Link>
    </div>
  );
}
