import { NextResponse } from "next/server";
import { currentUser } from "@/features/auth/actions";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user?.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Récupérer les comptes liés à l'utilisateur
    const accounts = await db.account.findMany({
      where: {
        userId: user.id
      },
      select: {
        provider: true,
        type: true
      }
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Error fetching user accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch user accounts" },
      { status: 500 }
    );
  }
}