"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CodePreviewSandbox({ code, language, height = "300px", theme = "light" }) {
  const [iframeContent, setIframeContent] = useState('');
  const [error, setError] = useState(null);
  const [output, setOutput] = useState([]);
  
  useEffect(() => {
    if (!code) {
      setIframeContent('');
      setOutput([]);
      return;
    }
    
    try {
      let content = '';
      
      if (language === 'html' || language === 'jsx') {
        // Pour HTML ou JSX, on peut directement afficher le code
        content = code;
      } else if (language === 'css') {
        // Pour CSS, on l'enveloppe dans une balise style avec plus d'exemples
        content = `
          <style>${code}</style>
          <div class="css-preview">
            <h3>Aperçu CSS</h3>
            <div class="demo-container">
              <div class="demo-element">Élément avec style appliqué</div>
              <button class="demo-button">Bouton de démonstration</button>
              <p class="demo-text">Texte de démonstration</p>
              <div class="demo-box">
                <span>Contenu de la boîte</span>
              </div>
            </div>
          </div>
        `;
      } else if (language === 'javascript') {
        // Pour JavaScript, créer un environnement plus robuste
        content = `
          <div class="js-output">
            <div class="output-header">
              <h4>Résultat :</h4>
              <div class="output-controls">
                <button onclick="clearOutput()" class="clear-btn">Effacer</button>
              </div>
            </div>
            <div id="output" class="output-content"></div>
            <div id="errors" class="error-content"></div>
          </div>
          <script>
            let outputCount = 0;
            const output = document.getElementById('output');
            const errors = document.getElementById('errors');
            
            function clearOutput() {
              output.innerHTML = '';
              errors.innerHTML = '';
              outputCount = 0;
            }
            
            // Sauvegarder les méthodes console originales
            const originalConsole = {
              log: console.log,
              error: console.error,
              warn: console.warn,
              info: console.info
            };
            
            // Rediriger console.log vers notre div output avec meilleur formatage
            console.log = function(...args) {
              originalConsole.log.apply(console, args);
              outputCount++;
              
              const resultDiv = document.createElement('div');
              resultDiv.className = 'output-line';
              
              const content = args.map(arg => {
                if (typeof arg === 'object' && arg !== null) {
                  try {
                    return JSON.stringify(arg, null, 2);
                  } catch(e) {
                    return String(arg);
                  }
                } else if (typeof arg === 'string') {
                  return arg;
                } else {
                  return String(arg);
                }
              }).join(' ');
              
              resultDiv.innerHTML = \`<span class="line-number">\${outputCount}:</span> <span class="output-text">\${content}</span>\`;
              output.appendChild(resultDiv);
              output.scrollTop = output.scrollHeight;
            };
            
            console.error = function(...args) {
              originalConsole.error.apply(console, args);
              const errorDiv = document.createElement('div');
              errorDiv.className = 'error-line';
              errorDiv.textContent = '❌ Erreur: ' + args.join(' ');
              errors.appendChild(errorDiv);
            };
            
            console.warn = function(...args) {
              originalConsole.warn.apply(console, args);
              const warnDiv = document.createElement('div');
              warnDiv.className = 'warn-line';
              warnDiv.textContent = '⚠️ Avertissement: ' + args.join(' ');
              errors.appendChild(warnDiv);
            };
            
            try {
              // Fonction utilitaire pour afficher des résultats
              function show(result) {
                console.log(result);
              }
              
              // Fonction pour créer des éléments DOM facilement
              function createElement(tag, props = {}, ...children) {
                const element = document.createElement(tag);
                Object.assign(element, props);
                children.forEach(child => {
                  if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                  } else {
                    element.appendChild(child);
                  }
                });
                return element;
              }
              
              // Exécuter le code utilisateur dans un try-catch
              ${code}
              
            } catch (error) {
              console.error(error.message);
              console.error('Ligne: ' + (error.lineNumber || 'inconnue'));
            }
          </script>
        `;
      } else if (language === 'react') {
        // Pour React, environnement plus moderne
        content = `
          <div id="root"></div>
          <div id="error-boundary"></div>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script type="text/babel">
            try {
              const { useState, useEffect, useCallback, useMemo } = React;
              
              ${code}
              
              // Auto-render si aucun ReactDOM.render n'est détecté
              if (!${JSON.stringify(code)}.includes('ReactDOM.render') && !${JSON.stringify(code)}.includes('createRoot')) {
                const componentMatches = ${JSON.stringify(code)}.match(/(?:function|const)\\s+([A-Z][a-zA-Z0-9]*)/g);
                if (componentMatches) {
                  const lastComponentMatch = componentMatches[componentMatches.length - 1];
                  const componentName = lastComponentMatch.match(/(?:function|const)\\s+([A-Z][a-zA-Z0-9]*)/)[1];
                  
                  if (typeof window[componentName] !== 'undefined' || typeof eval(componentName) !== 'undefined') {
                    const ComponentToRender = eval(componentName);
                    ReactDOM.render(React.createElement(ComponentToRender), document.getElementById('root'));
                  }
                }
              }
            } catch (error) {
              const errorDiv = document.createElement('div');
              errorDiv.className = 'error';
              errorDiv.innerHTML = \`
                <h4>❌ Erreur React</h4>
                <p><strong>Message:</strong> \${error.message}</p>
                <p><strong>Ligne:</strong> \${error.lineNumber || 'inconnue'}</p>
                <details>
                  <summary>Stack trace</summary>
                  <pre>\${error.stack || 'Non disponible'}</pre>
                </details>
              \`;
              document.getElementById('error-boundary').appendChild(errorDiv);
            }
          </script>
        `;
      }
      
      // Créer un document HTML complet avec thème adaptatif
      const themeStyles = theme === 'dark' ? `
        body {
          background-color: #1f2937;
          color: #f9fafb;
        }
        .output-content {
          background-color: #374151;
          color: #f9fafb;
        }
        .output-header {
          background-color: #4b5563;
          color: #f9fafb;
        }
        .demo-element, .demo-button, .demo-box {
          background-color: #374151;
          color: #f9fafb;
          border-color: #6b7280;
        }
      ` : `
        body {
          background-color: #ffffff;
          color: #1f2937;
        }
        .output-content {
          background-color: #f9fafb;
          color: #1f2937;
        }
        .output-header {
          background-color: #f3f4f6;
          color: #1f2937;
        }
        .demo-element, .demo-button, .demo-box {
          background-color: #ffffff;
          color: #1f2937;
          border-color: #d1d5db;
        }
      `;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                margin: 0;
                padding: 12px;
                font-size: 14px;
                line-height: 1.5;
              }
              
              ${themeStyles}
              
              .js-output {
                height: 100%;
                display: flex;
                flex-direction: column;
              }
              
              .output-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                border-radius: 6px 6px 0 0;
                border-bottom: 1px solid #e5e7eb;
                font-size: 12px;
              }
              
              .output-header h4 {
                margin: 0;
                font-size: 13px;
                font-weight: 600;
              }
              
              .clear-btn {
                background: #ef4444;
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                cursor: pointer;
                transition: background-color 0.2s;
              }
              
              .clear-btn:hover {
                background: #dc2626;
              }
              
              .output-content {
                flex: 1;
                padding: 12px;
                border-radius: 0 0 6px 6px;
                overflow-y: auto;
                max-height: calc(100% - 40px);
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 12px;
                white-space: pre-wrap;
                word-break: break-word;
              }
              
              .output-line {
                margin: 4px 0;
                display: flex;
                align-items: flex-start;
              }
              
              .line-number {
                color: #6b7280;
                margin-right: 8px;
                font-weight: 500;
                min-width: 20px;
              }
              
              .output-text {
                flex: 1;
                word-break: break-word;
              }
              
              .error-content {
                color: #ef4444;
                font-family: monospace;
                font-size: 12px;
                padding: 8px;
                background-color: #fef2f2;
                border-radius: 4px;
                margin-top: 8px;
              }
              
              .error-line, .warn-line {
                margin: 4px 0;
                padding: 4px 8px;
                border-radius: 4px;
              }
              
              .error-line {
                background-color: #fef2f2;
                color: #dc2626;
                border-left: 3px solid #ef4444;
              }
              
              .warn-line {
                background-color: #fffbeb;
                color: #d97706;
                border-left: 3px solid #f59e0b;
              }
              
              .css-preview {
                padding: 16px;
              }
              
              .css-preview h3 {
                margin-top: 0;
                margin-bottom: 16px;
                font-size: 18px;
                font-weight: 600;
              }
              
              .demo-container {
                display: flex;
                flex-direction: column;
                gap: 12px;
                align-items: flex-start;
              }
              
              .demo-element {
                padding: 16px;
                border: 2px solid #d1d5db;
                border-radius: 8px;
                min-width: 200px;
              }
              
              .demo-button {
                padding: 8px 16px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                cursor: pointer;
                background: #f9fafb;
                transition: all 0.2s;
              }
              
              .demo-button:hover {
                background: #f3f4f6;
                transform: translateY(-1px);
              }
              
              .demo-text {
                margin: 8px 0;
                font-size: 16px;
              }
              
              .demo-box {
                padding: 20px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                min-height: 60px;
                min-width: 120px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f9fafb;
              }
              
              .error {
                background-color: #fef2f2;
                color: #dc2626;
                padding: 16px;
                border-radius: 8px;
                border: 1px solid #f87171;
                margin: 8px 0;
              }
              
              .error h4 {
                margin-top: 0;
                margin-bottom: 8px;
              }
              
              .error details {
                margin-top: 8px;
              }
              
              .error summary {
                cursor: pointer;
                font-weight: 500;
              }
              
              .error pre {
                background-color: #1f2937;
                color: #f9fafb;
                padding: 8px;
                border-radius: 4px;
                overflow-x: auto;
                font-size: 11px;
                margin-top: 8px;
              }
              
              @media (max-width: 768px) {
                body {
                  padding: 8px;
                  font-size: 13px;
                }
                
                .demo-container {
                  gap: 8px;
                }
                
                .demo-element {
                  min-width: auto;
                  width: 100%;
                  padding: 12px;
                }
                
                .output-content {
                  font-size: 11px;
                }
                
                .css-preview h3 {
                  font-size: 16px;
                }
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `;
      
      setIframeContent(htmlContent);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erreur dans CodePreviewSandbox:', err);
    }
  }, [code, language, theme]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full rounded-md overflow-hidden border border-gray-200 dark:border-gray-700"
      style={{ height }}
    >
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 h-full overflow-auto">
          <h4 className="font-semibold mb-2">❌ Erreur de prévisualisation</h4>
          <p className="text-sm">{error}</p>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm font-medium">Détails techniques</summary>
            <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-x-auto">
              {error}
            </pre>
          </details>
        </div>
      ) : (
        <iframe
          srcDoc={iframeContent}
          title="Prévisualisation du code"
          className="w-full h-full"
          sandbox="allow-scripts allow-modals"
          loading="lazy"
        />
      )}
    </motion.div>
  );
}