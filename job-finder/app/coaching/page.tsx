/* stylelint-disable */
"use client";
/* stylelint-enable */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CoachingProvider, useCoaching } from "../modules/coaching/utils/coaching-context";
import { CVProvider } from "../modules/cv/utils/cv-context";
import { JobsProvider } from "../modules/jobs/utils/jobs-context";
import InterviewSimulator from "../modules/coaching/components/InterviewSimulator";
import DocumentAnalyzer from "../modules/coaching/components/DocumentAnalyzer";
import ProfileImprovements from "../modules/coaching/components/ProfileImprovements";
import AffirmationGenerator from "../modules/coaching/components/AffirmationGenerator";
import { ProfileImprovement } from "../modules/coaching/utils/types";

// Composant pour gérer la progression à l'intérieur du CoachingProvider
const ProgressTracker = () => {
  const { 
    interviewHistory, 
    profileImprovements, 
    dailyAffirmations,
    currentQuestion
  } = useCoaching();
  
  // Calcul de la progression globale
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Calcul de la progression en fonction des données réelles
    let totalProgress = 0;
    let totalItems = 0;
    
    // Progression de l'entretien (20% du total si commencé, plus 5% par question répondue)
    if (currentQuestion || interviewHistory.length > 0) {
      totalProgress += 20 + (interviewHistory.length * 5);
      totalItems += 50; // Max 50% pour l'entretien (20% + 6 questions * 5%)
    } else {
      totalItems += 50;
    }
    
    // Progression des améliorations de profil (5% par amélioration implémentée)
    if (profileImprovements.length > 0) {
      const implementedImprovements = profileImprovements.filter((imp: ProfileImprovement) => imp.implemented).length;
      totalProgress += implementedImprovements * 5;
      totalItems += 25; // Max 25% pour les améliorations
    } else {
      totalItems += 25;
    }
    
    // Progression des affirmations (25% si des affirmations sont générées)
    if (dailyAffirmations.length > 0) {
      totalProgress += 25;
      totalItems += 25; // Max 25% pour les affirmations
    } else {
      totalItems += 25;
    }
    
    // Calcul du pourcentage final
    const calculatedProgress = totalItems > 0 ? Math.round((totalProgress / totalItems) * 100) : 0;
    setProgress(calculatedProgress);
  }, [interviewHistory, profileImprovements, dailyAffirmations, currentQuestion]);

  // Déterminer la couleur en fonction du niveau de progression
  let progressColor = "bg-blue-500";
  if (progress >= 75) {
    progressColor = "bg-green-500";
  } else if (progress >= 50) {
    progressColor = "bg-blue-500";
  } else if (progress >= 25) {
    progressColor = "bg-yellow-500";
  } else {
    progressColor = "bg-red-400";
  }
  
  return (
    <div className="flex items-center space-x-2">
      <div className="text-xs font-medium text-gray-600 w-12 mr-2">{progress}%</div>
      <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden w-24 sm:w-32 md:w-40">
        <div className={`h-full ${progressColor} rounded-full transition-all duration-300 ease-out`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

// --- Tab Data ---
const coachingTabs = [
  { id: "interview", label: "Simulateur d'entretien", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { id: "documents", label: "Analyse de documents", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { id: "profile", label: "Améliorations de profil", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { id: "affirmations", label: "Affirmations positives", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" }
];

// Define Tab type based on IDs
type CoachingTabId = typeof coachingTabs[number]['id'];

// --- Quick Nav Links Data ---
const quickNavLinks = [
    { href: "/jobs", label: "Offres d'emploi", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { href: "/cv", label: "Mon CV", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { href: "/profil", label: "Mon profil", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export default function CoachingPage() {
  const [activeTab, setActiveTab] = useState<CoachingTabId>("interview");
  const [isMounted, setIsMounted] = useState(false);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => setShowTips(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Animation variants for page elements
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeInOut" } },
  };
  
  // Background animation variants
  const bgElementVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 1.2, ease: "easeOut" } },
  };
  
  // Floating elements animation
  const floatVariants = {
    float: {
      y: ["-5%", "5%", "-5%"],
      transition: {
        repeat: Infinity,
        duration: 5,
        ease: "easeInOut",
      },
    },
  };
  
  // Parallax effect for background
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    // Consider provider placement based on actual dependencies.
    // If Coaching doesn't need CV/Jobs state *during* its actions,
    // these could be in a higher layout component.
    <CVProvider>
      <JobsProvider>
        <CoachingProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 relative overflow-hidden flex">
            {/* Decorative background elements with parallax effect */}
            <div className="absolute inset-0 overflow-hidden z-0 opacity-80">
                <motion.div 
                    className="absolute top-10 -left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl"
                    variants={bgElementVariants}
                    initial="initial"
                    animate="animate"
                    style={{ x: mousePosition.x * -0.5, y: mousePosition.y * -0.5 }}
                ></motion.div>
                <motion.div 
                    className="absolute -top-10 right-10 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl"
                    variants={bgElementVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.2 }}
                    style={{ x: mousePosition.x * 0.5, y: mousePosition.y * 0.5 }}
                ></motion.div>
                <motion.div 
                    className="absolute -bottom-20 left-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"
                    variants={bgElementVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.4 }}
                    style={{ x: mousePosition.x * -0.3, y: mousePosition.y * -0.3 }}
                ></motion.div>
                <motion.div 
                    className="absolute bottom-10 -right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl"
                    variants={bgElementVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.6 }}
                    style={{ x: mousePosition.x * 0.4, y: mousePosition.y * 0.4 }}
                ></motion.div>
                <motion.div 
                    className="absolute top-1/3 left-1/4 w-24 h-24 border-2 border-blue-300 rounded-lg opacity-20 rotate-12"
                    variants={floatVariants}
                    animate="float"
                    style={{ x: mousePosition.x * 1.5, y: mousePosition.y * 1.5 }}
                ></motion.div>
                <motion.div 
                    className="absolute bottom-1/4 right-1/3 w-32 h-32 border-2 border-indigo-300 rounded-full opacity-20"
                    variants={floatVariants}
                    animate="float"
                    transition={{ delay: 0.3 }}
                    style={{ x: mousePosition.x * 1.2, y: mousePosition.y * 1.2 }}
                ></motion.div>
                <motion.div 
                    className="absolute top-2/3 right-1/4 w-20 h-20 border-2 border-purple-300 rounded-lg opacity-20 -rotate-12"
                    variants={floatVariants}
                    animate="float"
                    transition={{ delay: 0.5 }}
                    style={{ x: mousePosition.x * 1.8, y: mousePosition.y * 1.8 }}
                ></motion.div>
            </div>


            <main className="flex-1 p-4">
              {/* Quick Navigation */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: isMounted ? 1 : 0, y: isMounted ? 0 : -10 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="md:hidden mb-6"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100/60 p-3 overflow-x-auto">
                  <nav className="flex gap-x-2 min-w-max">
                    {quickNavLinks.map((link) => (
                      <Link 
                        key={link.href} 
                        href={link.href} 
                        className="flex flex-col items-center justify-center py-2 px-4 text-gray-700 hover:text-indigo-700 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50 whitespace-nowrap"
                      >
                        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 mb-1 transition-all duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon}></path>
                          </svg>
                        </span>
                        <span className="text-xs font-medium">{link.label}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
              </motion.div>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isMounted ? 1 : 0, y: isMounted ? 0 : 20 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-6 md:mb-8"
              >
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Coaching IA et préparation
                    </span>
                </h1>
                <p className="text-gray-600 max-w-xl lg:max-w-2xl mx-auto text-base md:text-lg">
                  Utilisez nos outils d&apos;IA pour améliorer votre recherche d&apos;emploi et préparer vos entretiens.
                </p>
              </motion.div>

              {/* Main Content Block */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isMounted ? 1 : 0, y: isMounted ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-indigo-100/60 p-5 sm:p-6 lg:p-8 relative overflow-hidden"
              >
                {/* Decorative elements for the content */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-100/40 to-transparent rounded-bl-full -z-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100/40 to-transparent rounded-tr-full -z-10"></div>
                {/* Tabs Navigation */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     {/* Use border-b on the container and negative margin on active button */}
                    <div className="flex flex-wrap border-b-2 border-indigo-100 w-full sm:w-auto">
                      {coachingTabs.map((tab, index) => (
                        <motion.button
                          key={tab.id}
                          role="tab"
                          aria-selected={activeTab === tab.id}
                          className={`relative px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-center text-sm sm:text-base font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-t-lg ${activeTab === tab.id
                            ? "text-indigo-700 border-indigo-100 border-l border-t border-r border-b-white -mb-px bg-white" // Active tab style
                            : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/60 border-transparent" // Inactive tab style
                          }`}
                          onClick={() => setActiveTab(tab.id as CoachingTabId)}
                          whileHover={{ y: -2, backgroundColor: activeTab === tab.id ? "rgba(255, 255, 255, 1)" : "rgba(238, 242, 255, 0.8)" }}
                          whileTap={{ scale: 0.97 }}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <motion.svg 
                            className="w-5 h-5 mr-2 flex-shrink-0" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}></path>
                          </motion.svg>
                          <motion.span 
                            className="whitespace-nowrap"
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                          >
                            {tab.label}
                          </motion.span>
                          {/* Animated underline indicator using framer-motion */}
                          {activeTab === tab.id && (
                              <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                layoutId="activeCoachingTabIndicator"
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              />
                          )}
                        </motion.button>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <ProgressTracker />
                  </div>
                </div>

                {/* Dynamic Tips Section */}
                <AnimatePresence>
                  {showTips && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10, transition: { duration: 0.2 }}}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded-r-lg shadow-sm overflow-hidden"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-grow">
                          <p className="text-sm text-blue-800 leading-relaxed">
                            <strong className="font-semibold">Conseil :</strong>{' '}
                            {activeTab === "interview" && "Préparez vos réponses aux questions comportementales (STAR) et entraînez-vous à articuler clairement vos expériences."}
                            {activeTab === "documents" && "Assurez-vous que votre CV et lettre de motivation sont exempts de fautes et mettent en valeur vos réalisations clés."}
                            {activeTab === "profile" && "Un profil en ligne (ex: LinkedIn) cohérent avec votre CV renforce votre crédibilité professionnelle."}
                            {activeTab === "affirmations" && "Visualisez votre succès et répétez ces affirmations pour renforcer votre mental avant un entretien."}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowTips(false)}
                          aria-label="Fermer le conseil"
                          className="ml-3 -mt-1 -mr-1 p-1 flex-shrink-0 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors duration-200"
                        >
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab} // Trigger animation on tab change
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    // className="grid grid-cols-1 gap-6" // Grid applied if content needs it, or remove if components handle layout
                  >
                    {activeTab === "interview" && <InterviewSimulator />}
                    {activeTab === "documents" && <DocumentAnalyzer />}
                    {activeTab === "profile" && <ProfileImprovements />}
                    {activeTab === "affirmations" && <AffirmationGenerator />}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* CTA Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isMounted ? 1 : 0, y: isMounted ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-xl p-6 sm:p-8 text-white mt-10 sm:mt-12 relative overflow-hidden"
              >
                {/* Decorative elements inside CTA (Kept as is) */}
                <div className="absolute -top-12 -right-12 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full opacity-80"></div>
                <div className="absolute -bottom-12 -left-12 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full opacity-80"></div>

                <div className="relative z-10">
                  <div className="md:flex items-center justify-between gap-6">
                    <div className="md:w-2/3 text-center md:text-left mb-6 md:mb-0 md:pr-8">
                      <h2 className="text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Prêt à passer au niveau supérieur ?</h2>
                      <p className="text-blue-100 text-base lg:text-lg mb-5">
                        Nos outils d&apos;IA vous accompagnent à chaque étape. Explorez toutes les fonctionnalités pour maximiser vos chances.
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        {/* Reusable Button/Link Style */}
                         <Link href="/jobs">
                          <motion.div
                            whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.98 }}
                            className="bg-white/20 backdrop-blur-sm text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center hover:bg-white/30 transition-all duration-300 shadow-sm"
                          >
                             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            Trouver des offres
                          </motion.div>
                        </Link>
                        <Link href="/cv">
                           <motion.div
                            whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.98 }}
                            className="bg-white/20 backdrop-blur-sm text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center hover:bg-white/30 transition-all duration-300 shadow-sm"
                          >
                             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Optimiser mon CV
                          </motion.div>
                        </Link>
                      </div>
                    </div>

                    <div className="md:w-1/3 flex justify-center md:justify-end">
                       <Link href="/pricing">
                         <motion.div
                          whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                          whileTap={{ scale: 0.97 }}
                          className="bg-white text-indigo-600 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center text-center"
                         >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            Nos Forfaits
                         </motion.div>
                       </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </main>
          </div>
        </CoachingProvider>
      </JobsProvider>
    </CVProvider>
  );
}