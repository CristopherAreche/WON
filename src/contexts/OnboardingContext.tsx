"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface OnboardingContextType {
  hasExistingPlans: boolean;
  setHasExistingPlans: (has: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [hasExistingPlans, setHasExistingPlans] = useState(false);

  return (
    <OnboardingContext.Provider value={{ hasExistingPlans, setHasExistingPlans }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}