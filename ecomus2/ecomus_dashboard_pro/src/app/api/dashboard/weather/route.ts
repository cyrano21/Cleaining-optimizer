import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Simuler des données météo dynamiques (en production, utiliser une vraie API météo)
    const weatherData = {
      temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
      location: 'Mumbai, India',
      humidity: Math.floor(Math.random() * 30) + 40, // 40-70%
      windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
      pressure: Math.floor(Math.random() * 20) + 45, // 45-65
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}