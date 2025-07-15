'use client'

import { createContext, useContext, useState } from 'react'
import { CoverLetter, defaultCoverLetter } from './types'

interface CoverLetterContextType {
  coverLetter: CoverLetter
  updateCoverLetter: (coverLetter: CoverLetter) => void
  updateField: (field: keyof CoverLetter, value: string) => void
  changeTone: (tone: 'formal' | 'casual' | 'enthusiastic' | 'professional') => void
  changeLanguage: (language: 'french' | 'english' | 'spanish' | 'german') => void
  generateWithAI: (prompt: string) => Promise<void>
  translateContent: (targetLanguage: 'french' | 'english' | 'spanish' | 'german') => Promise<void>
}

const CoverLetterContext = createContext<CoverLetterContextType | undefined>(undefined)

export function CoverLetterProvider({ children }: { children: React.ReactNode }) {
  const [coverLetter, setCoverLetter] = useState<CoverLetter>(defaultCoverLetter)

  const updateCoverLetter = (newCoverLetter: CoverLetter) => {
    setCoverLetter(newCoverLetter)
  }

  const updateField = (field: keyof CoverLetter, value: string) => {
    setCoverLetter((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const changeTone = (tone: 'formal' | 'casual' | 'enthusiastic' | 'professional') => {
    setCoverLetter((prev) => ({
      ...prev,
      tone,
    }))
  }

  const changeLanguage = (language: 'french' | 'english' | 'spanish' | 'german') => {
    setCoverLetter((prev) => ({
      ...prev,
      language,
    }))
  }

  const generateWithAI = async (prompt: string) => {
    // Simulation d'une génération IA
    // Dans une implémentation réelle, cela ferait appel à l'API Hugging Face
    try {
      const generatedContent = `Madame, Monsieur,

Je vous soumets ma candidature pour le poste de ${coverLetter.position} au sein de ${coverLetter.company}.

${prompt}

Je serais ravi de pouvoir échanger avec vous lors d'un entretien pour vous présenter plus en détail ma motivation et mes qualifications.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.`

      setCoverLetter((prev) => ({
        ...prev,
        content: generatedContent,
      }))
    } catch (error) {
      console.error('Erreur lors de la génération IA:', error)
    }
  }

  const translateContent = async (targetLanguage: 'french' | 'english' | 'spanish' | 'german') => {
    // Simulation d'une traduction
    // Dans une implémentation réelle, cela ferait appel à l'API Hugging Face
    try {
      let translatedContent = coverLetter.content

      if (targetLanguage === 'english' && coverLetter.language === 'french') {
        translatedContent = coverLetter.content
          .replace('Madame, Monsieur,', 'Dear Sir or Madam,')
          .replace('Je vous soumets ma candidature', 'I am submitting my application')
          .replace('au sein de', 'at')
          .replace('Je serais ravi', 'I would be delighted')
          .replace('Je vous prie d\'agréer', 'Yours sincerely,')
      } else if (targetLanguage === 'french' && coverLetter.language === 'english') {
        translatedContent = coverLetter.content
          .replace('Dear Sir or Madam,', 'Madame, Monsieur,')
          .replace('I am submitting my application', 'Je vous soumets ma candidature')
          .replace('at', 'au sein de')
          .replace('I would be delighted', 'Je serais ravi')
          .replace('Yours sincerely,', 'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.')
      }

      setCoverLetter((prev) => ({
        ...prev,
        content: translatedContent,
        language: targetLanguage,
      }))
    } catch (error) {
      console.error('Erreur lors de la traduction:', error)
    }
  }

  return (
    <CoverLetterContext.Provider
      value={{
        coverLetter,
        updateCoverLetter,
        updateField,
        changeTone,
        changeLanguage,
        generateWithAI,
        translateContent,
      }}
    >
      {children}
    </CoverLetterContext.Provider>
  )
}

export function useCoverLetter() {
  const context = useContext(CoverLetterContext)
  if (context === undefined) {
    throw new Error('useCoverLetter must be used within a CoverLetterProvider')
  }
  return context
}
