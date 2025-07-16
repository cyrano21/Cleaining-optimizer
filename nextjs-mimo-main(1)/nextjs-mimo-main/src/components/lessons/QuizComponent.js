"use client";

import { useState, useEffect } from 'react';

export default function QuizComponent({ quiz, theme: parentTheme = 'light', onComplete = () => {} }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [localTheme, setLocalTheme] = useState(parentTheme);
  
  // Synchroniser le thème avec le thème parent lorsqu'il change
  useEffect(() => {
    setLocalTheme(parentTheme);
  }, [parentTheme]);
  
  const handleAnswerSelect = (answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answer
    });
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculer le score
      let correctAnswers = 0;
      quiz.questions.forEach((question, index) => {
        if (selectedAnswers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });
      
      setScore(correctAnswers);
      setShowResults(true);
    }
  };
  
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    
    // Appeler onComplete si le quiz est réussi
    if (score === quiz.questions.length) {
      onComplete();
    }
  };
  
  const theme = localTheme;
  
  if (showResults) {
    return (
      <div className="space-y-4">
        <h3 className={`font-medium text-lg ${theme === 'dark' ? 'text-indigo-400' : 'text-primary-light'}`}>Résultats du quiz</h3>
        <p className={`text-lg ${theme === 'dark' ? 'text-emerald-400' : 'text-secondary-light'}`}>
          Vous avez obtenu <span className={`font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{score}/{quiz.questions.length}</span> réponses correctes
        </p>
        
        {score === quiz.questions.length ? (
          <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'}`}>
            Félicitations ! Vous avez répondu correctement à toutes les questions.
          </div>
        ) : (
          <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-yellow-900 text-yellow-100' : 'bg-yellow-100 text-yellow-800'}`}>
            Continuez à apprendre ! Vous pouvez réessayer le quiz pour améliorer votre score.
          </div>
        )}
        
        <button
          onClick={resetQuiz}
          className={`action-button mt-4 ${theme === 'dark' ? 'bg-indigo-700 hover:bg-indigo-800' : ''}`}
        >
          Réessayer le quiz
        </button>
      </div>
    );
  }
  
  const question = quiz.questions[currentQuestion];
  
  const getOptionClass = (index) => {
    const isSelected = selectedAnswers[currentQuestion] === question.options[index];
    
    if (isSelected) {
      return theme === 'dark' 
        ? 'bg-indigo-900 border-indigo-700' 
        : 'selected bg-indigo-50 border-indigo-300';
    } else {
      return '';
    }
  };

  const handleOptionSelect = (index) => {
    handleAnswerSelect(question.options[index]);
  };

  return (
    <div className="space-y-4">
      <h3 className={`font-medium text-lg ${theme === 'dark' ? 'text-gray-100' : 'text-primary-light'}`}>{question.question}</h3>
      
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionSelect(index)}
            className={`quiz-option p-3 mb-2 rounded-lg border cursor-pointer transition-all font-medium ${
              theme === 'dark' ? 'border-gray-600 text-gray-200' : ''
            } ${getOptionClass(index)}`}
          >
            {option}
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-6">
        <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>Question {currentQuestion + 1} sur {quiz.questions.length}</p>
        </div>
        
        <button
          onClick={handleNextQuestion}
          disabled={selectedAnswers[currentQuestion] === undefined}
          className={`action-button ${
            selectedAnswers[currentQuestion] === undefined 
              ? theme === 'dark'
                ? 'opacity-50 bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'opacity-50 cursor-not-allowed' 
              : theme === 'dark'
                ? 'bg-indigo-700 hover:bg-indigo-800'
                : ''
          }`}
        >
          {currentQuestion < quiz.questions.length - 1 ? 'Question suivante' : 'Terminer le quiz'}
        </button>
      </div>
    </div>
  );
}
