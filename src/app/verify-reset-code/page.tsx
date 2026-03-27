import { redirect } from "next/navigation";

export default function VerifyResetCodePage() {
  redirect("/auth/forgot-password");
}
