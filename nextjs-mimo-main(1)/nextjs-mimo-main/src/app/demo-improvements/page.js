"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GamificationProvider } from '../../components/gamification/GamificationContext';
import ModernQuizComponent from '../../components/gamification/ModernQuizComponent';
import MiniGameComponent from '../../components/gamification/MiniGameComponent';
import ModernDashboard from '../../components/dashboard/ModernDashboard';
import EnhancedAIAssistant from '../../components/learning/EnhancedAIAssistant';

export default function DemoImprovementsPage() {
  const [activeDemo, setActiveDemo] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  
  // Quiz de démonstration
  const demoQuiz = {
    title: 'Quiz React Moderne',
    questions: [
      {
        question: 'Quel hook React permet de gérer l\'état local d\'un composant ?',
        options: ['useEffect', 'useState', 'useContext', 'useReducer'],
        correctAnswer: 'useState',
        explanation: 'useState est le hook principal pour gérer l\'état local dans les composants fonctionnels React.'
      },
      {
        question: 'Quelle est la bonne syntaxe pour créer un composant React fonctionnel ?',
        options: [
          'function Component() { return <div>Hello</div>; }',
          'const Component = () => <div>Hello</div>;',
          'function Component() { return React.createElement("div", null, "Hello"); }',
          'Toutes ces réponses'
        ],
        correctAnswer: 'Toutes ces réponses',
        explanation: 'Toutes ces syntaxes sont valides pour créer un composant React fonctionnel.'
      },
      {
        question: 'Que fait useEffect avec un tableau de dépendances vide [] ?',
        options: [
          'S\'exécute à chaque rendu',
          'S\'exécute une seule fois au montage',
          'Ne s\'exécute jamais',
          'Provoque une erreur'
        ],
        correctAnswer: 'S\'exécute une seule fois au montage',
        explanation: 'useEffect avec un tableau vide [] s\'exécute uniquement lors du montage du composant, équivalent à componentDidMount.'
      }
    ]
  };
  
  const demos = [
    { id: 'dashboard', name: 'Tableau de bord', icon: '📊' },
    { id: 'quiz', name: 'Quiz moderne', icon: '🧠' },
    { id: 'games', name: 'Mini-jeux', icon: '🎮' },
    { id: 'ai', name: 'Assistant IA', icon: '🤖' }
  ];
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
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
  
  return (
    <GamificationProvider>
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-900 text-white' 
          : 'bg-gray-50 text-gray-900'
      }`}>
        {/* En-tête */}
        <div className={`sticky top-0 z-40 border-b ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } shadow-sm`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-2xl"
                >
                  🚀
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold">NextMimo - Améliorations 2025</h1>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Découvrez les nouvelles fonctionnalités
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Sélecteur de thème */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
                >
                  {theme === 'light' ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </motion.button>
                
                {/* Navigation vers les pages principales */}
                <a
                  href="/"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  Retour à l'accueil
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Introduction */}
            <motion.div
              variants={itemVariants}
              className={`p-6 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              } border shadow-lg`}
            >
              <h2 className="text-2xl font-bold mb-4">🎉 Nouvelles fonctionnalités NextMimo</h2>
              <p className={`text-lg mb-6 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Découvrez les améliorations apportées à NextMimo pour une expérience d'apprentissage encore plus immersive et moderne, rivalisant avec les meilleures plateformes comme Mimo.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                } border`}>
                  <div className="text-2xl mb-2">✨</div>
                  <h4 className={`font-semibold ${
                    theme === 'dark' ? 'text-green-300' : 'text-green-800'
                  }`}>
                    Interface moderne
                  </h4>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-green-200' : 'text-green-700'
                  }`}>
                    Animations fluides et design 2025
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
                } border`}>
                  <div className="text-2xl mb-2">🧠</div>
                  <h4 className={`font-semibold ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    Quiz interactifs
                  </h4>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
                  }`}>
                    Timer, streak, animations de réussite
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'
                } border`}>
                  <div className="text-2xl mb-2">🎮</div>
                  <h4 className={`font-semibold ${
                    theme === 'dark' ? 'text-purple-300' : 'text-purple-800'
                  }`}>
                    Mini-jeux
                  </h4>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-purple-200' : 'text-purple-700'
                  }`}>
                    Apprentissage ludique et gamifié
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'
                } border`}>
                  <div className="text-2xl mb-2">🤖</div>
                  <h4 className={`font-semibold ${
                    theme === 'dark' ? 'text-orange-300' : 'text-orange-800'
                  }`}>
                    IA avancée
                  </h4>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-orange-200' : 'text-orange-700'
                  }`}>
                    Assistant personnalisé et intelligent
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Navigation des démos */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-2 justify-center"
            >
              {demos.map((demo) => (
                <motion.button
                  key={demo.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveDemo(demo.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                    activeDemo === demo.id
                      ? theme === 'dark'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-indigo-600 text-white shadow-lg'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{demo.icon}</span>
                  <span>{demo.name}</span>
                </motion.button>
              ))}
            </motion.div>
            
            {/* Contenu des démos */}
            <motion.div
              key={activeDemo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeDemo === 'dashboard' && (
                <ModernDashboard theme={theme} />
              )}
              
              {activeDemo === 'quiz' && (
                <div className="space-y-6">
                  <div className={`p-6 rounded-xl ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  } border shadow-lg`}>
                    <h3 className="text-xl font-bold mb-4">Quiz moderne avec animations</h3>
                    <p className={`mb-6 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Nouvelle interface de quiz avec timer, système de streak, animations de célébration et explications détaillées.
                    </p>
                  </div>
                  
                  <ModernQuizComponent
                    quiz={demoQuiz}
                    theme={theme}
                    onComplete={(score, total, xp) => {
                      console.log(`Quiz terminé: ${score}/${total}, ${xp} XP gagnés`);
                    }}
                  />
                </div>
              )}
              
              {activeDemo === 'games' && (
                <div className="space-y-6">
                  <div className={`p-6 rounded-xl ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  } border shadow-lg`}>
                    <h3 className="text-xl font-bold mb-4">Mini-jeux d'apprentissage</h3>
                    <p className={`mb-6 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Rendez l'apprentissage plus amusant avec des mini-jeux interactifs qui renforcent les concepts de programmation.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <h4 className="font-semibold mb-2">🧩 Correspondance de Code</h4>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Associez le code JavaScript avec sa sortie
                        </p>
                      </div>
                      
                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <h4 className="font-semibold mb-2">🔍 Chasseur de Syntaxe</h4>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Trouvez les erreurs dans le code (bientôt)
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <MiniGameComponent
                    gameType="code-matching"
                    difficulty="easy"
                    theme={theme}
                    onComplete={(score, xp) => {
                      console.log(`Jeu terminé: ${score} points, ${xp} XP gagnés`);
                    }}
                  />
                </div>
              )}
              
              {activeDemo === 'ai' && (
                <div className="space-y-6">
                  <div className={`p-6 rounded-xl ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  } border shadow-lg`}>
                    <h3 className="text-xl font-bold mb-4">Assistant IA nouvelle génération</h3>
                    <p className={`mb-6 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Interface modernisée avec actions rapides contextuelles, animations fluides et expérience utilisateur optimisée.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
                      } border`}>
                        <div className="text-xl mb-2">💡</div>
                        <h4 className={`font-semibold ${
                          theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                        }`}>
                          Actions rapides
                        </h4>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
                        }`}>
                          Boutons contextuels pour des questions fréquentes
                        </p>
                      </div>
                      
                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                      } border`}>
                        <div className="text-xl mb-2">🎨</div>
                        <h4 className={`font-semibold ${
                          theme === 'dark' ? 'text-green-300' : 'text-green-800'
                        }`}>
                          Interface moderne
                        </h4>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-green-200' : 'text-green-700'
                        }`}>
                          Design épuré avec animations fluides
                        </p>
                      </div>
                      
                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'
                      } border`}>
                        <div className="text-xl mb-2">🧠</div>
                        <h4 className={`font-semibold ${
                          theme === 'dark' ? 'text-purple-300' : 'text-purple-800'
                        }`}>
                          IA contextuelle
                        </h4>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-purple-200' : 'text-purple-700'
                        }`}>
                          Réponses adaptées au niveau et au contexte
                        </p>
                      </div>
                    </div>
                    
                    <div className={`mt-6 p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <p className={`text-center ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        👆 Cliquez sur le bouton assistant IA en bas à droite pour tester !
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
        
        {/* Assistant IA (toujours disponible) */}
        <EnhancedAIAssistant
          lessonContext={{
            id: 'demo-improvements',
            title: 'Démonstration des améliorations NextMimo',
            concepts: ['React', 'Animations', 'Gamification', 'UX/UI']
          }}
          currentDifficulty="intermédiaire"
          theme={theme}
        />
      </div>
    </GamificationProvider>
  );
}