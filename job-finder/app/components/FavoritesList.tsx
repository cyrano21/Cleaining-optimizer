// app/components/FavoritesList.tsx
import React from 'react';
import { useJobs } from "../modules/jobs/utils/jobs-context";
import JobCard from "../modules/jobs/components/JobCard";
import { JobListing } from "../modules/jobs/utils/types";

function FavoritesList() {
  const { getFavorites } = useJobs();
  const favorites: JobListing[] = getFavorites();

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 rounded-xl border border-blue-100 shadow-inner">
         <div className="mb-6">
           {/* Slightly enhanced placeholder icon */}
           <svg className="h-16 w-16 text-indigo-300 mx-auto animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
             <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.418a.562.562 0 01.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988h5.418a.563.563 0 00.475-.31l2.125-5.112z" />
           </svg>
         </div>
         <p className="text-gray-700 font-semibold text-lg">
           Vous n&apos;avez pas encore d&apos;offres favorites.
         </p>
         <p className="text-gray-600 mt-3 text-sm">
           Cliquez sur l&apos;icône étoile <span className="text-yellow-500 text-lg relative top-0.5">★</span> sur une offre pour l&apos;ajouter ici.
         </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Optional: Add a title here if you remove it from the parent page when this tab is active */}
      {/* <h3 className="text-xl font-bold text-gray-800 mb-4">Vos Offres Favorites</h3> */}
      {favorites.map((job: JobListing) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

export default FavoritesList;