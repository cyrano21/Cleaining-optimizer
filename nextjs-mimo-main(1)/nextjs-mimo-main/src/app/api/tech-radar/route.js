import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Dans une application réelle, ces données viendraient d'une base de données
    const data = [
      { name: 'React', category: 'frontend', ring: 'ADOPTER' },
      { name: 'Next.js', category: 'frameworks', ring: 'ADOPTER' },
      { name: 'TypeScript', category: 'languages', ring: 'ADOPTER' },
      { name: 'Tailwind CSS', category: 'frontend', ring: 'ADOPTER' },
      { name: 'GraphQL', category: 'backend', ring: 'ESSAYER' },
      { name: 'Framer Motion', category: 'frontend', ring: 'ESSAYER' },
      { name: 'tRPC', category: 'backend', ring: 'ESSAYER' },
      { name: 'Remix', category: 'frameworks', ring: 'ÉVALUER' },
      { name: 'SolidJS', category: 'frontend', ring: 'ÉVALUER' },
      { name: 'Astro', category: 'frameworks', ring: 'ÉVALUER' },
      { name: 'Deno', category: 'backend', ring: 'ÉVALUER' },
      { name: 'Svelte', category: 'frontend', ring: 'SURVEILLER' },
      { name: 'WebAssembly', category: 'languages', ring: 'SURVEILLER' },
      { name: 'Node.js', category: 'backend', ring: 'ADOPTER' },
      { name: 'Express', category: 'backend', ring: 'ADOPTER' },
      { name: 'MongoDB', category: 'backend', ring: 'ADOPTER' },
      { name: 'PostgreSQL', category: 'backend', ring: 'ADOPTER' },
      { name: 'Docker', category: 'infrastructure', ring: 'ADOPTER' },
      { name: 'Jest', category: 'tools', ring: 'ADOPTER' },
      { name: 'GitHub Actions', category: 'tools', ring: 'ADOPTER' },
      { name: 'Vercel', category: 'infrastructure', ring: 'ADOPTER' },
      { name: 'Prisma', category: 'backend', ring: 'ESSAYER' },
      { name: 'Turborepo', category: 'tools', ring: 'ESSAYER' },
      { name: 'Vite', category: 'tools', ring: 'ESSAYER' },
      { name: 'Zustand', category: 'frontend', ring: 'ESSAYER' },
      { name: 'Bun', category: 'tools', ring: 'ÉVALUER' },
      { name: 'Qwik', category: 'frameworks', ring: 'ÉVALUER' },
      { name: 'Edge Functions', category: 'infrastructure', ring: 'ÉVALUER' },
      { name: 'Web3', category: 'frontend', ring: 'SURVEILLER' },
      { name: 'HTMX', category: 'frontend', ring: 'SURVEILLER' },
    ];

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des données du radar technologique:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}