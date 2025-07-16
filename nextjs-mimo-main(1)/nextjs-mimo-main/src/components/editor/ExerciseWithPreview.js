"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CodeEditor from '../editor/CodeEditor';

export default function ExerciseWithPreview({ 
  exercise = {},
  onComplete = () => {}
}) {
  // Déstructuration avec valeurs par défaut
  const {
    id = 1,
    title = 'Exercice',
    description = 'Complétez cet exercice pour mettre en pratique vos connaissances.',
    instructions = [
      'Suivez les instructions pour compléter cet exercice.',
      'Utilisez le code fourni comme point de départ.'
    ],
    initialCode = '// Écrivez votre code ici\n',
    solutionCode = '// Solution de l\'exercice\n',
    language = 'javascript',
    difficulty = 'débutant',
    xpReward = 0,
    contributeToPortfolio = false
  } = exercise;

  // États du composant
  const [userCode, setUserCode] = useState(initialCode);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Détecter la taille de l'écran
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: 'beforeChildren',
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
  
  // Données de l'exercice avec les valeurs par défaut
  const exerciseData = {
    id,
    title,
    description,
    instructions,
    initialCode,
    solutionCode,
    language,
    difficulty,
    xpReward,
    contributeToPortfolio
  };
  
  const handleCodeChange = (newCode) => {
    setUserCode(newCode);
    // Réinitialiser les états lorsque le code change
    setIsCorrect(false);
    setFeedback(null);
  };
  
  const checkSolution = () => {
    // Logique de vérification simplifiée
    // Dans une application réelle, vous auriez une logique plus sophistiquée
    // ou une API pour vérifier la solution
    
    // Exemple simple: vérifier si le code contient certains éléments clés
    const containsButton = userCode.includes('<button');
    const containsTextProp = userCode.includes('{ text }') || userCode.includes('{text}') || userCode.includes('props.text');
    const containsReturnStatement = userCode.includes('return');
    
    if (containsButton && containsTextProp && containsReturnStatement) {
      setIsCorrect(true);
      setFeedback({
        type: 'success',
        message: 'Bravo ! Votre solution est correcte.'
      });
      
      // Notifier le parent que l'exercice est complété
      if (onComplete) {
        onComplete(exerciseData.id, exerciseData.xpReward);
      }
    } else {
      setIsCorrect(false);
      
      let feedbackMessage = "Votre solution n'est pas encore correcte. ";
      
      if (!containsButton) {
        feedbackMessage += "N'oubliez pas d'utiliser un élément button. ";
      }
      
      if (!containsTextProp) {
        feedbackMessage += "Assurez-vous d'utiliser la prop 'text'. ";
      }
      
      if (!containsReturnStatement) {
        feedbackMessage += "Votre composant doit retourner (return) quelque chose. ";
      }
      
      setFeedback({
        type: 'error',
        message: feedbackMessage
      });
    }
  };
  
  const toggleSolution = () => {
    setShowSolution(!showSolution);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
    >
      {/* En-tête de l'exercice */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 md:px-6 py-4">
        <motion.h3 
          variants={itemVariants}
          className="text-lg md:text-xl font-semibold text-white"
        >
          {exerciseData.title}
        </motion.h3>
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap items-center text-purple-100 text-sm mt-2 gap-2"
        >
          <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
            Difficulté: {exerciseData.difficulty}
          </span>
          <span className="bg-white bg-opacity-20 px-2 py-1 rounded flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            {exerciseData.xpReward} XP
          </span>
          
          {exerciseData.contributeToPortfolio && (
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Portfolio
            </span>
          )}
        </motion.div>
      </div>
      
      {/* Contenu de l'exercice */}
      <div className="p-4 md:p-6">
        <motion.div variants={itemVariants} className="mb-6">
          <p className="text-gray-700 leading-relaxed">{exerciseData.description}</p>
        </motion.div>
        
        {exerciseData.instructions && exerciseData.instructions.length > 0 && (
          <motion.div variants={itemVariants} className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Instructions</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              {exerciseData.instructions.map((instruction, index) => (
                <li key={index} className="leading-relaxed">{instruction}</li>
              ))}
            </ul>
          </motion.div>
        )}
        
        <motion.div variants={itemVariants} className="mb-6">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Votre code</h4>
          <CodeEditor
            initialCode={exerciseData.initialCode}
            language={exerciseData.language}
            onCodeChange={handleCodeChange}
            height={isMobile ? "250px" : "300px"}
            showPreview={true}
            autoPreview={true}
            theme="light"
          />
        </motion.div>
        
        {feedback && (
          <motion.div 
            variants={itemVariants}
            className={`p-4 rounded-lg mb-6 ${
              feedback.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                {feedback.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-sm leading-relaxed">{feedback.message}</div>
            </div>
          </motion.div>
        )}
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={checkSolution}
            className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Vérifier ma solution
          </button>
          
          <button
            onClick={toggleSolution}
            className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            {showSolution ? 'Masquer la solution' : 'Voir la solution'}
          </button>
        </motion.div>
        
        {showSolution && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Solution</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-3 bg-gray-100 border-b border-gray-200">
                <span className="text-xs font-medium text-gray-600">Solution de l'exercice</span>
              </div>
              <div className="p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                  {exerciseData.solutionCode}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}