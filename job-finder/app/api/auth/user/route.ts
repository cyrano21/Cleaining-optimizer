import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    // Récupérer l'utilisateur depuis la base de données
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    })
    
    // Si l'utilisateur n'existe pas dans la base de données, le créer
    if (!dbUser) {
      const newUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          role: user.user_metadata?.role || 'FREE',
        },
      })
      
      return NextResponse.json({ user: newUser })
    }
    
    return NextResponse.json({ user: dbUser })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
