export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // Get user's security token
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        securityToken: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    if (!user.securityToken) {
      return NextResponse.json({ 
        error: "Security token not found. Please contact support to set up your security token." 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      ok: true, 
      securityToken: user.securityToken 
    });

  } catch (e) {
    console.error("Get security token error:", e);
    return NextResponse.json(
      { error: "FETCH_TOKEN_FAILED" },
      { status: 500 }
    );
  }
}