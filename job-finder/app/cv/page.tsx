/* stylelint-disable */
"use client";
/* stylelint-enable */

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion"; // Import framer-motion
import { CVProvider } from "../modules/cv/utils/cv-context";
import PersonalInfoForm from "../modules/cv/components/PersonalInfoForm";
import ExperienceForm from "../modules/cv/components/ExperienceForm";
import EducationForm from "../modules/cv/components/EducationForm";
import SkillsForm from "../modules/cv/components/SkillsForm";
import LanguagesForm from "../modules/cv/components/LanguagesForm";
import SummaryForm from "../modules/cv/components/SummaryForm";
import TemplateSelection from "../modules/cv/components/TemplateSelection";
import CVPreview from "../modules/cv/components/CVPreview";
import CVExport from "../modules/cv/components/CVExport";

// --- Reusable Icon Component (Optional but recommended) ---
// You could create a simple component like this:
// const Icon = ({ path, className = "h-5 w-5" }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//     <path strokeLinecap="round" strokeLinejoin="round" d={path} />
//   </svg>
// );
// And replace the inline SVGs below. For brevity, I'll keep the inline SVGs for now.

// --- Section Data ---
const sections = [
    { id: "personal", label: "Informations personnelles", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", color: "text-blue-500", borderColor: "border-blue-500" },
    { id: "summary", label: "Résumé", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-indigo-500", borderColor: "border-indigo-500" },
    { id: "experience", label: "Expérience pro.", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "text-purple-500", borderColor: "border-purple-500" },
    { id: "education", label: "Formation", icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222", color: "text-green-500", borderColor: "border-green-500" },
    { id: "skills", label: "Compétences", icon: "M9.663 17h4.673M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707m-9.9 9.9l-.707.707M16.95 7.05l.707.707", color: "text-yellow-500", borderColor: "border-yellow-500" },
    { id: "languages", label: "Langues", icon: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129", color: "text-teal-500", borderColor: "border-teal-500" },
    { id: "template", label: "Modèle", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z", color: "text-pink-500", borderColor: "border-pink-500" },
    // Removed 'export' from sidebar - better placed on Preview tab or as a global action
];

const tips = [
    "Utilisez des verbes d'action percutants.",
    "Adaptez votre CV à chaque offre d'emploi.",
    "Soyez concis, visez une page idéalement.",
    "Quantifiez vos réalisations avec des chiffres.",
    "Relisez attentivement (orthographe, grammaire).",
    "Choisissez un modèle professionnel et clair."
];

export default function CVGeneratorPage() {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [activeSection, setActiveSection] = useState<string>("personal");
  
  useEffect(() => {
    // Effet initial si nécessaire pour d'autres fonctionnalités
  }, []);

  const getSectionData = (id: string) => sections.find(s => s.id === id);
  const currentSectionData = getSectionData(activeSection);

  // Framer Motion variants for section transition
  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <CVProvider>
      {/* Enhanced Background */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* More subtle background elements */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-50">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Main Content Area */}
        <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8 relative z-10">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Créateur de CV
                </span>
              </h1>
              {/* Refined Tab Buttons */}
              <div className="flex space-x-1 bg-slate-200/80 backdrop-blur-sm p-1 rounded-lg shadow-sm self-start sm:self-center">
                <TabButton
                  label="Éditer"
                  iconPath="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  isActive={activeTab === "edit"}
                  onClick={() => setActiveTab("edit")}
                />
                <TabButton
                  label="Aperçu & Export"
                  iconPath="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  isActive={activeTab === "preview"}
                  onClick={() => setActiveTab("preview")}
                />
              </div>
            </div>
          </motion.div>

          {/* Conditional Layout: Edit vs Preview */}
          {activeTab === "edit" ? (
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
              {/* Sidebar (Navigation & Tips) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6 flex flex-col" // Added flex-col for potential height constraints
              >
                {/* Section Navigation Card */}
                <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-5 border border-gray-200/50 flex-shrink-0">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Sections du CV
                  </h3>
                  <nav className="space-y-1.5">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center text-sm font-medium group ${
                          activeSection === section.id
                            ? `bg-gradient-to-r from-blue-50 to-indigo-100 ${section.color} shadow-sm border-l-4 ${section.borderColor}`
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                        onClick={() => setActiveSection(section.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 flex-shrink-0 ${activeSection === section.id ? section.color : 'text-gray-400 group-hover:text-indigo-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d={section.icon} />
                        </svg>
                        {section.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tips Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-md p-5 border border-blue-100/50 flex-grow"> {/* Added flex-grow */}
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-indigo-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707-.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9l.707.707" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.343l-4.657-4.657L3 6.343l4.657 4.657L12 6.343z" /> {/* Lightbulb idea */}
                        </svg>
                        Conseils Rapides
                    </h3>
                    <ul className="text-sm text-gray-700 space-y-2.5">
                        {tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-100 text-blue-600 mr-2.5 flex-shrink-0 mt-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                            <span>{tip}</span>
                        </li>
                        ))}
                    </ul>
                </div>
              </motion.div>

              {/* Main Content Form Area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl p-6 md:p-8 border border-gray-200/60 overflow-hidden relative z-10"
              >
                {/* Animated Section Header */}
                <AnimatePresence mode="wait">
                   <motion.div
                      key={`${activeSection}-header`} // Key change triggers animation
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10}}
                      transition={{ duration: 0.2 }}
                      className="mb-6 pb-4 border-b border-gray-200"
                    >
                      <h2 className={`text-xl md:text-2xl font-semibold text-gray-800 flex items-center ${currentSectionData?.color}`}>
                        {currentSectionData && (
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mr-3`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d={currentSectionData.icon} />
                          </svg>
                        )}
                        {currentSectionData?.label}
                      </h2>
                    </motion.div>
                 </AnimatePresence>

                 {/* Animated Form Content */}
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection} // Key change triggers animation
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        {activeSection === "personal" && <PersonalInfoForm />}
                        {activeSection === "summary" && <SummaryForm />}
                        {activeSection === "experience" && <ExperienceForm />}
                        {activeSection === "education" && <EducationForm />}
                        {activeSection === "skills" && <SkillsForm />}
                        {activeSection === "languages" && <LanguagesForm />}
                        {activeSection === "template" && (
                            <>
                            <TemplateSelection />
                            {/* Mini Preview for Template Selection */}
                            <div className="mt-8 bg-gray-50/50 p-4 sm:p-6 rounded-lg border border-gray-200">
                                <h3 className="text-md font-semibold mb-3 flex items-center text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Aperçu rapide du modèle
                                </h3>
                                {/* Scale down the preview slightly */}
                                <div className="border border-gray-300 rounded-md shadow-inner bg-white overflow-hidden aspect-[1/1.414] max-h-[400px] mx-auto w-full max-w-sm relative">
                                    {/* Utiliser une mise à l'échelle avec un positionnement absolu pour contrôler l'affichage */}
                                    <div className="absolute inset-0 overflow-auto">
                                        <div className="transform scale-[0.5] w-[200%] h-[200%] origin-top-left">
                                            <CVPreview className="!shadow-none !border-none !p-0 !rounded-none !bg-transparent" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </>
                        )}
                        {/* Removed 'export' form from here */}
                    </motion.div>
                 </AnimatePresence>
              </motion.div>
            </div>
          ) : (
            // Preview & Export Tab
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 lg:space-y-8"
            >
                {/* CV Preview Card */}
                <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl p-6 md:p-8 border border-gray-200/60 overflow-hidden relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl md:text-2xl font-semibold flex items-center text-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Aperçu de votre CV
                        </h3>
                        <button 
                            onClick={() => {
                                const previewContainer = document.querySelector('.preview-container');
                                if (previewContainer) {
                                    previewContainer.classList.toggle('scale-125');
                                }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Agrandir
                        </button>
                    </div>
                    <div className="max-w-4xl mx-auto border border-gray-300 rounded-lg shadow-lg bg-white overflow-hidden relative z-10 preview-container transition-transform duration-300">
                        {/* Ensure CVPreview adapts well */}
                        <CVPreview />
                    </div>
                </div>

                {/* Export Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl shadow-lg p-6 md:p-8 border border-blue-200/50">
                    <h3 className="text-xl md:text-2xl font-semibold mb-6 flex items-center text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Télécharger votre CV
                    </h3>
                    <div className="max-w-lg mx-auto overflow-hidden"> {/* Center the export options and hide overflow */}
                       <CVExport />
                    </div>
                </div>
            </motion.div>
          )}
        </div>
      </div>
    </CVProvider>
  );
}

// --- Reusable Tab Button Component ---
interface TabButtonProps {
  label: string;
  iconPath: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, iconPath, isActive, onClick }: TabButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-md transition-all duration-300 ease-in-out text-sm font-medium flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-200 ${
        isActive
          ? "bg-white text-blue-600 shadow-md"
          : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
      }`}
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
      </svg>
      {label}
    </button>
  );
}

// --- Add CSS for Animations (in your global CSS file) ---
/*
@tailwind base;
@tailwind components;
@tailwind utilities;
  
@layer utilities {
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
  .animation-delay-6000 { // If you keep the 4th blob
    animation-delay: 6s;
  }
}

@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}
*/