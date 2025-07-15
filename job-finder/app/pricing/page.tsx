'use client'

import { useEffect, useState } from 'react'
import PricingPlans from '../modules/pricing/components/PricingPlans'
import { SubscriptionProvider } from '../modules/pricing/utils/subscription-context'

export default function PricingPage() {
  const [animateIn, setAnimateIn] = useState(false);
  
  // Animation effect when component mounts
  useEffect(() => {
    setAnimateIn(true);
  }, []);

  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-20 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-40 right-40 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
        </div>
        
        <div className="container mx-auto py-8 px-4 transition-all duration-500 ease-in-out relative z-10">
          <div className={`transition-all duration-700 transform ${animateIn ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
            <PricingPlans />
          </div>
        </div>
      </div>
    </SubscriptionProvider>
  )
}
