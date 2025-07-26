"use client";

import React, { useState } from 'react';

export default function Newsletter({ title = "Stay Updated", description = "Subscribe to our newsletter and get the latest updates, offers, and insights delivered to your inbox." }) {
  const placeholder = "Enter your email address";
  const buttonText = "Subscribe";
  const variant = "default";
  const layout = "horizontal";
  const showPrivacyNote = true;
  const className = "";
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const getVariantClasses = () => {
    switch (variant) {
      case 'fashion':
        return 'bg-gradient-to-r from-pink-500 to-purple-600';
      case 'electronic':
        return 'bg-gradient-to-r from-blue-600 to-indigo-700';
      case 'cosmetic':
        return 'bg-gradient-to-r from-purple-500 to-pink-600';
      case 'dark':
        return 'bg-gray-900';
      default:
        return 'bg-gray-900';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Simulation de l'envoi
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail('');
    }, 1000);
  };

  if (isSubscribed) {
    return (
      <section className={`py-16 md:py-20 ${getVariantClasses()} ${className}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Thank You!
            </h2>
            <p className="text-lg text-white/90">
              You've successfully subscribed to our newsletter. Check your inbox for confirmation.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 md:py-20 ${getVariantClasses()} ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {layout === 'vertical' ? (
            // Layout vertical
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {title}
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                {description}
              </p>
              
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={placeholder}
                    className="px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Subscribing...' : buttonText}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // Layout horizontal
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {title}
                </h2>
                <p className="text-lg text-white/90">
                  {description}
                </p>
              </div>
              
              <div>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isSubmitting ? 'Subscribing...' : buttonText}
                  </button>
                </form>
              </div>
            </div>
          )}
          
          {showPrivacyNote && (
            <p className="text-sm text-white/70 text-center mt-6">
              By subscribing, you agree to our{' '}
              <a href="/privacy" className="underline hover:text-white transition-colors">
                Privacy Policy
              </a>{' '}
              and consent to receive updates from our company.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}