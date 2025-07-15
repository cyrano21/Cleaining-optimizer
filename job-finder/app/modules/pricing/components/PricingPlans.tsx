'use client'

import { useState } from 'react'
import { pricingPlans, PricingPlan } from '../utils/plans'

interface PricingCardProps {
  plan: PricingPlan
  onSelectPlan: (plan: PricingPlan) => void
  isAnnual: boolean
}

function PricingCard({ plan, onSelectPlan, isAnnual }: PricingCardProps) {
  const actualPrice = isAnnual ? Math.round(plan.price * 12 * 0.8) / 12 : plan.price
  const annualSavings = plan.price > 0 ? Math.round(plan.price * 12 * 0.2) : 0
  
  return (
    <div className={`relative p-8 rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${
      plan.popular 
        ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 scale-105' 
        : 'bg-white/90 border border-gray-200 hover:border-blue-200'
    }`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 text-sm font-bold uppercase rounded-full shadow-lg">
            {plan.badge || 'Populaire'}
          </span>
        </div>
      )}
      
      {plan.badge && !plan.popular && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 text-xs font-bold uppercase rounded-full shadow-lg transform rotate-12">
          {plan.badge}
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className={`text-2xl font-bold mb-2 ${
          plan.popular 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent' 
            : 'text-gray-800'
        }`}>
          {plan.name}
        </h3>
        <p className="text-gray-600 leading-relaxed">{plan.description}</p>
      </div>
      
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center mb-2">
          <span className={`text-5xl font-bold ${
            plan.popular 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent' 
              : 'text-gray-800'
          }`}>
            {actualPrice}€
          </span>
          {plan.price > 0 && (
            <span className="text-gray-500 ml-2">/mois</span>
          )}
        </div>
        
        {isAnnual && annualSavings > 0 && (
          <div className="text-center">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
              Économisez {annualSavings}€/an
            </span>
          </div>
        )}
        
        {plan.price > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            {isAnnual ? 'Facturé annuellement' : 'Facturé mensuellement'}
          </p>
        )}
      </div>
      
      <ul className="mb-8 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${
              plan.popular ? 'text-indigo-500' : 'text-green-500'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="text-gray-700 leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>
      
      <button
        onClick={() => onSelectPlan(plan)}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center ${
          plan.price === 0
            ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-2 border-gray-200 hover:border-gray-300'
            : plan.popular
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
        }`}
      >
        {plan.price === 0 ? 'Commencer gratuitement' : 'S\'abonner maintenant'}
        <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
        </svg>
      </button>
      
      {plan.price > 0 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Essai gratuit de 7 jours • Sans engagement
        </p>
      )}
    </div>
  )
}

export default function PricingPlans() {
  const [selectedInterval, setSelectedInterval] = useState<'month' | 'year'>('month')
  
  const handleSelectPlan = async (plan: PricingPlan) => {
    if (plan.price === 0) {
      // Pour le plan gratuit, rediriger vers l'inscription
      window.location.href = '/login'
      return
    }
    
    try {
      // Rediriger vers l'API de checkout Stripe
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          planId: plan.id,
          interval: selectedInterval
        }),
      })
      
      const { url } = await response.json()
      
      // Rediriger vers la page de paiement Stripe
      window.location.href = url
    } catch (error) {
      console.error('Erreur lors de la création de la session de paiement:', error)
    }
  }
  
  return (
    <div className="py-12">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Choisissez votre plan
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
          Accélérez votre recherche d&apos;emploi avec nos outils IA avancés. 
          Rejoignez plus de 10 000 professionnels qui ont déjà trouvé leur emploi idéal.
        </p>
        
        <div className="flex justify-center mt-8 mb-12">
          <div className="inline-flex p-1.5 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
            <button
              className={`px-8 py-3 rounded-lg transition-all duration-300 font-semibold ${
                selectedInterval === 'month' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedInterval('month')}
            >
              Mensuel
            </button>
            <button
              className={`px-8 py-3 rounded-lg transition-all duration-300 font-semibold ${
                selectedInterval === 'year' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedInterval('year')}
            >
              Annuel 
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full ml-2">
                -20%
              </span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 mb-16">
        {pricingPlans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={{
              ...plan,
              interval: selectedInterval
            }}
            onSelectPlan={handleSelectPlan}
            isAnnual={selectedInterval === 'year'}
          />
        ))}
      </div>
      
      {/* Value Proposition */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">
            Pourquoi choisir Job Finder ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">10x plus rapide</h4>
              <p className="text-gray-600 text-sm">Créez un CV professionnel en moins de 5 minutes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">95% de succès</h4>
              <p className="text-gray-600 text-sm">Nos utilisateurs décrochent 3x plus d&apos;entretiens</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4a2 2 0 104 0m-4 0a2 2 0 100-4m6 4a2 2 0 100-4m0 4a2 2 0 100 4m0-4a2 2 0 104 0m-4 0a2 2 0 110-4m6 4a2 2 0 100-4" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">IA avancée</h4>
              <p className="text-gray-600 text-sm">Technologie de pointe pour optimiser vos candidatures</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Guarantees */}
      <div className="text-center bg-white/70 backdrop-blur-sm max-w-4xl mx-auto p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-center mb-6 text-blue-600">
          <svg className="h-8 w-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 className="text-2xl font-bold">Nos garanties</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center justify-center">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-600">Garantie satisfait ou remboursé 14 jours</span>
          </div>
          <div className="flex items-center justify-center">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-600">Annulation à tout moment</span>
          </div>
          <div className="flex items-center justify-center">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-600">Support 24/7 inclus</span>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-center text-blue-600 mb-2">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">Offre limitée</span>
          </div>
          <p className="text-gray-600 text-sm">
            Profitez de nos tarifs préférentiels jusqu&apos;à la fin du mois. 
            Plus de 1000 professionnels nous ont déjà fait confiance ce mois-ci.
          </p>
        </div>
      </div>
    </div>
  )
}
