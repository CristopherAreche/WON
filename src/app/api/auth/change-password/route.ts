export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { newPassword, confirmPassword, securityToken } = await req.json();
    
    if (!newPassword || !confirmPassword || !securityToken) {
      return NextResponse.json(
        { error: "ALL_FIELDS_REQUIRED" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "PASSWORDS_DO_NOT_MATCH" },
        { status: 400 }
      );
    }

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

    if (user.securityToken !== securityToken) {
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

    console.log("🔵 Password changed successfully for user:", user.email);
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