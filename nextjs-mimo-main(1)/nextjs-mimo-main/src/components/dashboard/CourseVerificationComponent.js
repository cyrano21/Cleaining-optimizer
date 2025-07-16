
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CourseVerificationComponent() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState(null);
  const [verificationComplete, setVerificationComplete] = useState(false);

  // Simulation de vérification complète des cours et leçons
  const verifyCourses = async () => {
    setIsVerifying(true);
    setVerificationComplete(false);
    
    // Simulation d'un appel API qui vérifie l'état des cours
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Résultats simulés
    const results = {
      totalCourses: 12,
      completeCourses: 9,
      incompleteCourses: [
        {
          id: "next-advanced",
          title: "Next.js Avancé",
          totalLessons: 5,
          completeLessons: 3,
          missingLessons: [
            { id: "middleware", title: "Middleware et Composants Serveur" },
            { id: "streaming", title: "Streaming Server Components" }
          ]
        },
        {
          id: "react-patterns",
          title: "Design Patterns React",
          totalLessons: 6,
          completeLessons: 4,
          missingLessons: [
            { id: "compound", title: "Compound Components" },
            { id: "render-props", title: "Render Props" }
          ]
        },
        {
          id: "testing",
          title: "Tests automatisés",
          totalLessons: 4,
          completeLessons: 2,
          missingLessons: [
            { id: "e2e", title: "Tests End-to-End avec Cypress" },
            { id: "integration", title: "Tests d'intégration" }
          ]
        }
      ]
    };
    
    setVerificationResults(results);
    setIsVerifying(false);
    setVerificationComplete(true);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Vérification des cours</h2>
        <p className="mt-2 text-gray-600">
          Vérifiez si tous les cours ont été créés avec leurs leçons complètes.
        </p>
      </div>
      
      <div className="p-6">
        {!verificationComplete ? (
          <div className="text-center">
            <button
              onClick={verifyCourses}
              disabled={isVerifying}
              className={`btn-primary px-4 py-2 ${isVerifying ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isVerifying ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Vérification en cours...
                </span>
              ) : (
                'Vérifier les cours'
              )}
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-sm text-indigo-600 font-medium">Total des cours</div>
                <div className="text-2xl font-bold">{verificationResults.totalCourses}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Cours complets</div>
                <div className="text-2xl font-bold">{verificationResults.completeCourses}</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="text-sm text-amber-600 font-medium">Cours incomplets</div>
                <div className="text-2xl font-bold">{verificationResults.incompleteCourses.length}</div>
              </div>
            </div>
            
            {verificationResults.incompleteCourses.length > 0 ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Détails des cours incomplets</h3>
                <div className="space-y-4">
                  {verificationResults.incompleteCourses.map((course) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border border-amber-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-amber-50 px-4 py-3 border-b border-amber-200">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-amber-800">{course.title}</h4>
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                            {course.completeLessons}/{course.totalLessons} leçons
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Leçons manquantes :</h5>
                        <ul className="space-y-2">
                          {course.missingLessons.map((lesson) => (
                            <li key={lesson.id} className="flex items-center text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                              </svg>
                              {lesson.title}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 flex justify-end">
                          <button className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-md transition-colors">
                            Créer les leçons manquantes
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="mt-4 text-xl font-medium text-gray-700">Tous les cours sont complets !</div>
                <p className="mt-2 text-gray-500">Toutes les leçons ont été créées et sont prêtes à être utilisées.</p>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => {
                  setVerificationComplete(false);
                  setVerificationResults(null);
                }}
                className="text-indigo-600 hover:text-indigo-800"
              >
                Nouvelle vérification
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
