export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { z } from "zod";
import { rateLimitByEmail, rateLimitByIP } from "@/lib/rate-limit";

const forgotPasswordTokenSchema = z.object({
  email: z.string().trim().toLowerCase().email("INVALID_EMAIL"),
  securityToken: z.string().regex(/^\d{10}$/, "INVALID_SECURITY_TOKEN"),
  newPassword: z
    .string()
    .min(12, "PASSWORD_TOO_SHORT")
    .max(128, "PASSWORD_TOO_LONG")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, "PASSWORD_TOO_WEAK"),
});

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const ipLimit = rateLimitByIP(ip);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = forgotPasswordTokenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const { email, securityToken, newPassword } = parsed.data;
    const emailLimit = rateLimitByEmail(email);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    // Find user by email and security token
    const user = await prisma.user.findFirst({
      where: {
        email,
        securityToken
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "INVALID_EMAIL_OR_TOKEN" },
        { status: 401 }
      );
    }

    // Check if user has a security token
    if (!user.securityToken) {
      return NextResponse.json({ 
        error: "Security token not found. Please contact support to set up your security token." 
      }, { status: 400 });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    return NextResponse.json({ ok: true, message: "Password reset successful" });

  } catch (e) {
    console.error("Password reset error:", e);
    return NextResponse.json(
      { error: "PASSWORD_RESET_FAILED" },
      { status: 500 }
    );
  }
}
