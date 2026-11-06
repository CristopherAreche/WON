import Link from "next/link";
import ProgressPageClient from "@/app/app/progress/ProgressPageClient";

const plans = [{ id: "example", title: "Sample training plan", createdAt: "2026-01-01T00:00:00.000Z", daysPerWeek: 3 }];

export default function ProgressPreview() {
  return <main className="min-h-dvh bg-background-light px-4 py-6 sm:px-6"><div className="mx-auto max-w-6xl"><Link href="/demo" className="text-sm font-medium text-indigo-700">Back to workout demo</Link><ProgressPageClient plans={plans} weeklyGoal={3} demo /></div></main>;
}
