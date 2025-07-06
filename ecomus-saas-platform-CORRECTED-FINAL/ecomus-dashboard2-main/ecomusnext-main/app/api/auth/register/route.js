import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb'
import User from '../../../../models/User'

export async function POST(request) {
  try {
    await connectDB()
    
    const { name, email, password, role } = await request.json()
    
    // Validation des données
    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Tous les champs sont requis'
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Un compte avec cette adresse email existe déjà'
      }, { status: 400 })
    }

    // Créer l'utilisateur
    const user = new User({
      name,
      email,
      password, // Le hash sera fait automatiquement par le middleware du modèle
      role: role || 'client'
    })

    await user.save()

    // Retourner l'utilisateur sans le mot de passe
    const userResponse = user.toObject()
    delete userResponse.password

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'Compte créé avec succès'
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: 'Un compte avec cette adresse email existe déjà'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de la création du compte'
    }, { status: 500 })
  }
}
