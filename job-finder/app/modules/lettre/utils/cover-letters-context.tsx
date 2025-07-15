// Context for managing all cover letters for a user
'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'
import { useUserContext } from '../../user-context'
import { CoverLetter } from './types'

interface CoverLettersContextType {
  coverLetters: CoverLetter[]
  addCoverLetter: (letter: CoverLetter) => void
  updateCoverLetter: (id: string, letter: Partial<CoverLetter>) => void
  removeCoverLetter: (id: string) => void
}

const CoverLettersContext = createContext<CoverLettersContextType | undefined>(undefined)

export function CoverLettersProvider({ children }: { children: ReactNode }) {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([])
  const { user } = useUser();
  const userId = user?.id;
  const { subscription } = useUserContext();

  // Limites selon le plan
  const planLimits: Record<string, number | undefined> = {
    'FREE': 1,
    'PRO': 5,
    'COACH': undefined // illimité
  }

  // Charger les lettres depuis l'API au montage
  React.useEffect(() => {
    if (!userId) return;
    fetch(`/api/coverletters?userId=${userId}`)
      .then(res => res.json())
      .then(data => setCoverLetters(data))
  }, [userId])

  const addCoverLetter = async (letter: CoverLetter) => {
    // Guard: prompt login before creating cover letter
    if (!userId) {
      alert('Veuillez vous connecter pour créer une lettre de motivation.');
      return;
    }
    const plan = subscription?.role || 'FREE';
    const limit = planLimits[plan];
    if (limit !== undefined && coverLetters.length >= limit) {
      alert("Limite atteinte pour votre abonnement. Passez à une offre supérieure pour créer plus de lettres de motivation.");
      return;
    }
    const response = await fetch('/api/coverletters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...letter, userId })
    })
    const newLetter = await response.json()
    setCoverLetters(prev => [...prev, newLetter])
  }

  const updateCoverLetter = async (id: string, letter: Partial<CoverLetter>) => {
    const response = await fetch('/api/coverletters', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...letter })
    })
    const updated = await response.json()
    setCoverLetters(prev => prev.map(l => l.id === id ? updated : l))
  }

  const removeCoverLetter = async (id: string) => {
    await fetch(`/api/coverletters?id=${id}`, { method: 'DELETE' })
    setCoverLetters(prev => prev.filter(l => l.id !== id))
  }

  return (
    <CoverLettersContext.Provider value={{ coverLetters, addCoverLetter, updateCoverLetter, removeCoverLetter }}>
      {children}
    </CoverLettersContext.Provider>
  )
}

export function useCoverLetters() {
  const context = useContext(CoverLettersContext)
  if (!context) throw new Error('useCoverLetters must be used within a CoverLettersProvider')
  return context
}
