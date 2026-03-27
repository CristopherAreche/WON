import { redirect } from "next/navigation";

export default function ResetRedirectPage() {
  redirect("/auth/forgot-password");
}
