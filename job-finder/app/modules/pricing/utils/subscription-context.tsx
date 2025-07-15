'use client'

import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { pricingPlans, PricingPlan } from './plans'

interface SubscriptionContextType {
  currentPlan: PricingPlan | null
  isLoading: boolean
  hasAccess: (requiredRole: 'FREE' | 'PRO' | 'COACH') => boolean
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [currentPlan, setCurrentPlan] = useState<PricingPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/user/subscription')
        
        if (response.ok) {
          const data = await response.json()
          const plan = pricingPlans.find(p => p.role === data.role) || pricingPlans[0]
          setCurrentPlan(plan)
        } else {
          // Par défaut, utiliser le plan gratuit
          setCurrentPlan(pricingPlans[0])
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'abonnement:', error)
        // Par défaut, utiliser le plan gratuit
        setCurrentPlan(pricingPlans[0])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSubscription()
  }, [])
  
  const hasAccess = (requiredRole: 'FREE' | 'PRO' | 'COACH') => {
    if (!currentPlan) return false
    
    const roleHierarchy = {
      'FREE': 0,
      'PRO': 1,
      'COACH': 2
    }
    
    return roleHierarchy[currentPlan.role] >= roleHierarchy[requiredRole]
  }
  
  return (
    <SubscriptionContext.Provider
      value={{
        currentPlan,
        isLoading,
        hasAccess
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
