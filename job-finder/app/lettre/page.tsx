/* stylelint-disable */
"use client";
/* stylelint-enable */

import { useState, useEffect } from "react";
import { CoverLetterProvider } from "../modules/lettre/utils/cover-letter-context";
import CoverLetterForm from "../modules/lettre/components/CoverLetterForm";
import CoverLetterPreview from "../modules/lettre/components/CoverLetterPreview";
import CoverLetterExport from "../modules/lettre/components/CoverLetterExport";

// Composant de la barre latérale
const Sidebar = ({ activeTab, setActiveTab }: { activeTab: "edit" | "preview", setActiveTab: (tab: "edit" | "preview") => void }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100 transition-all duration-500 h-full sticky top-4">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Navigation
        </h2>
        <div className="flex flex-col space-y-2">
          <button
            className={`px-4 py-3 rounded-md transition-all duration-200 flex items-center ${activeTab === "edit"
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("edit")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Éditer la lettre
          </button>
          <button
            className={`px-4 py-3 rounded-md transition-all duration-200 flex items-center ${activeTab === "preview"
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("preview")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Aperçu et export
          </button>
        </div>
      </div>
      
      {activeTab === "edit" ? (
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Conseils d&apos;écriture</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Personnalisez votre lettre en fonction de l&apos;entreprise</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Mettez en avant vos compétences pertinentes</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Utilisez un langage professionnel et concis</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Relisez pour corriger les fautes d&apos;orthographe</span>
            </li>
          </ul>
        </div>
      ) : (
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Options d&apos;exportation</h3>
          <div className="space-y-4">
            <CoverLetterExport compact={true} />
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Statistiques</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Caractères:</span>
                <span className="font-medium text-gray-800">~1500</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mots:</span>
                <span className="font-medium text-gray-800">~250</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Temps de lecture:</span>
                <span className="font-medium text-gray-800">~1 min</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Créer un composant pour le contenu principal
const MainContent = ({ activeTab }: { activeTab: "edit" | "preview" }) => {
  return (
    <div className="w-full overflow-hidden">
      {activeTab === "edit" ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-100 transition-all duration-500">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Créer votre lettre de motivation
            </h2>
          </div>
          <div className="transition-all duration-300 transform">
            <CoverLetterForm />
          </div>
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-100 transition-all duration-500">
          <h3 className="text-xl font-bold mb-6 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Aperçu de votre lettre
          </h3>
          <div className="border border-gray-200 rounded-lg shadow-lg bg-white p-6 transition-all duration-300 hover:shadow-xl">
            <CoverLetterPreview />
          </div>
        </div>
      )}
    </div>
  );
};

export default function CoverLetterGeneratorPage() {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [animateIn, setAnimateIn] = useState(false);
  
  // Animation effect when component mounts
  useEffect(() => {
    setAnimateIn(true);
  }, []);

  return (
    <CoverLetterProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-40 right-20 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
        </div>
        
        <div className="container mx-auto py-8 px-4 transition-all duration-500 ease-in-out relative z-10">
          <div className={`transition-all duration-700 transform ${animateIn ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 md:mb-0">
                Générateur de lettres de motivation
              </h1>
            </div>
          </div>
          
          {/* Layout avec sidebar */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - visible seulement sur desktop */}
            <div className="lg:w-1/4 hidden lg:block">
              <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            
            {/* Navigation tabs pour mobile uniquement */}
            <div className="lg:hidden mb-6">
              <div className="bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-md flex w-full">
                <button
                  className={`flex-1 px-4 py-2 rounded-md transition-all duration-200 ${activeTab === "edit"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("edit")}
                >
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Éditer
                  </span>
                </button>
                <button
                  className={`flex-1 px-4 py-2 rounded-md transition-all duration-200 ${activeTab === "preview"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("preview")}
                >
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Aperçu
                  </span>
                </button>
              </div>
            </div>
            
            {/* Contenu principal */}
            <div className="lg:w-3/4 w-full">
              <MainContent activeTab={activeTab} />
            </div>
          </div>
        </div>
      </div>
    </CoverLetterProvider>
  );
}
