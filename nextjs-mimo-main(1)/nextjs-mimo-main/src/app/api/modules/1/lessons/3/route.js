import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  console.log('Route spécifique pour la leçon 1-3 accédée avec succès');
  
  // Rediriger vers notre API directe pour la leçon 1-3
  const response = await fetch(new URL('/api/modules/1/lessons/direct?lesson=3', request.url).toString());
  const data = await response.json();
  
  return NextResponse.json(data);
}