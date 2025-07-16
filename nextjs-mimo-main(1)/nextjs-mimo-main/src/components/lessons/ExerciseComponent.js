'use client';

import { useState, useEffect } from 'react';

// Valeurs par défaut pour éviter les erreurs
export const defaultExercise = {
  title: 'Exercice',
  description: '',
  type: 'single',
  options: []
};

export default function ExerciseComponent({ 
  exercise: propExercise, 
  theme: parentTheme = 'light',
  onComplete = () => {}
}) {
  // Fusion avec les valeurs par défaut
  const exercise = { ...defaultExercise, ...propExercise };
  // S'assurer que options est toujours un tableau
  exercise.options = Array.isArray(exercise.options) ? exercise.options : [];
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [localTheme, setLocalTheme] = useState(parentTheme);
  
  // Synchroniser le thème avec le thème parent lorsqu'il change
  useEffect(() => {
    setLocalTheme(parentTheme);
  }, [parentTheme]);
  
  const handleOptionToggle = (optionId) => {
    if (!isSubmitted) {
      if (exercise.type === 'single') {
        // Pour les exercices à choix unique
        setSelectedOptions([optionId]);
      } else {
        // Pour les exercices à choix multiples
        if (selectedOptions.includes(optionId)) {
          setSelectedOptions(selectedOptions.filter(id => id !== optionId));
        } else {
          setSelectedOptions([...selectedOptions, optionId]);
        }
      }
    }
  };
  
  const handleSubmit = () => {
    if (selectedOptions.length === 0) return;
    
    // Vérifier les réponses
    const correctOptions = exercise.options.filter(option => option.correct).map(option => option.id);
    const isCorrect = selectedOptions.length === correctOptions.length && 
                     selectedOptions.every(id => correctOptions.includes(id));
    
    setFeedback({
      isCorrect,
      message: isCorrect 
        ? 'Bravo ! Vous avez correctement identifié les bonnes réponses.' 
        : 'Ce n\'est pas tout à fait ça. Essayez de revoir la théorie et réessayez.'
    });
    
    setIsSubmitted(true);
    
    // Appeler le callback onComplete si la réponse est correcte
    if (isCorrect) {
      onComplete();
    }
  };
  
  const resetExercise = () => {
    // Mettre à jour l'état
    setIsSubmitted(true);
    setFeedback(isCorrect ? 'Correct !' : 'Incorrect. Essayez encore.');
    
    // Appeler le callback onComplete si la réponse est correcte
    if (isCorrect) {
      onComplete();
    }
  };
  
  // Utiliser localTheme pour tous les styles conditionnels
  const theme = localTheme;
  
  return (
    <div className="space-y-4">
      <h3 className={`font-medium text-lg ${theme === 'dark' ? 'text-gray-100' : ''}`}>{exercise.title}</h3>
      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{exercise.description}</p>
      
      <div className="space-y-2 mt-4">
        {exercise.options.length === 0 ? (
          <p className="text-yellow-600 dark:text-yellow-400 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            Aucune option disponible pour cet exercice.
          </p>
        ) : (
          exercise.options.map((option) => (
            <div 
              key={option.id}
              onClick={() => handleOptionToggle(option.id)}
              className={`exercise-option p-3 border rounded-md cursor-pointer transition-colors ${
                theme === 'dark' ? 'border-gray-600 text-gray-200' : ''
              } ${
                selectedOptions.includes(option.id) 
                  ? theme === 'dark' ? 'bg-indigo-900 border-indigo-700' : 'selected bg-indigo-50 border-indigo-300'
                  : ''
              } ${
                isSubmitted && option.correct 
                  ? theme === 'dark' 
                    ? 'border-green-600 bg-green-900 text-green-100' 
                    : 'border-green-500 bg-green-50' 
                  : isSubmitted && selectedOptions.includes(option.id) && !option.correct 
                    ? theme === 'dark'
                      ? 'border-red-600 bg-red-900 text-red-100'
                      : 'border-red-500 bg-red-50'
                    : ''
              }`}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-md border mr-3 flex items-center justify-center ${
                  selectedOptions.includes(option.id) 
                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                    : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  {selectedOptions.includes(option.id) && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span>{option.text}</span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {feedback && (
        <div className={`p-4 rounded-md ${
          feedback.isCorrect 
            ? theme === 'dark' ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'
            : theme === 'dark' ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'
        }`}>
          {feedback.message}
        </div>
      )}
      
      <div className="flex justify-between mt-4">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOptions.length === 0 || isSubmitted}
            className={`action-button mt-4 ${
              selectedOptions.length === 0
                ? theme === 'dark'
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-indigo-700 hover:bg-indigo-800'
                  : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Valider ma réponse
          </button>
        ) : (
          <button
            onClick={resetExercise}
            className={`action-button ${
              theme === 'dark'
                ? 'bg-emerald-700 hover:bg-emerald-800'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            Réessayer
          </button>
        )}
        
        {feedback && feedback.isCorrect && (
          <button className={`action-button ${
            theme === 'dark'
              ? 'bg-indigo-700 hover:bg-indigo-800'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}>
            Continuer
          </button>
        )}
      </div>
    </div>
  );
}
