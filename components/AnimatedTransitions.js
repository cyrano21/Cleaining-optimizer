// components/AnimatedTransitions.js
import React, { useEffect } from "react";

// Composant pour les animations CSS personnalisées
export default function AnimatedTransitions() {
  useEffect(() => {
    // Ajouter les styles d'animation personnalisés
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.05);
          opacity: 0.8;
        }
      }

      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
          transform: translate3d(0,0,0);
        }
        40%, 43% {
          transform: translate3d(0, -8px, 0);
        }
        70% {
          transform: translate3d(0, -4px, 0);
        }
        90% {
          transform: translate3d(0, -2px, 0);
        }
      }

      @keyframes shake {
        0%, 100% {
          transform: translateX(0);
        }
        10%, 30%, 50%, 70%, 90% {
          transform: translateX(-3px);
        }
        20%, 40%, 60%, 80% {
          transform: translateX(3px);
        }
      }

      @keyframes glow {
        from {
          box-shadow: 0 0 5px rgba(99, 102, 241, 0.5);
        }
        to {
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.8), 0 0 30px rgba(99, 102, 241, 0.6);
        }
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-6px);
        }
      }

      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes gradient {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }

      @keyframes typing {
        from {
          width: 0;
        }
        to {
          width: 100%;
        }
      }

      @keyframes blink {
        0%, 50% {
          opacity: 1;
        }
        51%, 100% {
          opacity: 0;
        }
      }

      /* Classes d'animation */
      .animate-slide-in {
        animation: slideIn 0.3s ease-out;
      }

      .animate-fade-in {
        animation: fadeIn 0.5s ease-out;
      }

      .animate-scale-in {
        animation: scaleIn 0.2s ease-out;
      }

      .animate-pulse-custom {
        animation: pulse 2s infinite;
      }

      .animate-bounce-custom {
        animation: bounce 1s infinite;
      }

      .animate-shake {
        animation: shake 0.5s ease-in-out;
      }

      .animate-glow {
        animation: glow 2s ease-in-out infinite alternate;
      }

      .animate-float {
        animation: float 3s ease-in-out infinite;
      }

      .animate-rotate-slow {
        animation: rotate 3s linear infinite;
      }

      .animate-gradient {
        background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
        background-size: 400% 400%;
        animation: gradient 4s ease infinite;
      }

      .animate-typing {
        overflow: hidden;
        border-right: 2px solid #6366f1;
        white-space: nowrap;
        animation: typing 3s steps(40, end), blink 0.75s step-end infinite;
      }

      /* Transitions personnalisées */
      .transition-all-slow {
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .transition-transform-smooth {
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .transition-colors-smooth {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
      }

      /* Hover effects */
      .hover-lift:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }

      .hover-grow:hover {
        transform: scale(1.05);
      }

      .hover-glow:hover {
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
      }

      .hover-tilt:hover {
        transform: rotate(2deg);
      }

      .hover-bounce:hover {
        animation: bounce 0.6s;
      }

      /* Effets de chargement */
      .loading-spinner {
        border: 3px solid #f3f4f6;
        border-top: 3px solid #6366f1;
        border-radius: 50%;
        animation: rotate 1s linear infinite;
      }

      .loading-dots::after {
        content: '';
        animation: blink 1.4s infinite;
      }

      /* Effets de focus */
      .focus-ring-custom:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        border-color: #6366f1;
      }

      /* Animations de notification */
      .notification-enter {
        animation: slideIn 0.3s ease-out;
      }

      .notification-exit {
        animation: slideIn 0.3s ease-out reverse;
      }

      /* Animations de modal */
      .modal-backdrop {
        animation: fadeIn 0.2s ease-out;
      }

      .modal-content {
        animation: scaleIn 0.3s ease-out;
      }

      /* Responsive animations */
      @media (max-width: 768px) {
        .animate-slide-in {
          animation: fadeIn 0.3s ease-out;
        }
      }

      /* Animations de performance (GPU) */
      .will-animate {
        will-change: transform, opacity;
      }

      .gpu-accelerated {
        transform: translateZ(0);
        backface-visibility: hidden;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null; // Ce composant n'affiche rien, il injecte juste les styles
}

// Hook personnalisé pour les animations
export const useAnimation = (trigger, animationClass) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return isAnimating ? animationClass : '';
};

// Composant wrapper pour les animations
export const AnimatedComponent = ({ 
  children, 
  animation = "animate-fade-in", 
  delay = 0,
  className = "" 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`${isVisible ? animation : 'opacity-0'} ${className}`}>
      {children}
    </div>
  );
};

// Composant pour les transitions de page
export const PageTransition = ({ children, isLoading = false }) => {
  return (
    <div className={`${isLoading ? 'opacity-50' : 'opacity-100'} transition-all-slow`}>
      {children}
    </div>
  );
};

// Composant pour les boutons animés
export const AnimatedButton = ({ 
  children, 
  onClick, 
  className = "", 
  disabled = false,
  loading = false,
  variant = "primary"
}) => {
  const baseClasses = "relative overflow-hidden transition-all-slow hover-lift focus-ring-custom";
  const variantClasses = {
    primary: "bg-indigo-500 hover:bg-indigo-600 text-white",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 loading-spinner"></div>
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};

// Composant pour les cartes animées
export const AnimatedCard = ({ 
  children, 
  className = "", 
  delay = 0,
  hoverEffect = "hover-lift" 
}) => {
  return (
    <AnimatedComponent 
      animation="animate-fade-in" 
      delay={delay}
      className={`bg-white rounded-xl shadow-lg ${hoverEffect} transition-all-slow ${className}`}
    >
      {children}
    </AnimatedComponent>
  );
};