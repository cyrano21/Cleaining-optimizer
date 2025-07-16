"use client";

import { useState } from 'react';

export default function SimpleAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Bonjour ! Je suis votre assistant d'apprentissage. Comment puis-je vous aider ?" }
  ]);
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Ajouter le message de l'utilisateur
    setMessages([...messages, { role: 'user', content: query }]);
    
    // Simuler une réponse simple
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `J'ai bien reçu votre question sur "${query}". Je vous répondrai dès que possible.` 
      }]);
    }, 1000);
    
    setQuery('');
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Bouton de chat */}
      <button 
        onClick={toggleChat}
        className="bg-blue-600 hover:bg-blue-700 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
        style={{ boxShadow: '0 0 15px rgba(37, 99, 235, 0.6)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
      
      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col" style={{ height: '400px' }}>
          {/* Entête */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">Assistant IA</h3>
            <button onClick={toggleChat} className="text-white hover:text-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div 
                  className={`inline-block rounded-lg px-3 py-2 max-w-[80%] ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          
          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 bg-white">
            <div className="flex">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Posez votre question..."
                value={query}
                onChange={handleQueryChange}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
                disabled={!query.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}