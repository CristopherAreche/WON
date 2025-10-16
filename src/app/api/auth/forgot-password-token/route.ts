export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, securityToken, newPassword } = await req.json();
    
    if (!email || !securityToken || !newPassword) {
      return NextResponse.json(
        { error: "EMAIL_TOKEN_AND_PASSWORD_REQUIRED" },
        { status: 400 }
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

    console.log("🔵 Password reset successful for user:", user.email);
    return NextResponse.json({ ok: true, message: "Password reset successful" });

  } catch (e) {
    console.error("Password reset error:", e);
    return NextResponse.json(
      { error: "PASSWORD_RESET_FAILED" },
      { status: 500 }
    );
  }
}