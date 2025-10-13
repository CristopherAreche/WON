// src/app/onboarding/_client.tsx
"use client";

import { z } from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import RadioGroup from "@/components/ui/RadioGroup";
import TextField from "@/components/ui/TextField";
import Slider from "@/components/ui/Slider";

// Utility function to prevent emoji input
const preventEmojiInput = (e: React.KeyboardEvent) => {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(e.key)) {
    e.preventDefault();
  }
};

const OnboardingSchema = z.object({
  goal: z.enum([
    "fat_loss",
    "hypertrophy",
    "strength",
    "returning",
    "general_health",
  ]),
  experience: z.enum([
    "beginner",
    "three_to_twelve_months",
    "one_to_three_years",
    "three_years_plus",
  ]),
  daysPerWeek: z.number().int().min(1).max(7),
  minutesPerSession: z.number().int().min(30).max(180),
  equipment: z
    .array(z.enum(["bodyweight", "bands", "dumbbells", "barbell", "machines"]))
    .min(1, "Select at least one equipment"),
  injuries: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        (val.length <= 500 &&
          !/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
            val
          )),
      "Maximum 500 characters, emojis not allowed"
    ),
  location: z.enum(["home", "gym"]),
});

type OnboardingFormData = z.infer<typeof OnboardingSchema>;

export default function OnboardingClient({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [minutesPerSession, setMinutesPerSession] = useState(60);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: {
      goal: "general_health",
      experience: "beginner",
      daysPerWeek: 3,
      minutesPerSession: 60,
      equipment: ["bodyweight"],
      location: "home",
    },
  });

  const watchedValues = watch();

  const onSubmit: SubmitHandler<OnboardingFormData> = async (values) => {
    try {
      setLoading(true);
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...values }),
      });
      if (!res.ok) throw new Error("Could not save onboarding");

      const ai = await fetch("/api/ai/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!ai.ok) throw new Error("Could not generate plan");

      router.replace("/app/home");
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-8 min-h-full">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-black mb-6 text-center">
          Hello {userName.split("@")[0]}! Tell me about your workout
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Main Goal</label>
            <Select
              options={[
                { value: "fat_loss", label: "Fat Loss" },
                { value: "hypertrophy", label: "Muscle Growth" },
                { value: "strength", label: "Strength" },
                { value: "returning", label: "Return to Training" },
                { value: "general_health", label: "General Health" }
              ]}
              value={watchedValues.goal}
              onChange={(value) => setValue("goal", value as "fat_loss" | "hypertrophy" | "strength" | "returning" | "general_health")}
              error={!!errors.goal}
              placeholder="Select your main goal"
            />
            {errors.goal && (
              <p className="text-sm text-red-600 mt-1">{errors.goal.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Experience</label>
            <Select
              options={[
                { value: "beginner", label: "Beginner" },
                { value: "three_to_twelve_months", label: "3–12 months" },
                { value: "one_to_three_years", label: "1–3 years" },
                { value: "three_years_plus", label: "3+ years" }
              ]}
              value={watchedValues.experience}
              onChange={(value) => setValue("experience", value as "beginner" | "three_to_twelve_months" | "one_to_three_years" | "three_years_plus")}
              error={!!errors.experience}
              placeholder="Select your experience level"
            />
            {errors.experience && (
              <p className="text-sm text-red-600 mt-1">
                {errors.experience.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Slider
                label="Days per week"
                min={1}
                max={7}
                step={1}
                value={daysPerWeek}
                onChange={(value) => {
                  setDaysPerWeek(value);
                  setValue("daysPerWeek", value);
                }}
              />
              {errors.daysPerWeek && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.daysPerWeek.message}
                </p>
              )}
            </div>
            <div>
              <Slider
                label="Duration"
                min={30}
                max={180}
                step={15}
                value={minutesPerSession}
                onChange={(value) => {
                  setMinutesPerSession(value);
                  setValue("minutesPerSession", value);
                }}
                formatValue={(value) => `${value}min`}
              />
              {errors.minutesPerSession && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.minutesPerSession.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Available Equipment
            </label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { value: "bodyweight", label: "Bodyweight" },
                { value: "bands", label: "Resistance Bands" },
                { value: "dumbbells", label: "Dumbbells" },
                { value: "barbell", label: "Barbell" },
                { value: "machines", label: "Machines" },
              ].map((equipment) => {
                const isChecked = watchedValues.equipment?.includes(equipment.value as "bodyweight" | "bands" | "dumbbells" | "barbell" | "machines") || false;
                return (
                  <Checkbox
                    key={equipment.value}
                    label={equipment.label}
                    checked={isChecked}
                    onChange={(checked) => {
                      const current = watchedValues.equipment || [];
                      if (checked) {
                        setValue("equipment", [...current, equipment.value as "bodyweight" | "bands" | "dumbbells" | "barbell" | "machines"]);
                      } else {
                        setValue("equipment", current.filter(item => item !== equipment.value));
                      }
                    }}
                    error={!!errors.equipment}
                  />
                );
              })}
            </div>
            {errors.equipment && (
              <p className="text-sm text-red-600 mt-1">
                {errors.equipment.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Where will you train?
            </label>
            <RadioGroup
              options={[
                { value: "home", label: "Home" },
                { value: "gym", label: "Gym" }
              ]}
              name="location"
              value={watchedValues.location}
              onChange={(value) => setValue("location", value as "home" | "gym")}
              error={!!errors.location}
            />
            {errors.location && (
              <p className="text-sm text-red-600 mt-1">
                {errors.location.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Injuries or restrictions (optional)
            </label>
            <TextField
              multiline
              rows={3}
              maxLength={500}
              placeholder="Describe any injury or physical restriction..."
              onKeyDown={preventEmojiInput}
              value={watchedValues.injuries || ""}
              onChange={(value) => setValue("injuries", value)}
              error={!!errors.injuries}
              helperText={errors.injuries?.message}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate Workout"}
          </button>
        </form>
      </div>
    </div>
  );
}