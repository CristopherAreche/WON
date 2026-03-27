export type AuthMessageTone = "info" | "error";

export interface AuthMessage {
  tone: AuthMessageTone;
  text: string;
}

export function getAuthMessage(message: string | null): AuthMessage | null {
  switch (message) {
    case "password-reset-success":
      return {
        tone: "info",
        text: "Password updated. You can sign in now.",
      };
    case "check-email":
      return {
        tone: "info",
        text: "Check your email to confirm your account before signing in.",
      };
    case "google-auth-cancelled":
      return {
        tone: "error",
        text: "Google sign-in was cancelled before completion.",
      };
    case "google-auth-failed":
      return {
        tone: "error",
        text: "Google sign-in could not be completed. Please try again.",
      };
    case "missing-auth-code":
      return {
        tone: "error",
        text: "The Google sign-in response was incomplete. Please try again.",
      };
    case "link-account-error":
      return {
        tone: "error",
        text: "We could not finish linking your WON account. Please sign in again.",
      };
    default:
      return null;
  }
}
