export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { z } from "zod";
import { rateLimitByEmail, rateLimitByIP } from "@/lib/rate-limit";

// Generate a 10-digit security token
function generateSecurityToken(): string {
  return randomInt(0, 10 ** 10).toString().padStart(10, "0");
}

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email("INVALID_EMAIL"),
  password: z
    .string()
    .min(12, "PASSWORD_TOO_SHORT")
    .max(128, "PASSWORD_TOO_LONG")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, "PASSWORD_TOO_WEAK"),
  name: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const normalized = value.trim();
      return normalized.length === 0 ? undefined : normalized;
    },
    z
      .string()
      .min(2, "INVALID_NAME")
      .max(50, "INVALID_NAME")
      .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, "INVALID_NAME")
      .optional()
  ),
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
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    const emailLimit = rateLimitByEmail(email);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "EMAIL_TAKEN" }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const securityToken = generateSecurityToken();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        securityToken
      },
    });

    return NextResponse.json({
      ok: true,
      userId: user.id,
      // Token is intentionally only returned once during signup.
      securityToken
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "SIGNUP_FAILED" }, { status: 500 });
  }
}
