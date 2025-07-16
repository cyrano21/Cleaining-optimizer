"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from './GamificationContext';

export default function ModernQuizComponent({ 
  quiz, 
  theme: parentTheme = 'light', 
  onComplete = () => {} 
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [localTheme, setLocalTheme] = useState(parentTheme);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 secondes par question
  const [timerActive, setTimerActive] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const { addXp, unlockBadge } = useGamification();
  
  // Synchroniser le thème avec le thème parent
  useEffect(() => {
    setLocalTheme(parentTheme);
  }, [parentTheme]);
  
  // Timer pour chaque question
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0 && !answered) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !answered) {
      // Temps écoulé, passer à la question suivante
      handleNextQuestion();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, timerActive, answered]);
  
  // Démarrer le timer quand on commence une nouvelle question
  useEffect(() => {
    setTimeLeft(30);
    setTimerActive(true);
    setAnswered(false);
    setShowExplanation(false);
  }, [currentQuestion]);
  
  const handleAnswerSelect = (answer) => {
    if (answered) return;
    
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answer
    });
    setAnswered(true);
    setTimerActive(false);
    
    // Vérifier si la réponse est correcte
    const question = quiz.questions[currentQuestion];
    const isCorrect = answer === question.correctAnswer;
    
    if (isCorrect) {
      setStreakCount(streakCount + 1);
      // Animation de célébration pour les bonnes réponses
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1500);
    } else {
      setStreakCount(0);
    }
    
    // Afficher l'explication si disponible
    if (question.explanation) {
      setTimeout(() => setShowExplanation(true), 500);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculer le score final
      let correctAnswers = 0;
      let speedBonus = 0;
      
      quiz.questions.forEach((question, index) => {
        if (selectedAnswers[index] === question.correctAnswer) {
          correctAnswers++;
          // Bonus de vitesse si répondu rapidement
          speedBonus += timeLeft > 20 ? 10 : timeLeft > 10 ? 5 : 0;
        }
      });
      
      const finalScore = correctAnswers;
      const accuracyPercentage = (correctAnswers / quiz.questions.length) * 100;
      
      setScore(finalScore);
      setShowResults(true);
      
      // Ajouter les points XP selon la performance
      let xpEarned = correctAnswers * 25; // 25 XP par bonne réponse
      xpEarned += speedBonus; // Bonus de vitesse
      
      if (accuracyPercentage === 100) {
        xpEarned += 50; // Bonus perfect
        unlockBadge("perfectionist");
      }
      
      if (streakCount >= 5) {
        xpEarned += 30; // Bonus streak
      }
      
      addXp(xpEarned);
      onComplete(finalScore, quiz.questions.length, xpEarned);
    }
  };
  
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setAnswered(false);
    setShowExplanation(false);
    setStreakCount(0);
    setTimeLeft(30);
  };
  
  const theme = localTheme;
  
  // Animations variants
  const questionVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 }
  };
  
  const celebrationVariants = {
    hidden: { scale: 0, rotate: 0 },
    visible: { 
      scale: [0, 1.2, 1], 
      rotate: [0, 360],
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };
  
  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const getGradeEmoji = () => {
      if (percentage === 100) return "🏆";
      if (percentage >= 80) return "🎉";
      if (percentage >= 60) return "👍";
      return "📚";
    };
    
    const getGradeMessage = () => {
      if (percentage === 100) return "Parfait ! Vous maîtrisez le sujet !";
      if (percentage >= 80) return "Excellent travail !";
      if (percentage >= 60) return "Bien joué, continuez comme ça !";
      return "Continuez à vous entraîner !";
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`space-y-6 p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } border shadow-lg`}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl mb-4"
          >
            {getGradeEmoji()}
          </motion.div>
          
          <h3 className={`font-bold text-2xl mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Quiz terminé !
          </h3>
          
          <p className={`text-lg mb-4 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {getGradeMessage()}
          </p>
        </div>
        
        {/* Statistiques détaillées */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`text-center p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className={`text-3xl font-bold ${
              percentage >= 80 ? 'text-green-500' : 
              percentage >= 60 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {score}/{quiz.questions.length}
            </div>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Bonnes réponses
            </p>
          </div>
          
          <div className={`text-center p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className={`text-3xl font-bold ${
              percentage >= 80 ? 'text-green-500' : 
              percentage >= 60 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {percentage}%
            </div>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Précision
            </p>
          </div>
        </div>
        
        {/* Barre de progression animée */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Progression
            </span>
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              {percentage}%
            </span>
          </div>
          <div className={`w-full h-3 rounded-full ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-3 rounded-full ${
                percentage >= 80 ? 'bg-green-500' : 
                percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetQuiz}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            theme === 'dark'
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          Recommencer le quiz
        </motion.button>
      </motion.div>
    );
  }
  
  const question = quiz.questions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / quiz.questions.length) * 100;
  
  return (
    <div className={`space-y-6 p-6 rounded-xl ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } border shadow-lg relative overflow-hidden`}>
      
      {/* Animation de célébration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            variants={celebrationVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          >
            <div className="text-8xl">🎉</div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* En-tête avec progression et timer */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Question {currentQuestion + 1} / {quiz.questions.length}
            </span>
            
            {streakCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium"
              >
                <span>🔥</span>
                <span>{streakCount} suite</span>
              </motion.div>
            )}
          </div>
          
          {/* Timer circulaire */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                strokeWidth="2"
              />
              <motion.path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={timeLeft > 10 ? '#10b981' : timeLeft > 5 ? '#f59e0b' : '#ef4444'}
                strokeWidth="2"
                strokeDasharray={`${(timeLeft / 30) * 100}, 100`}
                initial={{ strokeDasharray: "100, 100" }}
                animate={{ strokeDasharray: `${(timeLeft / 30) * 100}, 100` }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
              timeLeft > 10 ? 'text-green-500' : timeLeft > 5 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {timeLeft}
            </div>
          </div>
        </div>
        
        {/* Barre de progression globale */}
        <div className="space-y-2">
          <div className={`w-full h-2 rounded-full ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
      
      {/* Question avec animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          variants={questionVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <h3 className={`font-semibold text-xl mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {question.question}
          </h3>
          
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion] === option;
              const isCorrect = option === question.correctAnswer;
              const showAnswer = answered;
              
              let optionClass = `p-4 rounded-lg border-2 cursor-pointer transition-all transform hover:scale-[1.02] ${
                theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
              }`;
              
              if (showAnswer) {
                if (isCorrect) {
                  optionClass = `p-4 rounded-lg border-2 bg-green-100 border-green-500 text-green-800`;
                } else if (isSelected && !isCorrect) {
                  optionClass = `p-4 rounded-lg border-2 bg-red-100 border-red-500 text-red-800`;
                } else {
                  optionClass += ` opacity-60`;
                }
              } else if (isSelected) {
                optionClass = `p-4 rounded-lg border-2 ${
                  theme === 'dark' 
                    ? 'bg-indigo-900 border-indigo-500 text-indigo-200' 
                    : 'bg-indigo-50 border-indigo-500 text-indigo-700'
                }`;
              }
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAnswerSelect(option)}
                  className={optionClass}
                  whileHover={!answered ? { scale: 1.02 } : {}}
                  whileTap={!answered ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showAnswer && isCorrect && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-600 text-xl"
                      >
                        ✓
                      </motion.span>
                    )}
                    {showAnswer && isSelected && !isCorrect && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-red-600 text-xl"
                      >
                        ✗
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Explication de la réponse */}
      <AnimatePresence>
        {showExplanation && question.explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-lg ${
              theme === 'dark' 
                ? 'bg-blue-900/30 border-blue-700 text-blue-200' 
                : 'bg-blue-50 border-blue-200 text-blue-800'
            } border`}
          >
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">💡</span>
              <div>
                <p className="font-medium text-sm mb-1">Explication :</p>
                <p className="text-sm">{question.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Bouton suivant */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextQuestion}
          disabled={!answered}
          className={`py-2 px-6 rounded-lg font-medium transition-colors ${
            !answered 
              ? 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-600'
              : theme === 'dark'
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {currentQuestion < quiz.questions.length - 1 ? 'Question suivante' : 'Terminer le quiz'}
        </motion.button>
      </div>
    </div>
  );
}