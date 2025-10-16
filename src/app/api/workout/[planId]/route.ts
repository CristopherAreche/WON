export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    const { planId } = await params;

    if (!planId) {
      return NextResponse.json({ error: "PLAN_ID_REQUIRED" }, { status: 400 });
    }

    // Check if the workout plan exists and belongs to the user
    const existingPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: planId,
        userId: user.id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "PLAN_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Delete the workout plan
    console.log("🗑️ Deleting workout plan from database:", planId);
    await prisma.workoutPlan.delete({
      where: {
        id: planId,
      },
    });
    console.log("✅ Workout plan deleted successfully:", planId);

    return NextResponse.json({ 
      ok: true, 
      message: "Workout plan deleted successfully",
      planId 
    });

  } catch (error) {
    console.error("Delete workout plan error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch specific workout plan details
export async function GET(
  req: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    const { planId } = await params;

    if (!planId) {
      return NextResponse.json({ error: "PLAN_ID_REQUIRED" }, { status: 400 });
    }

    // Get the workout plan
    const plan = await prisma.workoutPlan.findFirst({
      where: {
        id: planId,
        userId: user.id,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "PLAN_NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      plan 
    });

  } catch (error) {
    console.error("Get workout plan error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}