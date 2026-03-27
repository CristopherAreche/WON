import { redirect } from "next/navigation";

export default function ResetPasswordTokenPage() {
  redirect("/auth/forgot-password");
}
