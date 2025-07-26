import React from 'react';

const Marquee = ({ 
  items = [],
  direction = "left",
  speed = "normal",
  variant = "default",
  showIcon = true,
  className = ""
}) => {
  // Données par défaut pour la démonstration
  const defaultItems = [
    { id: 1, text: "Free Shipping on Orders Over $50", icon: "🚚" },
    { id: 2, text: "24/7 Customer Support", icon: "💬" },
    { id: 3, text: "30-Day Money Back Guarantee", icon: "💰" },
    { id: 4, text: "Secure Payment Methods", icon: "🔒" },
    { id: 5, text: "Premium Quality Products", icon: "⭐" },
    { id: 6, text: "Fast & Reliable Delivery", icon: "⚡" }
  ];

  const marqueeItems = items.length > 0 ? items : defaultItems;

  const getVariantClasses = () => {
    switch (variant) {
      case 'fashion':
        return 'bg-pink-500 text-white';
      case 'electronic':
        return 'bg-blue-600 text-white';
      case 'cosmetic':
        return 'bg-purple-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-gray-900';
      case 'dark':
        return 'bg-gray-900 text-white';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const getSpeedClass = () => {
    switch (speed) {
      case 'slow':
        return 'animate-marquee-slow';
      case 'fast':
        return 'animate-marquee-fast';
      default:
        return 'animate-marquee';
    }
  };

  const getDirectionClass = () => {
    return direction === 'right' ? 'animate-marquee-reverse' : '';
  };

  return (
    <div className={`relative overflow-hidden py-3 ${getVariantClasses()} ${className}`}>
      <div className={`flex whitespace-nowrap ${getSpeedClass()} ${getDirectionClass()}`}>
        {/* Premier ensemble d'éléments */}
        <div className="flex items-center space-x-8 px-4">
          {marqueeItems.map((item) => (
            <div key={`first-${item.id}`} className="flex items-center space-x-2 text-sm font-medium">
              {showIcon && item.icon && (
                <span className="text-lg">{item.icon}</span>
              )}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
        
        {/* Séparateur */}
        <div className="mx-8 text-gray-400">•</div>
        
        {/* Deuxième ensemble d'éléments (pour la continuité) */}
        <div className="flex items-center space-x-8 px-4">
          {marqueeItems.map((item) => (
            <div key={`second-${item.id}`} className="flex items-center space-x-2 text-sm font-medium">
              {showIcon && item.icon && (
                <span className="text-lg">{item.icon}</span>
              )}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Styles CSS personnalisés */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes marquee-reverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        
        .animate-marquee-slow {
          animation: marquee 30s linear infinite;
        }
        
        .animate-marquee-fast {
          animation: marquee 10s linear infinite;
        }
        
        .animate-marquee-reverse {
          animation: marquee-reverse 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Marquee;
