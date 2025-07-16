"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from './GamificationContext';

export default function MiniGameComponent({ 
  gameType = 'code-matching',
  difficulty = 'easy',
  theme = 'light',
  onComplete = () => {}
}) {
  const [gameState, setGameState] = useState('menu'); // menu, playing, completed
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentGame, setCurrentGame] = useState(null);
  const { addXp, unlockBadge } = useGamification();
  
  // Configuration des jeux selon le type
  const gameConfigs = {
    'code-matching': {
      title: 'Correspondance de Code',
      description: 'Associez le code JavaScript avec sa sortie',
      icon: '🧩',
      timeLimit: 60
    },
    'syntax-hunter': {
      title: 'Chasseur de Syntaxe',
      description: 'Trouvez les erreurs de syntaxe dans le code',
      icon: '🔍',
      timeLimit: 90
    },
    'speed-typing': {
      title: 'Frappe Rapide',
      description: 'Tapez le code le plus rapidement possible',
      icon: '⚡',
      timeLimit: 45
    },
    'logic-puzzle': {
      title: 'Puzzle Logique',
      description: 'Résolvez les défis logiques de programmation',
      icon: '🧠',
      timeLimit: 120
    }
  };
  
  useEffect(() => {
    setCurrentGame(gameConfigs[gameType]);
    setTimeLeft(gameConfigs[gameType].timeLimit);
  }, [gameType]);
  
  // Timer
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);
  
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(currentGame.timeLimit);
  };
  
  const endGame = useCallback(() => {
    setGameState('completed');
    
    // Calculer les points XP selon la performance
    let xpEarned = Math.floor(score * 10);
    
    // Bonus selon la difficulté
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2
    };
    xpEarned = Math.floor(xpEarned * difficultyMultiplier[difficulty]);
    
    // Bonus de temps si terminé rapidement
    if (timeLeft > currentGame.timeLimit * 0.5) {
      xpEarned += 50; // Bonus speed
    }
    
    // Badges selon la performance
    if (score >= 100) {
      unlockBadge("perfectionist");
    }
    
    addXp(xpEarned);
    onComplete(score, xpEarned);
  }, [score, timeLeft, currentGame, difficulty, addXp, unlockBadge, onComplete]);
  
  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setTimeLeft(currentGame?.timeLimit || 60);
  };
  
  // Rendu spécifique selon le type de jeu
  const renderGame = () => {
    switch (gameType) {
      case 'code-matching':
        return <CodeMatchingGame 
          onScoreUpdate={setScore} 
          score={score}
          theme={theme}
          difficulty={difficulty}
        />;
      case 'syntax-hunter':
        return <SyntaxHunterGame 
          onScoreUpdate={setScore} 
          score={score}
          theme={theme}
          difficulty={difficulty}
        />;
      case 'speed-typing':
        return <SpeedTypingGame 
          onScoreUpdate={setScore} 
          score={score}
          theme={theme}
          difficulty={difficulty}
        />;
      case 'logic-puzzle':
        return <LogicPuzzleGame 
          onScoreUpdate={setScore} 
          score={score}
          theme={theme}
          difficulty={difficulty}
        />;
      default:
        return <div>Jeu non implémenté</div>;
    }
  };
  
  if (gameState === 'menu') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } border shadow-lg text-center space-y-6`}
      >
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl"
          >
            {currentGame?.icon}
          </motion.div>
          
          <h2 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {currentGame?.title}
          </h2>
          
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {currentGame?.description}
          </p>
          
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            difficulty === 'easy' ? 'bg-green-100 text-green-700' :
            difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            <span>Difficulté:</span>
            <span className="font-medium capitalize">{difficulty}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                }`}>
                  {currentGame?.timeLimit}s
                </div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Temps limite
                </div>
              </div>
              <div>
                <div className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  +10 XP
                </div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Par point
                </div>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Commencer le jeu
          </motion.button>
        </div>
      </motion.div>
    );
  }
  
  if (gameState === 'completed') {
    const getGradeEmoji = () => {
      if (score >= 100) return "🏆";
      if (score >= 75) return "🎉";
      if (score >= 50) return "👍";
      return "💪";
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } border shadow-lg text-center space-y-6`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-6xl"
        >
          {getGradeEmoji()}
        </motion.div>
        
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Jeu terminé !
          </h2>
          
          <div className={`text-4xl font-bold mb-2 ${
            score >= 75 ? 'text-green-500' : 
            score >= 50 ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {score} points
          </div>
          
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {score >= 100 ? "Performance parfaite !" :
             score >= 75 ? "Excellent travail !" :
             score >= 50 ? "Bon travail !" :
             "Continuez à vous entraîner !"}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className={`flex-1 py-2 px-4 rounded-lg font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            Menu
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
          >
            Rejouer
          </motion.button>
        </div>
      </motion.div>
    );
  }
  
  // Interface de jeu
  return (
    <div className={`p-6 rounded-xl ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } border shadow-lg space-y-4`}>
      
      {/* En-tête avec score et timer */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
            }`}>
              {score}
            </div>
            <div className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Score
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              timeLeft > 20 ? 'text-green-500' : 
              timeLeft > 10 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {timeLeft}s
            </div>
            <div className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Temps
            </div>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={endGame}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          Terminer
        </motion.button>
      </div>
      
      {/* Barre de progression du temps */}
      <div className={`w-full h-2 rounded-full ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <motion.div
          animate={{ width: `${(timeLeft / currentGame.timeLimit) * 100}%` }}
          className={`h-2 rounded-full ${
            timeLeft > currentGame.timeLimit * 0.5 ? 'bg-green-500' : 
            timeLeft > currentGame.timeLimit * 0.25 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* Zone de jeu */}
      <div className="min-h-[300px]">
        {renderGame()}
      </div>
    </div>
  );
}

