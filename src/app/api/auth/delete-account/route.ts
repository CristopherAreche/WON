export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const deleteAccountSchema = z.object({
  name: z.string().trim().min(1, "NAME_REQUIRED"),
  confirmationText: z.string().trim().min(1, "CONFIRMATION_REQUIRED"),
});

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = deleteAccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const { name, confirmationText } = parsed.data;

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

    // Verify identity matches (name when available, otherwise email)
    const expectedIdentity = (user.name || user.email).toLowerCase();
    if (expectedIdentity !== name.toLowerCase()) {
      return NextResponse.json(
        { error: "IDENTITY_DOES_NOT_MATCH" },
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

    await prisma.$transaction(async (tx) => {
      await tx.onboardingAnswers.deleteMany({
        where: { userId: user.id }
      });

      await tx.workoutPlan.deleteMany({
        where: { userId: user.id }
      });

      await tx.account.deleteMany({
        where: { userId: user.id }
      });

      await tx.session.deleteMany({
        where: { userId: user.id }
      });

      await tx.user.delete({
        where: { id: user.id }
      });
    });

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
