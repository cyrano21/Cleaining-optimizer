
"use client";

import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function TechRadar() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const svgRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tenter de récupérer les données depuis l'API
        const response = await fetch('/api/tech-radar');
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données du radar');
        }
        
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Erreur:', error);
        setError('Impossible de charger les données du radar technologique');
        
        // Utiliser des données de secours en cas d'erreur
        setData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0 && svgRef.current) {
      drawRadar();
    }
  }, [data, selectedCategory]);

  const drawRadar = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Nettoyer le SVG avant de redessiner
    
    // Filtrer les données en fonction de la catégorie sélectionnée
    const filteredData = selectedCategory === 'all' 
      ? data 
      : data.filter(item => item.category === selectedCategory);
    
    // Dimensions du radar
    const width = 600;
    const height = 600;
    const radius = Math.min(width, height) / 2 - 40;
    
    // Groupe principal centré
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    // Définir les cercles de niveaux
    const levels = 4;
    const rings = ['ADOPTER', 'ESSAYER', 'ÉVALUER', 'SURVEILLER'];
    
    // Couleurs pour les catégories
    const categoryColors = {
      'frontend': '#4f46e5', // indigo
      'backend': '#059669', // emerald
      'tools': '#d97706', // amber
      'infrastructure': '#7c3aed', // violet
      'frameworks': '#2563eb', // blue
      'languages': '#dc2626', // red
    };
    
    // Dessiner les cercles concentriques
    for (let i = 1; i <= levels; i++) {
      g.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', (radius / levels) * i)
        .attr('fill', 'none')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1);
        
      // Ajouter le texte pour chaque cercle
      if (i < levels) {
        g.append('text')
          .attr('y', -(radius / levels) * i - 5)
          .attr('x', 0)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('fill', '#6b7280')
          .text(rings[i-1]);
      }
    }
    
    // Diviser le cercle en sections pour les catégories (si on affiche tout)
    if (selectedCategory === 'all') {
      const uniqueCategories = [...new Set(data.map(item => item.category))];
      const angleStep = (2 * Math.PI) / uniqueCategories.length;
      
      uniqueCategories.forEach((category, i) => {
        const angle = i * angleStep;
        
        // Lignes de séparation
        g.append('line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', radius * Math.cos(angle - Math.PI / 2))
          .attr('y2', radius * Math.sin(angle - Math.PI / 2))
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 1);
          
        // Texte des catégories
        g.append('text')
          .attr('x', (radius + 20) * Math.cos(angle - Math.PI / 2))
          .attr('y', (radius + 20) * Math.sin(angle - Math.PI / 2))
          .attr('text-anchor', 'middle')
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .attr('fill', categoryColors[category] || '#374151')
          .text(category.toUpperCase());
      });
    }
    
    // Placer les technologies sur le radar
    filteredData.forEach((item, i) => {
      const ringIndex = rings.indexOf(item.ring);
      const r = ((ringIndex + 1) * radius) / levels - 15; // Rayon en fonction du niveau
      
      // Déterminer l'angle en fonction de la catégorie
      let angle;
      if (selectedCategory === 'all') {
        const categoryIndex = [...new Set(data.map(d => d.category))].indexOf(item.category);
        const totalCategories = [...new Set(data.map(d => d.category))].length;
        const categoryAngleStep = (2 * Math.PI) / totalCategories;
        const categoryStartAngle = categoryIndex * categoryAngleStep;
        const categoryEndAngle = (categoryIndex + 1) * categoryAngleStep;
        
        // Distribution aléatoire mais stable dans le secteur de la catégorie
        const seed = item.name.charCodeAt(0) + item.name.charCodeAt(item.name.length - 1);
        const randomOffset = (seed % 100) / 100;
        angle = categoryStartAngle + randomOffset * (categoryEndAngle - categoryStartAngle) - Math.PI / 2;
      } else {
        // Si une seule catégorie est sélectionnée, distribuer uniformément
        angle = (i * (2 * Math.PI)) / filteredData.length - Math.PI / 2;
      }
      
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      
      // Cercle pour représenter la technologie
      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 8)
        .attr('fill', categoryColors[item.category] || '#374151')
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          d3.select(this).attr('r', 10);
          
          // Afficher l'info-bulle
          const tooltip = g.append('g')
            .attr('class', 'tooltip')
            .attr('transform', `translate(${x}, ${y - 15})`);
            
          tooltip.append('rect')
            .attr('x', -60)
            .attr('y', -40)
            .attr('width', 120)
            .attr('height', 35)
            .attr('rx', 5)
            .attr('fill', 'white')
            .attr('stroke', '#e5e7eb')
            .attr('stroke-width', 1);
            
          tooltip.append('text')
            .attr('x', 0)
            .attr('y', -18)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .text(item.name);
            
          tooltip.append('text')
            .attr('x', 0)
            .attr('y', -3)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#6b7280')
            .text(item.ring);
        })
        .on('mouseout', function() {
          d3.select(this).attr('r', 8);
          g.selectAll('.tooltip').remove();
        });
        
      // Texte pour la technologie (affiché seulement si la catégorie est filtrée)
      if (selectedCategory !== 'all' || filteredData.length < 15) {
        g.append('text')
          .attr('x', x)
          .attr('y', y + 20)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', '#374151')
          .text(item.name);
      }
    });
  };

  // Catégories pour le filtre
  const categories = ['all', ...new Set(data.map(item => item.category))];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">Radar Technologique</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors`}
              >
                {category === 'all' ? 'Tous' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex justify-center overflow-auto">
            <svg ref={svgRef} className="max-w-full" />
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="font-semibold mb-2">Légende des anneaux</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  <span className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></span>
                  <span><strong>ADOPTER:</strong> Technologies éprouvées à adopter</span>
                </li>
                <li className="flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  <span><strong>ESSAYER:</strong> Technologies à tester en projets pilotes</span>
                </li>
                <li className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  <span><strong>ÉVALUER:</strong> À évaluer pour comprendre le potentiel</span>
                </li>
                <li className="flex items-center">
                  <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                  <span><strong>SURVEILLER:</strong> À garder à l'œil mais sans investir</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="font-semibold mb-2">À propos du Radar Tech</h3>
              <p className="text-sm text-gray-600">
                Notre radar technologique vous aide à visualiser et à comprendre les technologies actuelles et émergentes 
                pertinentes pour le développement avec Next.js et React. Utilisez ce radar comme guide pour vos choix 
                technologiques et votre parcours d'apprentissage.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Données de secours en cas d'échec de l'API
const fallbackData = [
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
