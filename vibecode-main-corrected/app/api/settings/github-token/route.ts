import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/features/auth/actions";
import { db } from "@/lib/db";

// GET - Récupérer le token GitHub de l'utilisateur
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Récupérer le token depuis la base de données
    const userSettings = await db.user.findUnique({
      where: { id: user.id },
      select: { githubToken: true }
    });

    return NextResponse.json({ 
      githubToken: userSettings?.githubToken ? "***" : "" // Masquer le token pour la sécurité
    });
  } catch (error) {
    console.error("Error fetching GitHub token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Sauvegarder le token GitHub de l'utilisateur
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { githubToken } = await request.json();

    // Valider le format du token GitHub
    if (githubToken && !githubToken.match(/^(ghp_|github_pat_)[a-zA-Z0-9_]+$/)) {
      return NextResponse.json({ 
        error: "Format de token GitHub invalide. Le token doit commencer par 'ghp_' ou 'github_pat_'" 
      }, { status: 400 });
    }

    // Sauvegarder le token dans la base de données
    await db.user.update({
      where: { id: user.id },
      data: { githubToken: githubToken || null }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving GitHub token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Supprimer le token GitHub de l'utilisateur
export async function DELETE() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await db.user.update({
      where: { id: user.id },
      data: { githubToken: null }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting GitHub token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}