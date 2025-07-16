// Filtre les erreurs de console non critiques en développement
const IGNORED_ERRORS = [
  'Cannot find menu item with id',
  'A listener indicated an asynchronous response',
  'preload but not used within a few seconds'
];

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

export function setupConsoleFilters() {
  if (process.env.NODE_ENV !== 'development') return;

  console.error = (...args) => {
    const message = args[0]?.message || args[0] || '';
    const shouldIgnore = IGNORED_ERRORS.some(ignored => 
      message.includes(ignored)
    );
    
    if (!shouldIgnore) {
      originalConsoleError.apply(console, args);
    }
  };

  console.warn = (...args) => {
    const message = args[0] || '';
    const shouldIgnore = IGNORED_ERRORS.some(ignored => 
      message.includes(ignored)
    );
    
    if (!shouldIgnore) {
      originalConsoleWarn.apply(console, args);
    }
  };

  // Nettoyage si le composant est démonté
  return () => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  };
}

// Initialisation immédiate si dans le navigateur
if (typeof window !== 'undefined') {
  setupConsoleFilters();
}