// Jeu de correspondance de code
function CodeMatchingGame({ onScoreUpdate, score, theme, difficulty }) {
  const [pairs, setPairs] = useState([]);
  const [selectedCode, setSelectedCode] = useState(null);
  const [selectedOutput, setSelectedOutput] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [attempts, setAttempts] = useState(0);
  
  const codeOutputPairs = {
    easy: [
      { code: 'console.log(2 + 3)', output: '5' },
      { code: 'console.log("Hello")', output: 'Hello' },
      { code: 'console.log(true)', output: 'true' },
      { code: 'console.log([1, 2, 3].length)', output: '3' }
    ],
    medium: [
      { code: 'console.log([1, 2, 3].map(x => x * 2))', output: '[2, 4, 6]' },
      { code: 'console.log("ABC".toLowerCase())', output: 'abc' },
      { code: 'console.log(Math.max(1, 5, 3))', output: '5' },
      { code: 'console.log({a: 1, b: 2}.a)', output: '1' }
    ],
    hard: [
      { code: 'console.log([1,2,3].reduce((a,b) => a+b))', output: '6' },
      { code: 'console.log(typeof null)', output: 'object' },
      { code: 'console.log(0.1 + 0.2 === 0.3)', output: 'false' },
      { code: 'console.log([..."hello"].length)', output: '5' }
    ]
  };
  
  useEffect(() => {
    const selectedPairs = codeOutputPairs[difficulty] || codeOutputPairs.easy;
    const shuffledCodes = [...selectedPairs].sort(() => Math.random() - 0.5);
    const shuffledOutputs = [...selectedPairs].sort(() => Math.random() - 0.5);
    setPairs({ codes: shuffledCodes, outputs: shuffledOutputs });
  }, [difficulty]);
  
  const handleCodeSelect = (codeItem) => {
    if (matchedPairs.includes(codeItem.code)) return;
    setSelectedCode(codeItem);
  };
  
  const handleOutputSelect = (outputItem) => {
    if (matchedPairs.includes(outputItem.output)) return;
    setSelectedOutput(outputItem);
    
    if (selectedCode) {
      setAttempts(attempts + 1);
      
      // Vérifier si la correspondance est correcte
      if (selectedCode.output === outputItem.output) {
        setMatchedPairs([...matchedPairs, selectedCode.code, outputItem.output]);
        onScoreUpdate(score + 10);
      }
      
      setSelectedCode(null);
      setSelectedOutput(null);
    }
  };
  
  if (!pairs.codes) return <div>Chargement...</div>;
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className={`text-lg font-medium ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Associez le code avec sa sortie
        </h3>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Paires trouvées: {matchedPairs.length / 2} / {pairs.codes.length}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Colonne des codes */}
        <div className="space-y-2">
          <h4 className={`font-medium text-center ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Code
          </h4>
          {pairs.codes.map((codeItem, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCodeSelect(codeItem)}
              className={`p-3 rounded-lg cursor-pointer border-2 font-mono text-sm ${
                matchedPairs.includes(codeItem.code)
                  ? 'bg-green-100 border-green-500 text-green-800'
                  : selectedCode?.code === codeItem.code
                    ? theme === 'dark'
                      ? 'bg-indigo-900 border-indigo-500 text-indigo-200'
                      : 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-200 hover:border-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-800 hover:border-gray-300'
              }`}
            >
              {codeItem.code}
            </motion.div>
          ))}
        </div>
        
        {/* Colonne des sorties */}
        <div className="space-y-2">
          <h4 className={`font-medium text-center ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Sortie
          </h4>
          {pairs.outputs.map((outputItem, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOutputSelect(outputItem)}
              className={`p-3 rounded-lg cursor-pointer border-2 font-mono text-sm ${
                matchedPairs.includes(outputItem.output)
                  ? 'bg-green-100 border-green-500 text-green-800'
                  : selectedOutput?.output === outputItem.output
                    ? theme === 'dark'
                      ? 'bg-indigo-900 border-indigo-500 text-indigo-200'
                      : 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-200 hover:border-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-800 hover:border-gray-300'
              }`}
            >
              {outputItem.output}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Placeholder pour les autres jeux
function SyntaxHunterGame({ onScoreUpdate, score, theme }) {
  return (
    <div className="text-center">
      <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Chasseur de Syntaxe
      </h3>
      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        Jeu en développement...
      </p>
    </div>
  );
}

function SpeedTypingGame({ onScoreUpdate, score, theme }) {
  return (
    <div className="text-center">
      <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Frappe Rapide
      </h3>
      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        Jeu en développement...
      </p>
    </div>
  );
}

function LogicPuzzleGame({ onScoreUpdate, score, theme }) {
  return (
    <div className="text-center">
      <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Puzzle Logique
      </h3>
      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        Jeu en développement...
      </p>
    </div>
  );
}