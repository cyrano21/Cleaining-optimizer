"use client";

import { useGamification } from './GamificationContext';

export default function PointsDisplay() {
  const { xp, level, currentLevelName, levelProgress } = useGamification();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Niveau {level}: {currentLevelName}</h3>
        <span className="text-indigo-600 font-bold">{xp} XP</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full" 
          style={{ width: `${levelProgress}%` }}
        ></div>
      </div>
      
      <div className="text-xs text-gray-500 text-right">
        {levelProgress}% vers le niveau suivant
      </div>
    </div>
  );
}
