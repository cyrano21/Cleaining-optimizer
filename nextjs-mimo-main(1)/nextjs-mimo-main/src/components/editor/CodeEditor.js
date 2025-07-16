'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import CodePreviewSandbox from './CodePreviewSandbox';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Thème sombre par défaut
import 'prismjs/themes/prism.css'; // Thème clair

// Importer les langages nécessaires
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';

// Mappage des langages Prism
const PRISM_LANGUAGES = {
  javascript: 'javascript',
  js: 'javascript',
  jsx: 'jsx',
  typescript: 'typescript',
  ts: 'typescript',
  tsx: 'tsx',
  css: 'css',
  html: 'markup',
  markup: 'markup',
  react: 'jsx',
  default: 'javascript'
};

export default function CodeEditor({ 
  initialCode = '', 
  language = 'javascript',
  height = '400px',
  onCodeChange,
  onCodeRun,
  readOnly = false,
  showPreview = true,
  autoPreview = true,
  theme: parentTheme = 'light'
}) {
  const [code, setCode] = useState(initialCode);
  const [previewCode, setPreviewCode] = useState(initialCode);
  const [previewVisible, setPreviewVisible] = useState(showPreview);
  const [splitView, setSplitView] = useState(true);
  const [localTheme, setLocalTheme] = useState(parentTheme);
  const [isMobile, setIsMobile] = useState(false);
  const codeElementRef = useRef(null);
  const preElementRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Détecter la taille de l'écran
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  // Synchroniser le thème avec le thème parent lorsqu'il change
  useEffect(() => {
    setLocalTheme(parentTheme);
    // Re-syntax highlighting lorsque le thème change
    if (codeElementRef.current) {
      Prism.highlightElement(codeElementRef.current);
    }
  }, [parentTheme, code]);
  
  // Mettre à jour la coloration syntaxique lorsque le code ou le langage change
  useEffect(() => {
    if (codeElementRef.current) {
      Prism.highlightElement(codeElementRef.current);
    }
  }, [code, language]);
  
  // Gérer le défilement synchronisé entre le textarea et le code mis en surbrillance
  const handleScroll = (e) => {
    if (preElementRef.current && textareaRef.current) {
      preElementRef.current.scrollTop = e.target.scrollTop;
      preElementRef.current.scrollLeft = e.target.scrollLeft;
    }
  };
  
  // Gérer la mise en forme du code lors de la frappe de tabulation
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      
      // Insérer deux espaces à la position du curseur
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      
      // Déplacer le curseur après les espaces insérés
      setTimeout(() => {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
      }, 0);
    }
  };
  
  // Auto-format le code
  const formatCode = () => {
    try {
      let formattedCode = code;
      
      // Formatage basique JavaScript
      if (language === 'javascript' || language === 'js') {
        // Ajouter des espaces autour des opérateurs
        formattedCode = formattedCode
          .replace(/([^=!<>])=([^=])/g, '$1 = $2')
          .replace(/([^=])===?([^=])/g, '$1 === $2')
          .replace(/([^!])!==?([^=])/g, '$1 !== $2')
          // Espaces autour des accolades
          .replace(/\{([^\s}])/g, '{ $1')
          .replace(/([^\s{])\}/g, '$1 }')
          // Indentation basique
          .split('\n')
          .map(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('}')) {
              return trimmed;
            }
            if (trimmed.includes('{') && !trimmed.startsWith('{')) {
              return '  ' + trimmed;
            }
            return trimmed;
          })
          .join('\n');
      }
      
      setCode(formattedCode);
      if (onCodeChange) onCodeChange(formattedCode);
    } catch (error) {
      console.warn('Erreur lors du formatage du code:', error);
    }
  };
  
  // Fonction pour obtenir la classe de langage Prism appropriée
  const getPrismLanguage = (lang) => {
    return PRISM_LANGUAGES[lang] || PRISM_LANGUAGES.default;
  };
  
  const prismLanguage = getPrismLanguage(language);
  
  // Mettre à jour le code de prévisualisation automatiquement ou lors de l'exécution manuelle
  useEffect(() => {
    if (autoPreview) {
      const timer = setTimeout(() => {
        setPreviewCode(code);
      }, 800); // Réduit le délai pour une meilleure réactivité
      
      return () => clearTimeout(timer);
    }
  }, [code, autoPreview]);
  
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onCodeChange) onCodeChange(newCode);
  };
  
  const handleRunCode = () => {
    setPreviewCode(code);
    if (onCodeRun) onCodeRun(code);
  };
  
  const handleReset = () => {
    setCode(initialCode);
    setPreviewCode(initialCode);
    if (onCodeChange) onCodeChange(initialCode);
  };
  
  const togglePreview = () => {
    setPreviewVisible(!previewVisible);
  };
  
  const toggleSplitView = () => {
    setSplitView(!splitView);
  };
  
  const toggleTheme = () => {
    const newTheme = localTheme === 'light' ? 'dark' : 'light';
    setLocalTheme(newTheme);
    
    // Si l'application utilise localStorage pour le thème, optionnel
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };
  
  // Utiliser localTheme pour tous les styles conditionnels
  const theme = localTheme;
  
  // Déterminer le layout adaptatif
  const shouldStack = isMobile || !splitView;
  const editorHeight = shouldStack && previewVisible ? 'calc(50vh - 60px)' : height;
  const previewHeight = shouldStack ? 'calc(50vh - 60px)' : height;

  return (
    <div className={`w-full rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      {/* Barre d'outils améliorée */}
      <div className={`flex items-center justify-between px-3 md:px-4 py-2 border-b ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
      }`}>
        <div className="flex items-center space-x-2">
          <span className={`text-xs md:text-sm font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </span>
          
          {!readOnly && (
            <div className="flex space-x-1">
              <button
                onClick={handleRunCode}
                className="px-2 md:px-3 py-1 bg-green-600 text-white text-xs md:text-sm rounded hover:bg-green-700 transition-colors"
              >
                {isMobile ? '▶' : 'Exécuter'}
              </button>
              
              <button
                onClick={formatCode}
                className="px-2 md:px-3 py-1 bg-blue-600 text-white text-xs md:text-sm rounded hover:bg-blue-700 transition-colors"
              >
                {isMobile ? '🎨' : 'Formater'}
              </button>
              
              <button
                onClick={handleReset}
                className="px-2 md:px-3 py-1 bg-gray-600 text-white text-xs md:text-sm rounded hover:bg-gray-700 transition-colors"
              >
                {isMobile ? '↺' : 'Reset'}
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={togglePreview}
            className={`p-1.5 md:p-2 rounded ${
              theme === 'dark'
                ? (previewVisible ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300')
                : (previewVisible ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600')
            }`}
            title={previewVisible ? 'Masquer la prévisualisation' : 'Afficher la prévisualisation'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          {previewVisible && !isMobile && (
            <button
              onClick={toggleSplitView}
              className={`p-1.5 md:p-2 rounded ${
                theme === 'dark'
                  ? (splitView ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300')
                  : (splitView ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600')
              }`}
              title={splitView ? 'Vue empilée' : 'Vue côte à côte'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                {splitView ? (
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v5h-2V6H5v8h10v-3h2v5a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" clipRule="evenodd" />
                )}
              </svg>
            </button>
          )}
          
          <button
            onClick={toggleTheme}
            className={`p-1.5 md:p-2 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
            title={theme === 'light' ? 'Thème sombre' : 'Thème clair'}
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Contenu de l'éditeur avec responsive layout */}
      <div className={`flex ${shouldStack ? 'flex-col' : 'flex-row'}`}>
        {/* Zone d'édition de code */}
        <div className={`${shouldStack ? 'w-full' : (previewVisible ? 'w-1/2' : 'w-full')}`}>
          <div className="relative" style={{ height: editorHeight }}>
            <div className="absolute inset-0 flex">
              {/* Numéros de ligne */}
              <div className={`w-8 md:w-10 text-right pr-1 md:pr-2 pt-2 select-none font-mono text-xs ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                {code.split('\n').map((_, i) => (
                  <div key={i} className="leading-5 min-h-[20px]">
                    {i + 1}
                  </div>
                ))}
              </div>
              
              {/* Conteneur de l'éditeur avec superposition */}
              <div className="relative flex-1 overflow-hidden">
                {/* Zone de texte pour la saisie */}
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={handleCodeChange}
                  onScroll={handleScroll}
                  onKeyDown={handleKeyDown}
                  className={`absolute inset-0 p-2 pt-2 font-mono text-sm resize-none focus:outline-none leading-5 bg-transparent text-transparent caret-current z-10`}
                  style={{
                    height: '100%',
                    width: '100%',
                    whiteSpace: 'pre',
                    overflow: 'auto',
                    tabSize: 2,
                    caretColor: theme === 'dark' ? '#ffffff' : '#000000',
                  }}
                  readOnly={readOnly}
                  spellCheck="false"
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  data-gramm="false"
                />
                
                {/* Affichage du code avec coloration syntaxique */}
                <pre 
                  ref={preElementRef}
                  className={`absolute inset-0 p-2 pt-2 font-mono text-sm leading-5 overflow-auto m-0 ${
                    theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                  }`}
                  style={{
                    pointerEvents: 'none',
                    height: '100%',
                    width: '100%',
                  }}
                >
                  <code 
                    ref={codeElementRef}
                    className={`language-${prismLanguage}`}
                    style={{
                      fontSize: isMobile ? '12px' : '14px',
                      lineHeight: '20px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {code}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
        
        {/* Zone de prévisualisation */}
        {previewVisible && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${shouldStack ? 'w-full border-t' : 'w-1/2 border-l'} ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}
            style={{ height: previewHeight }}
          >
            <div className={`p-2 md:p-4 h-full overflow-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="h-full">
                <CodePreviewSandbox 
                  code={previewCode} 
                  language={language} 
                  height="100%"
                  theme={theme}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}