import { http } from "@/api/http";

type Goal = "fat_loss" | "hypertrophy" | "strength" | "returning" | "general_health";
type Experience =
  | "beginner"
  | "three_to_twelve_months"
  | "one_to_three_years"
  | "three_years_plus";
type Equipment = "bodyweight" | "bands" | "dumbbells" | "barbell" | "machines";
type Location = "home" | "gym" | "park";

export interface SignUpInput {
  name?: string;
  email: string;
  password: string;
}

export interface SignUpResponse {
  ok: true;
  userId: string;
  securityToken?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  newPassword: string;
  confirmPassword: string;
  securityToken: string;
}

export interface DeleteAccountInput {
  name: string;
  confirmationText: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface VerifyResetCodeInput {
  token: string;
  code: string;
}

export interface ResetPasswordInput {
  token: string;
  code: string;
  newPassword: string;
}

export interface ForgotPasswordTokenInput {
  email: string;
  securityToken: string;
  newPassword: string;
}

export interface SecurityTokenResponse {
  ok: true;
  securityTokenMasked: string;
}

export interface UpdateProfileInput {
  name: string;
  dateOfBirth: string;
  weightKg: number;
  heightCm: number;
}

export interface UpdateProfileImageInput {
  imageDataUrl: string;
}

export interface OnboardingInput {
  fullName: string;
  dateOfBirth: string;
  height: number;
  currentWeight: number;
  goal: Goal;
  experience: Experience;
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: Equipment[];
  location: Location[];
  injuries?: string;
}

export interface GeneratePlanInput {
  goal: Goal;
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: Equipment[];
  location: Location[];
  injuries?: string;
}

export interface GeneratePlanResponse {
  ok: true;
  planId: string;
  source?: string;
}

export interface DeletePlanResponse {
  ok: true;
  message?: string;
  planId?: string;
}

export const apiClient = {
  auth: {
    signIn(input: SignInInput) {
      return http.post<{ ok: true; user?: unknown }>("/api/session/signin", input);
    },
    signOut() {
      return http.post<{ ok: true }>("/api/session/signout");
    },
    signUp(input: SignUpInput) {
      return http.post<SignUpResponse>("/api/auth/signup", input);
    },
    forgotPassword(input: ForgotPasswordInput) {
      return http.post<{ ok: boolean; message?: string }>("/api/auth/forgot-password", {
        ...input,
        client: "web",
      });
    },
    verifyResetCode(input: VerifyResetCodeInput) {
      return http.post<{ ok: boolean; message?: string }>("/api/auth/verify-reset-code", input);
    },
    resetPassword(input: ResetPasswordInput) {
      return http.post<{ ok?: boolean; message?: string; email?: string }>("/api/auth/reset-password", input);
    },
    resetPasswordWithSecurityToken(input: ForgotPasswordTokenInput) {
      return http.post<{ ok: boolean; message?: string }>("/api/auth/forgot-password-token", input);
    },
    changePassword(input: ChangePasswordInput) {
      return http.post<{ ok: boolean; message?: string }>("/api/auth/change-password", input);
    },
    deleteAccount(input: DeleteAccountInput) {
      return http.post<{ ok: boolean; message?: string }>("/api/auth/delete-account", input);
    },
    getSecurityToken() {
      return http.get<SecurityTokenResponse>("/api/auth/security-token");
    },
  },
  user: {
    updateProfile(input: UpdateProfileInput) {
      return http.patch<{ ok: boolean }>("/api/user/profile", input);
    },
    updateProfileImage(input: UpdateProfileImageInput) {
      return http.put<{ ok: boolean }>("/api/user/profile-image", input);
    },
    removeProfileImage() {
      return http.delete<{ ok: boolean }>("/api/user/profile-image");
    },
  },
  onboarding: {
    save(input: OnboardingInput) {
      return http.post<{ ok: boolean; onboardingId: string }>("/api/onboarding", input);
    },
  },
  plans: {
    generate(input: Partial<GeneratePlanInput>) {
      return http.post<GeneratePlanResponse>("/api/ai/generate-plan", input);
    },
    delete(planId: string) {
      return http.delete<DeletePlanResponse>(`/api/workout/${planId}`);
    },
  },
};
