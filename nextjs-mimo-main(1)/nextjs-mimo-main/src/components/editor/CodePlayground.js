"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import CodeEditor from './CodeEditor';

export default function CodePlayground({ 
  initialCode = '', 
  language = 'javascript',
  title = 'Playground de code',
  description = 'Expérimentez avec le code et voyez le résultat en temps réel.',
  height = '500px'
}) {
  const [code, setCode] = useState(initialCode);
  const [savedCodes, setSavedCodes] = useState([]);
  const [currentSavedIndex, setCurrentSavedIndex] = useState(-1);
  const [showSavedList, setShowSavedList] = useState(false);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };
  
  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };
  
  const saveCurrentCode = () => {
    const timestamp = new Date().toLocaleString();
    const newSavedCode = {
      code,
      timestamp,
      language
    };
    
    setSavedCodes([...savedCodes, newSavedCode]);
    setCurrentSavedIndex(savedCodes.length);
    setShowSavedList(true);
  };
  
  const loadSavedCode = (index) => {
    if (index >= 0 && index < savedCodes.length) {
      setCode(savedCodes[index].code);
      setCurrentSavedIndex(index);
    }
  };
  
  const deleteSavedCode = (index) => {
    const newSavedCodes = [...savedCodes];
    newSavedCodes.splice(index, 1);
    setSavedCodes(newSavedCodes);
    
    if (currentSavedIndex === index) {
      setCurrentSavedIndex(-1);
    } else if (currentSavedIndex > index) {
      setCurrentSavedIndex(currentSavedIndex - 1);
    }
  };
  
  const toggleSavedList = () => {
    setShowSavedList(!showSavedList);
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      {/* En-tête du playground */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <motion.h3 
          variants={itemVariants}
          className="text-xl font-semibold text-white"
        >
          {title}
        </motion.h3>
        <motion.p 
          variants={itemVariants}
          className="text-blue-100 mt-1"
        >
          {description}
        </motion.p>
      </div>
      
      {/* Contenu du playground */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Éditeur de code */}
          <motion.div 
            variants={itemVariants}
            className="flex-1"
          >
            <CodeEditor
              initialCode={code}
              language={language}
              onCodeChange={handleCodeChange}
              height={height}
              showPreview={true}
              autoPreview={true}
            />
            
            <div className="mt-4 flex gap-3">
              <button
                onClick={saveCurrentCode}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Sauvegarder ce code
              </button>
              
              <button
                onClick={toggleSavedList}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                {showSavedList ? 'Masquer les sauvegardes' : 'Voir les sauvegardes'}
              </button>
            </div>
          </motion.div>
          
          {/* Liste des codes sauvegardés */}
          {showSavedList && (
            <motion.div 
              variants={itemVariants}
              className="w-full md:w-64 bg-gray-50 rounded-md border border-gray-200 p-4"
            >
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Codes sauvegardés
              </h4>
              
              {savedCodes.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Aucun code sauvegardé pour le moment.
                </p>
              ) : (
                <ul className="space-y-3">
                  {savedCodes.map((saved, index) => (
                    <li 
                      key={index}
                      className={`p-3 rounded-md border ${
                        currentSavedIndex === index 
                          ? 'border-indigo-300 bg-indigo-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            {saved.timestamp}
                          </div>
                          <div className="text-xs font-medium text-indigo-600 mb-2">
                            {saved.language.charAt(0).toUpperCase() + saved.language.slice(1)}
                          </div>
                          <div className="text-xs text-gray-700 line-clamp-2 font-mono">
                            {saved.code.substring(0, 50)}...
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => loadSavedCode(index)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Charger ce code"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteSavedCode(index)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Supprimer ce code"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
