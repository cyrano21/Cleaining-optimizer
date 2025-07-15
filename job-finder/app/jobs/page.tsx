/* stylelint-disable */
"use client";
/* stylelint-enable */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion
import { JobsProvider } from "../modules/jobs/utils/jobs-context"; // Import only JobsProvider
import JobSearchFilters from "../modules/jobs/components/JobSearchFilters";
import JobsList from "../modules/jobs/components/JobsList";
import JobAlerts from "../modules/jobs/components/JobAlerts";
import FavoritesList from "../components/FavoritesList"; // Import the new component
// Remove JobCard import if only used by FavoritesList now
// import JobCard from "../modules/jobs/components/JobCard";

// Define Tab type
type ActiveTab = "search" | "favorites" | "alerts";

// --- Reusable Tab Button Component ---
interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      className={`relative px-5 py-2.5 rounded-lg transition-colors duration-200 ease-in-out text-sm sm:text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white/80 ${
        isActive ? 'text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
      }`}
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
    >
      {/* Motion div for the sliding background/underline effect */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-white rounded-lg shadow-md z-0"
          layoutId="activeJobTab" // Key for the animation
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <span className="relative z-10">{label}</span> {/* Ensure text is above the motion div */}
    </button>
  );
}


export default function JobSearchPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("search");
  const [animateIn, setAnimateIn] = useState(false);

  // Animation effect when component mounts
  useEffect(() => {
    // Slight delay to ensure transition works smoothly with framer-motion potentially
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Animation variants for tab content
  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <JobsProvider>
      {/* Main container with background */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 relative overflow-x-hidden">
         {/* Decorative background elements (kept as is, looks fine) */}
        <div className="absolute inset-0 overflow-hidden z-0 opacity-70">
            <div className="absolute top-10 -left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute -top-10 right-10 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            <div className="absolute bottom-10 -right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000"></div>
        </div>

        {/* Page Content */}
        <div className="container mx-auto py-10 sm:py-12 px-4 relative z-10">
           {/* Animate Initial Load */}
           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: animateIn ? 1 : 0, y: animateIn ? 0 : -20 }}
             transition={{ duration: 0.6, ease: "easeOut" }}
           >
            {/* Page Header */}
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center sm:text-left text-gray-800">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Chasseur d&#39;emploi intelligent
                </span>
            </h1>

            {/* Tab Navigation */}
            <div className="flex justify-center sm:justify-start mb-8">
              <div className="flex space-x-1 bg-slate-100/80 backdrop-blur-sm rounded-xl shadow-sm p-1">
                <TabButton
                  label="Recherche"
                  isActive={activeTab === "search"}
                  onClick={() => setActiveTab("search")}
                />
                <TabButton
                  label="Favoris"
                  isActive={activeTab === "favorites"}
                  onClick={() => setActiveTab("favorites")}
                />
                <TabButton
                  label="Alertes"
                  isActive={activeTab === "alerts"}
                  onClick={() => setActiveTab("alerts")}
                />
              </div>
            </div>

            {/* Tab Content Area with Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab} // This key change triggers the animation
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {activeTab === "search" && (
                  // Use slightly more refined card styles
                  <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_350px)_1fr] gap-6 lg:gap-8">
                    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-5 sm:p-6">
                      <JobSearchFilters />
                    </div>
                    {/* Make Job list card potentially taller */}
                    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-5 sm:p-6 min-h-[60vh]">
                      <JobsList />
                    </div>
                  </div>
                )}

                {activeTab === "favorites" && (
                   <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-5 sm:p-6">
                     {/* Title can be inside FavoritesList or here */}
                     {/* <h3 className="text-xl font-bold mb-6 text-gray-800">Vos Offres Favorites</h3> */}
                     <FavoritesList />
                   </div>
                )}

                {activeTab === "alerts" && (
                  <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-5 sm:p-6">
                    <JobAlerts />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </JobsProvider>
  );
}

// Make sure you have the animations defined in your global CSS
// (from previous example if you added it)
/*
@keyframes blob { ... }
.animate-blob { ... }
.animation-delay-xxxx { ... }
*/

// Ensure framer-motion is installed: npm install framer-motion