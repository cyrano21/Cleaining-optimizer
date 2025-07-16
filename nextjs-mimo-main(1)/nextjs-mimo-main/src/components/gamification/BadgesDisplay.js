"use client";

import { useGamification } from './GamificationContext';
import { useState } from 'react';

export default function BadgesDisplay() {
  const { badges, availableBadges } = useGamification();
  const [selectedBadge, setSelectedBadge] = useState(null);
  
  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
  };
  
  const closeModal = () => {
    setSelectedBadge(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-medium mb-4">Badges et récompenses</h3>
      
      {badges.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <p>Complétez des leçons pour gagner des badges</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {badges.map((badge) => (
            <div 
              key={badge.id} 
              className="flex flex-col items-center p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
              onClick={() => handleBadgeClick(badge)}
            >
              <div className="text-2xl mb-1">{badge.icon}</div>
              <div className="text-xs text-center font-medium">{badge.name}</div>
            </div>
          ))}
        </div>
      )}
      
      {/* Badges à débloquer */}
      <h4 className="font-medium mt-6 mb-3 text-sm text-gray-600">Badges à débloquer</h4>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {availableBadges
          .filter(badge => !badges.some(b => b.id === badge.id))
          .map((badge) => (
            <div 
              key={badge.id} 
              className="flex flex-col items-center p-2 border border-gray-200 rounded-md bg-gray-50 opacity-60"
            >
              <div className="text-2xl mb-1 grayscale">❓</div>
              <div className="text-xs text-center">???</div>
            </div>
          ))
        }
      </div>
      
      {/* Modal pour afficher les détails du badge */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">{selectedBadge.icon}</div>
              <h3 className="text-xl font-bold">{selectedBadge.name}</h3>
              <p className="text-gray-600 mt-2">{selectedBadge.description}</p>
            </div>
            <button 
              onClick={closeModal}
              className="w-full btn-primary mt-4"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
