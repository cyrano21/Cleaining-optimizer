import React, { useState, useEffect } from 'react';

const Countdown = ({ 
  title = "Limited Time Offer",
  subtitle = "Don't miss out on this amazing deal!",
  targetDate,
  variant = "default",
  showLabels = true,
  size = "medium",
  className = ""
}) => {
  // Date par défaut : 7 jours à partir de maintenant
  const defaultTargetDate = new Date();
  defaultTargetDate.setDate(defaultTargetDate.getDate() + 7);
  
  const finalTargetDate = targetDate ? new Date(targetDate) : defaultTargetDate;
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = finalTargetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [finalTargetDate]);

  const getVariantClasses = () => {
    switch (variant) {
      case 'fashion':
        return 'bg-gradient-to-r from-pink-500 to-purple-600 text-white';
      case 'electronic':
        return 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white';
      case 'cosmetic':
        return 'bg-gradient-to-r from-purple-500 to-pink-600 text-white';
      case 'dark':
        return 'bg-gray-900 text-white';
      case 'light':
        return 'bg-white text-gray-900 border border-gray-200';
      default:
        return 'bg-red-500 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'py-8',
          title: 'text-xl md:text-2xl',
          subtitle: 'text-sm',
          timeBox: 'w-12 h-12 text-lg',
          label: 'text-xs'
        };
      case 'large':
        return {
          container: 'py-20 md:py-24',
          title: 'text-4xl md:text-5xl',
          subtitle: 'text-lg md:text-xl',
          timeBox: 'w-20 h-20 md:w-24 md:h-24 text-2xl md:text-3xl',
          label: 'text-sm'
        };
      default:
        return {
          container: 'py-12 md:py-16',
          title: 'text-2xl md:text-3xl',
          subtitle: 'text-base',
          timeBox: 'w-16 h-16 md:w-20 md:h-20 text-xl md:text-2xl',
          label: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const TimeBox = ({ value, label }) => (
    <div className="text-center">
      <div className={`${sizeClasses.timeBox} bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center font-bold mb-2`}>
        {String(value).padStart(2, '0')}
      </div>
      {showLabels && (
        <div className={`${sizeClasses.label} font-medium opacity-90`}>
          {label}
        </div>
      )}
    </div>
  );

  if (isExpired) {
    return (
      <section className={`${sizeClasses.container} ${getVariantClasses()} ${className}`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className={`${sizeClasses.title} font-bold mb-4`}>
            Offer Expired
          </h2>
          <p className={`${sizeClasses.subtitle} opacity-90`}>
            This promotion has ended, but don't worry - new deals are coming soon!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`${sizeClasses.container} ${getVariantClasses()} ${className}`}>
      <div className="container mx-auto px-4 text-center">
        <h2 className={`${sizeClasses.title} font-bold mb-4`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`${sizeClasses.subtitle} opacity-90 mb-8`}>
            {subtitle}
          </p>
        )}
        
        <div className="flex justify-center items-center space-x-4 md:space-x-6">
          <TimeBox value={timeLeft.days} label="Days" />
          <div className="text-2xl font-bold opacity-75">:</div>
          <TimeBox value={timeLeft.hours} label="Hours" />
          <div className="text-2xl font-bold opacity-75">:</div>
          <TimeBox value={timeLeft.minutes} label="Minutes" />
          <div className="text-2xl font-bold opacity-75">:</div>
          <TimeBox value={timeLeft.seconds} label="Seconds" />
        </div>
        
        <div className="mt-8">
          <button className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg">
            Shop Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default Countdown;
