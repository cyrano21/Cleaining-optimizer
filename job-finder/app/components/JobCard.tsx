// src/modules/jobs/components/JobCard.tsx
import React from 'react';
import { Job, useJobs } from '../jobs/utils/jobs-context'; // Import Job type et useJobs hook

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { addFavorite, removeFavorite, isFavorite } = useJobs();
  const isFav = isFavorite(job.id);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
      e.preventDefault(); // Empêche la navigation si la carte est un lien
      e.stopPropagation(); // Empêche la propagation si nécessaire
      if (isFav) {
          removeFavorite(job.id);
      } else {
          addFavorite(job);
      }
  };

  // Fonction simple pour formater la date (exemple)
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Date invalide';
    }
  };
  

  return (
    // Conteneur de la carte avec styles Tailwind
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col sm:flex-row gap-4 relative group">
      {/* Logo (placeholder) */}
      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 font-bold text-xl">
        {job.company?.charAt(0) || 'C'}
      </div>

      {/* Informations principales */}
      <div className="flex-grow">
        <h4 className="text-lg font-semibold text-blue-700 hover:underline mb-1">
          {/* Optionnel: rendre le titre cliquable */}
          {/* <a href={job.url || '#'} target="_blank" rel="noopener noreferrer">{job.title || 'Titre du poste'}</a> */}
          {job.title || 'Titre du poste'}
        </h4>
        <p className="text-sm text-gray-700 mb-1">{job.company || 'Nom de l\'entreprise'}</p>
        <p className="text-sm text-gray-500">{job.location || 'Lieu'}</p>
      </div>

      {/* Informations secondaires et Actions */}
      <div className="flex-shrink-0 flex flex-col items-end justify-between sm:ml-4">
        <p className="text-xs text-gray-400 mb-2 sm:mb-0">{formatDate(job.datePosted)}</p>
        <button
            onClick={handleFavoriteToggle}
            aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
            className={`p-2 rounded-full transition-colors duration-200 ${
                isFav
                ? 'text-yellow-500 bg-yellow-100/50 hover:bg-yellow-100'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'
            } focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1`}
        >
          {/* Icône étoile SVG */}
          <svg className="w-5 h-5" fill={isFav ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default JobCard;