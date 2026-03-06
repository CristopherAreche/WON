"use client";

import { z } from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SecurityTokenBanner from "@/components/SecurityTokenBanner";

const OnboardingSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  height: z.number().min(2, "Minimum height is 2'0\"").max(9.917, "Maximum height is 9'11\""),
  currentWeight: z.number().min(1, "Weight must be positive").max(1400, "Maximum weight is 1,400 lb"),
  goal: z.enum(["fat_loss", "hypertrophy", "strength", "returning", "general_health"]),
  experience: z.enum(["beginner", "three_to_twelve_months", "one_to_three_years", "three_years_plus"]),
  daysPerWeek: z.number().int().min(1).max(7),
  minutesPerSession: z.number().int().min(30).max(180),
  equipment: z.array(z.enum(["bodyweight", "bands", "dumbbells", "barbell", "machines"])).min(1, "Select at least one"),
  location: z.array(z.enum(["home", "gym", "park"])).min(1, "Select at least one"),
  injuries: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof OnboardingSchema>;

const GOALS: Array<{ id: OnboardingFormData["goal"]; title: string; desc: string; icon: string }> = [
  { id: "general_health", title: "General Health", desc: "Improve overall fitness", icon: "favorite" },
  { id: "hypertrophy", title: "Build Muscle", desc: "Hypertrophy & strength", icon: "fitness_center" },
  { id: "strength", title: "Build Strength", desc: "Progressive overload focus", icon: "sports_martial_arts" },
  { id: "fat_loss", title: "Lose Weight", desc: "Fat loss & cardio", icon: "local_fire_department" },
  { id: "returning", title: "Back to Training", desc: "Safe return with progression", icon: "autorenew" },
];

const EXPERIENCE_LEVELS: Array<{
  id: OnboardingFormData["experience"];
  title: string;
  desc: string;
  icon: string;
}> = [
  { id: "beginner", title: "Beginner", desc: "0-6 months", icon: "🌱" },
  { id: "three_to_twelve_months", title: "Starter+", desc: "3-12 months", icon: "⚡" },
  { id: "one_to_three_years", title: "Intermediate", desc: "1-3 years", icon: "🚀" },
  { id: "three_years_plus", title: "Advanced", desc: "3+ years", icon: "🏆" },
];

const EQUIPMENT_OPTIONS: Array<{
  id: OnboardingFormData["equipment"][number];
  title: string;
  icon: string;
}> = [
  { id: "bodyweight", title: "Bodyweight", icon: "accessibility_new" },
  { id: "bands", title: "Bands", icon: "linear_scale" },
  { id: "dumbbells", title: "Dumbbells", icon: "fitness_center" },
  { id: "barbell", title: "Barbell", icon: "sports_gymnastics" },
  { id: "machines", title: "Machines", icon: "precision_manufacturing" },
];

const LOCATION_OPTIONS: Array<{
  id: OnboardingFormData["location"][number];
  title: string;
  icon: string;
}> = [
  { id: "home", title: "Home", icon: "home" },
  { id: "gym", title: "Gym", icon: "apartment" },
  { id: "park", title: "Park", icon: "park" },
];

