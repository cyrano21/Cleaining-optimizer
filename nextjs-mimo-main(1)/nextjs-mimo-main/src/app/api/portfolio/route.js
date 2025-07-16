
import { NextResponse } from 'next/server';

// Gestionnaire de la route POST /api/portfolio
export async function POST(request) {
  try {
    const portfolioData = await request.json();
    
    // Valider les données du portfolio
    if (!portfolioData.name) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }
    
    // Dans une application réelle, vous sauvegarderiez ces données dans une base de données
    console.log('Portfolio sauvegardé:', portfolioData);
    
    // Simuler un délai de réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      success: true,
      message: 'Portfolio sauvegardé avec succès',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du portfolio:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde du portfolio' },
      { status: 500 }
    );
  }
}
