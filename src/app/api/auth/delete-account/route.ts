export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { name, confirmationText } = await req.json();
    
    if (!name || !confirmationText) {
      return NextResponse.json(
        { error: "NAME_AND_CONFIRMATION_REQUIRED" },
        { status: 400 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Verify name matches (case insensitive)
    if (user.name?.toLowerCase() !== name.toLowerCase()) {
      return NextResponse.json(
        { error: "NAME_DOES_NOT_MATCH" },
        { status: 400 }
      );
    }

    // Verify confirmation text matches exactly
    const requiredText = "I would like to delete my account";
    if (confirmationText !== requiredText) {
      return NextResponse.json(
        { error: "CONFIRMATION_TEXT_INCORRECT" },
        { status: 400 }
      );
    }

    // Delete related data first (due to foreign key constraints)
    await prisma.onboardingAnswers.deleteMany({
      where: { userId: user.id }
    });

    await prisma.workoutPlan.deleteMany({
      where: { userId: user.id }
    });

    await prisma.account.deleteMany({
      where: { userId: user.id }
    });

    await prisma.session.deleteMany({
      where: { userId: user.id }
    });

    // Finally delete the user
    await prisma.user.delete({
      where: { id: user.id }
    });

    console.log("🔴 Account deleted for user:", user.email);
    return NextResponse.json({ 
      ok: true, 
      message: "Account deleted successfully" 
    });

  } catch (e) {
    console.error("Delete account error:", e);
    return NextResponse.json(
      { error: "DELETE_ACCOUNT_FAILED" },
      { status: 500 }
    );
  }
}