export default function OnboardingClient({
  userName,
}: {
  userName: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");

  const {
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: {
      fullName: userName.includes("@") ? "" : userName,
      dateOfBirth: "2000-01-01",
      height: 5.5,
      currentWeight: 150,
      goal: "general_health",
      experience: "beginner",
      daysPerWeek: 3,
      minutesPerSession: 45,
      equipment: ["bodyweight"],
      location: ["home"],
      injuries: "",
    },
  });

  const values = watch();

  const handleNextStep = async () => {
    const fieldsByStep: Record<number, (keyof OnboardingFormData)[]> = {
      1: ["fullName", "dateOfBirth", "currentWeight", "height", "goal", "experience"],
      2: ["daysPerWeek", "minutesPerSession"],
      3: ["equipment", "location"],
    };

    const isValid = await trigger(fieldsByStep[step]);
    if (!isValid) return;

    if (step < 3) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (step === 1) return;
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit: SubmitHandler<OnboardingFormData> = async (formValues) => {
    try {
      setLoading(true);
      setLoadingStage("Saving your profile...");

      const parsedDateOfBirth = new Date(formValues.dateOfBirth).toISOString();

      const onboardingRes = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formValues.fullName,
          dateOfBirth: parsedDateOfBirth,
          height: formValues.height,
          currentWeight: formValues.currentWeight,
          goal: formValues.goal,
          experience: formValues.experience,
          daysPerWeek: formValues.daysPerWeek,
          minutesPerSession: formValues.minutesPerSession,
          equipment: formValues.equipment,
          location: formValues.location,
          injuries: formValues.injuries,
        }),
      });

      if (!onboardingRes.ok) {
        throw new Error("Failed to save onboarding data");
      }

      setLoadingStage("Generating your personalized workout...");
      const generateRes = await fetch("/api/ai/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!generateRes.ok) {
        throw new Error("Failed to generate plan");
      }

      setLoadingStage("Preparing your dashboard...");
      await new Promise((resolve) => setTimeout(resolve, 600));
      router.replace("/app/home");
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-display flex flex-col relative pb-20">
      <SecurityTokenBanner />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm mx-4 shadow-glass border border-slate-100/50 text-center">
            <div className="w-16 h-16 mx-auto mb-6">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Almost there</h3>
            <p className="text-slate-500 text-sm mb-6">{loadingStage}</p>
          </div>
        </div>
      )}

      <header className="px-6 pt-6 pb-2 flex items-center justify-between sticky top-0 z-20 bg-slate-50/90 backdrop-blur-md">
        {step > 1 ? (
          <button onClick={handlePrevStep} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
            <span className="material-icons-round text-slate-600">arrow_back</span>
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}

        <h1 className="text-lg font-bold tracking-tight">Create Profile</h1>

        <button
          type="button"
          aria-label="Notifications"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
        >
          <span className="material-icons-round text-slate-600">notifications_none</span>
        </button>
      </header>

      <div className="px-8 py-4">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-primary">Step {step} of 3</span>
          <span className="text-xs text-slate-500">
            {step === 1 ? "Core Profile" : step === 2 ? "Weekly Routine" : "Training Space"}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <main className="flex-1 px-6 flex flex-col space-y-8 max-w-md mx-auto w-full animate-fade-in">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h2 className="text-2xl font-bold mb-2">Hello! 👋</h2>
                <p className="text-slate-500 text-sm">Start with your base profile and training objective.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    value={values.fullName}
                    onChange={(event) => setValue("fullName", event.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm"
                    placeholder="John Doe"
                  />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={values.dateOfBirth}
                    onChange={(event) => setValue("dateOfBirth", event.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm"
                  />
                  {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth.message}</p>}
                </div>

                <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <label className="font-semibold">Current Weight</label>
                    <span className="px-3 py-1 bg-slate-100 rounded-md text-sm font-semibold text-slate-600">lb</span>
                  </div>
                  <div className="flex items-end justify-center gap-1 mb-4">
                    <span className="text-5xl font-bold tracking-tight">{values.currentWeight}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="300"
                    value={values.currentWeight}
                    onChange={(event) => setValue("currentWeight", parseInt(event.target.value, 10))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <label className="font-semibold">Height</label>
                    <span className="px-3 py-1 bg-slate-100 rounded-md text-sm font-semibold text-slate-600">ft / in</span>
                  </div>
                  <div className="flex items-end justify-center gap-1 mb-4">
                    <span className="text-5xl font-bold tracking-tight">{Math.floor(values.height)}</span>
                    <span className="text-xl font-medium text-slate-500 mb-1">'</span>
                    <span className="text-5xl font-bold tracking-tight">{Math.round((values.height % 1) * 12)}</span>
                    <span className="text-xl font-medium text-slate-500 mb-1">\"</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="7"
                    step="0.08333"
                    value={values.height}
                    onChange={(event) => setValue("height", parseFloat(event.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Main Goal</h3>
                <div className="grid grid-cols-1 gap-3">
                  {GOALS.map((goal) => {
                    const isSelected = values.goal === goal.id;
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => setValue("goal", goal.id)}
                        className={`group relative flex items-center p-4 rounded-2xl transition-all shadow-sm border-2 text-left w-full ${
                          isSelected ? "bg-green-50 border-green-300" : "bg-white border-slate-100 hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 ${
                            isSelected ? "bg-white text-green-600 shadow-sm" : "bg-slate-50 text-slate-400"
                          }`}
                        >
                          <span className="material-icons-round">{goal.icon}</span>
                        </div>
                        <div>
                          <span className={`block font-bold ${isSelected ? "text-green-900" : "text-slate-900"}`}>
                            {goal.title}
                          </span>
                          <span className={`text-sm ${isSelected ? "text-green-700" : "text-slate-500"}`}>
                            {goal.desc}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute right-4 text-green-600">
                            <span className="material-icons-round">check_circle</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Experience Level</h3>
                <div className="grid grid-cols-2 gap-3">
                  {EXPERIENCE_LEVELS.map((experience) => {
                    const isSelected = values.experience === experience.id;
                    return (
                      <button
                        key={experience.id}
                        type="button"
                        onClick={() => setValue("experience", experience.id)}
                        className={`flex flex-col items-center justify-center p-5 rounded-2xl transition-all shadow-sm border-2 text-center ${
                          isSelected ? "bg-blue-50 border-blue-300" : "bg-white border-slate-100 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-3xl mb-2">{experience.icon}</span>
                        <span className={`font-bold ${isSelected ? "text-blue-900" : "text-slate-900"}`}>
                          {experience.title}
                        </span>
                        <span className={`text-xs mt-1 ${isSelected ? "text-blue-700" : "text-slate-500"}`}>
                          {experience.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-8"
              >
                <span>Continue to Step 2</span>
                <span className="material-icons-round text-lg">arrow_forward</span>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h2 className="text-2xl font-bold mb-2">Weekly Routine</h2>
                <p className="text-slate-500 text-sm">Choose your training frequency and session duration.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Days / Week</span>
                  <div className="text-3xl font-bold text-primary mb-2">{values.daysPerWeek}</div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    value={values.daysPerWeek}
                    onChange={(event) => setValue("daysPerWeek", parseInt(event.target.value, 10))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Minutes</span>
                  <div className="text-3xl font-bold text-primary mb-2">{values.minutesPerSession}</div>
                  <input
                    type="range"
                    min="30"
                    max="180"
                    step="15"
                    value={values.minutesPerSession}
                    onChange={(event) => setValue("minutesPerSession", parseInt(event.target.value, 10))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-8"
              >
                <span>Continue to Step 3</span>
                <span className="material-icons-round text-lg">arrow_forward</span>
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h2 className="text-2xl font-bold mb-2 leading-tight">
                  Refine your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-primary">Training Space</span>
                </h2>
                <p className="text-slate-500 text-sm">Select what fits your lifestyle best.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">Available Equipment</h3>
                <div className="grid grid-cols-2 gap-3">
                  {EQUIPMENT_OPTIONS.map((equipment) => {
                    const isSelected = values.equipment.includes(equipment.id);
                    return (
                      <button
                        key={equipment.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setValue(
                              "equipment",
                              values.equipment.filter((item) => item !== equipment.id)
                            );
                            return;
                          }

                          setValue("equipment", [...values.equipment, equipment.id]);
                        }}
                        className={`relative p-4 rounded-2xl flex flex-col items-center justify-center gap-3 h-28 transition-all border-2 ${
                          isSelected ? "border-primary bg-blue-50/50 shadow-md" : "border-transparent bg-white shadow-soft"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <span className="material-icons-round">{equipment.icon}</span>
                        </div>
                        <span className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-slate-700"}`}>
                          {equipment.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.equipment && <p className="text-xs text-red-500 mt-1">{errors.equipment.message}</p>}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">Primary Location</h3>
                <div className="grid grid-cols-3 gap-3">
                  {LOCATION_OPTIONS.map((location) => {
                    const isSelected = values.location.includes(location.id);
                    return (
                      <button
                        key={location.id}
                        type="button"
                        onClick={() => setValue("location", [location.id])}
                        className={`relative p-4 rounded-2xl flex flex-col items-center justify-center gap-2 h-24 transition-all border-2 ${
                          isSelected ? "border-primary bg-blue-50/50 shadow-md" : "border-transparent bg-white shadow-soft"
                        }`}
                      >
                        <span className={`material-icons-round text-3xl ${isSelected ? "text-primary" : "text-slate-400"}`}>
                          {location.icon}
                        </span>
                        <span className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-slate-700"}`}>
                          {location.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Injuries / Restrictions <span className="lowercase font-normal opacity-70">(Optional)</span>
                </h3>
                <textarea
                  value={values.injuries}
                  onChange={(event) => setValue("injuries", event.target.value)}
                  className="w-full h-32 p-4 rounded-2xl bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none outline-none shadow-sm text-sm"
                  placeholder="Describe any injury or restriction..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all active:scale-[0.98] mt-8"
              >
                Generate Workout
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
