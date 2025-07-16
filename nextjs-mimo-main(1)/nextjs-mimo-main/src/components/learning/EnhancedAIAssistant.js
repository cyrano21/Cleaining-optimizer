"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EnhancedAIAssistant({ 
  lessonContext = {}, 
  currentDifficulty = null,
  theme = 'light'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([
    {
      role: 'assistant',
      content: "Salut ! 👋 Je suis votre assistant d'apprentissage IA nouvelle génération. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [quickActions, setQuickActions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);
  
  // Actions rapides contextuelles
  useEffect(() => {
    const actions = getContextualQuickActions();
    setQuickActions(actions);
  }, [currentDifficulty, lessonContext]);
  
  const getContextualQuickActions = () => {
    const baseActions = [
      { icon: "💡", text: "Explique ce concept", query: "Peux-tu m'expliquer ce concept en détail ?" },
      { icon: "🔧", text: "Débugger ce code", query: "J'ai un problème avec ce code, peux-tu m'aider ?" },
      { icon: "📝", text: "Exercice pratique", query: "Donne-moi un exercice pratique sur ce sujet" },
      { icon: "🚀", text: "Aller plus loin", query: "Comment puis-je approfondir ce sujet ?" }
    ];
    
    // Actions spécifiques selon la difficulté
    if (currentDifficulty === 'avancé' || currentDifficulty === 'expert') {
      baseActions.push(
        { icon: "⚡", text: "Optimisation", query: "Comment optimiser cette solution ?" },
        { icon: "🏗️", text: "Architecture", query: "Quelle architecture recommandes-tu ?" }
      );
    }
    
    // Actions spécifiques selon le contexte de la leçon
    if (lessonContext.id?.includes('react')) {
      baseActions.push(
        { icon: "⚛️", text: "Pattern React", query: "Quel pattern React convient le mieux ici ?" }
      );
    }
    
    return baseActions.slice(0, 6); // Limiter à 6 actions
  };
  
  const toggleAssistant = () => {
    setIsOpen(!isOpen);
    if (!isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };
  
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const handleQuickAction = (action) => {
    setQuery(action.query);
    textareaRef.current?.focus();
  };
  
  const simulateTyping = async (message) => {
    setIsTyping(true);
    
    // Simuler une réponse de l'IA (en attendant une vraie intégration)
    const responses = [
      "Excellente question ! Laissez-moi vous expliquer...",
      "Je vois ce que vous voulez dire. Voici une approche recommandée...",
      "C'est un concept important. Permettez-moi de vous guider...",
      "Voici une explication détaillée avec des exemples pratiques...",
      "Je vais vous donner une réponse complète avec du code d'exemple..."
    ];
    
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const response = responses[Math.floor(Math.random() * responses.length)] + 
      ` Pour votre question "${message}", voici ma recommandation basée sur les meilleures pratiques...`;
    
    setIsTyping(false);
    return response;
  };
  
  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    const userMessage = { 
      role: 'user', 
      content: query,
      timestamp: new Date().toISOString()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setIsLoading(true);
    const currentQuery = query;
    setQuery('');
    
    try {
      // Pour la démo, on simule une réponse
      const response = await simulateTyping(currentQuery);
      
      const assistantMessage = { 
        role: 'assistant', 
        content: response,
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = {
        role: 'assistant',
        content: "Désolé, je rencontre des difficultés techniques. Pouvez-vous réessayer ?",
        timestamp: new Date().toISOString()
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Animation variants
  const buttonVariants = {
    hover: { scale: 1.05, rotate: 5 },
    tap: { scale: 0.95 }
  };
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };
  
  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <>
      {/* Bouton flottant amélioré */}
      <motion.button
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-xl flex items-center justify-center z-[9999] ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
            : 'bg-gradient-to-r from-indigo-500 to-purple-500'
        } text-white relative overflow-hidden`}
        onClick={toggleAssistant}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        aria-label="Ouvrir l'assistant IA"
      >
        {/* Animation de fond */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-white rounded-full"
        />
        
        {/* Icône avec animation */}
        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
            </svg>
          )}
        </motion.div>
        
        {/* Indicateur de notification */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: conversation.length > 1 ? 1 : 0 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
        >
          <span className="text-xs text-white font-bold">!</span>
        </motion.div>
      </motion.button>
      
      {/* Interface de l'assistant améliorée */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}
            style={{ maxHeight: 'calc(100vh - 150px)' }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* En-tête moderne */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                  >
                    🤖
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg">Assistant IA</h3>
                    <p className="text-xs text-indigo-200">Propulsé par GPT-4</p>
                  </div>
                </div>
                
                <button
                  onClick={toggleAssistant}
                  className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Actions rapides */}
            <div className={`p-3 border-b ${
              theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'
            }`}>
              <p className={`text-xs font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Actions rapides :
              </p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{action.icon}</span>
                    <span>{action.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Conversation */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <AnimatePresence>
                {conversation.map((message, index) => (
                  <motion.div
                    key={index}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      {message.role === 'assistant' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                            🤖
                          </div>
                          <span className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Assistant IA
                          </span>
                        </div>
                      )}
                      
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                          : theme === 'dark'
                            ? 'bg-gray-700 text-gray-200 border border-gray-600'
                            : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                        
                        <div className={`text-xs mt-2 ${
                          message.role === 'user'
                            ? 'text-indigo-100'
                            : theme === 'dark'
                              ? 'text-gray-500'
                              : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Indicateur de frappe */}
              <AnimatePresence>
                {(isLoading || isTyping) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-start"
                  >
                    <div className={`rounded-2xl px-4 py-3 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border border-gray-600' 
                        : 'bg-white border border-gray-200 shadow-sm'
                    }`}>
                      <div className="flex space-x-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                            className={`w-2 h-2 rounded-full ${
                              theme === 'dark' ? 'bg-gray-400' : 'bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Zone de saisie améliorée */}
            <div className={`border-t p-4 ${
              theme === 'dark' 
                ? 'border-gray-700 bg-gray-800' 
                : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    className={`w-full min-h-[44px] max-h-32 p-3 pr-12 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    } border`}
                    placeholder="Tapez votre question..."
                    value={query}
                    onChange={handleQueryChange}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    rows={1}
                  />
                  
                  {/* Compteur de caractères */}
                  <div className={`absolute bottom-1 right-1 text-xs ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {query.length}/500
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl transition-colors ${
                    isLoading || !query.trim()
                      ? theme === 'dark'
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
                  }`}
                  onClick={handleSubmit}
                  disabled={isLoading || !query.trim()}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </motion.div>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </motion.button>
              </div>
              
              <p className={`mt-2 text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                💡 Astuce : Soyez spécifique dans vos questions pour obtenir de meilleures réponses
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}