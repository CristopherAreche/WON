export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { timingSafeEqual } from "crypto";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const changePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(12, "PASSWORD_TOO_SHORT")
    .max(128, "PASSWORD_TOO_LONG")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, "PASSWORD_TOO_WEAK"),
  confirmPassword: z.string(),
  securityToken: z.string().regex(/^\d{10}$/, "INVALID_SECURITY_TOKEN"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "PASSWORDS_DO_NOT_MATCH",
  path: ["confirmPassword"],
});

function safeTokenEquals(actual: string, provided: string): boolean {
  const actualBuf = Buffer.from(actual);
  const providedBuf = Buffer.from(provided);
  if (actualBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(actualBuf, providedBuf);
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const changePasswordRateLimit = rateLimit(`change-password:${session.user.email}`, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,
    });

    if (!changePasswordRateLimit.allowed) {
      return NextResponse.json(
        { error: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const { newPassword, securityToken } = parsed.data;

    // Get user and verify security token
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Check if user has a security token
    if (!user.securityToken) {
      return NextResponse.json({ 
        error: "Security token not found. Please contact support to set up your security token." 
      }, { status: 400 });
    }

    if (!safeTokenEquals(user.securityToken, securityToken)) {
      return NextResponse.json(
        { error: "INVALID_SECURITY_TOKEN" },
        { status: 401 }
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    return NextResponse.json({ 
      ok: true, 
      message: "Password changed successfully" 
    });

  } catch (e) {
    console.error("Change password error:", e);
    return NextResponse.json(
      { error: "CHANGE_PASSWORD_FAILED" },
      { status: 500 }
    );
  }
}
