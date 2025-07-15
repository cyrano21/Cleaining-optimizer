'use client'

import { useState } from 'react'
import { CV, Experience, Education, Skill, Language, Project, Certification, Interest, defaultCV, CVSection } from './types'

// Définition des types de modèles disponibles
type TemplateType = 'professional' | 'creative' | 'simple' | 'modern' | 'executive' | 'minimal'

interface CVContextType {
  cv: CV
  updateCV: (cv: CV) => void
  updatePersonalInfo: (field: string, value: string) => void
  updateSection: (sectionId: string, content: CVSection['content']) => void
  addSectionItem: (sectionId: string, item: Experience | Education | Skill | Language | Project | Certification | Interest) => void
  removeSectionItem: (sectionId: string, itemId: string) => void
  updateSectionItem: (sectionId: string, itemId: string, item: Experience | Education | Skill | Language | Project | Certification | Interest) => void
  changeTemplate: (template: TemplateType) => void
}

import { createContext, useContext } from 'react'

const CVContext = createContext<CVContextType | undefined>(undefined)

export function CVProvider({ children }: { children: React.ReactNode }) {
  const [cv, setCv] = useState<CV>(defaultCV)

  const updateCV = (newCV: CV) => {
    setCv(newCV)
  }

  const updatePersonalInfo = (field: string, value: string) => {
    setCv((prevCV) => ({
      ...prevCV,
      personalInfo: {
        ...prevCV.personalInfo,
        [field]: value,
      },
    }))
  }

  const updateSection = (sectionId: string, content: CVSection['content']) => {
    setCv((prevCV) => ({
      ...prevCV,
      sections: prevCV.sections.map((section) =>
        section.id === sectionId ? { ...section, content } : section
      ),
    }))
  }

  const addSectionItem = (sectionId: string, item: Experience | Education | Skill | Language | Project | Certification | Interest) => {
    setCv((prevCV) => ({
      ...prevCV,
      sections: prevCV.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            content: Array.isArray(section.content)
              ? [...section.content, item]
              : section.content,
          }
        }
        return section
      }),
    }))
  }

  const removeSectionItem = (sectionId: string, itemId: string) => {
    setCv((prevCV) => ({
      ...prevCV,
      sections: prevCV.sections.map((section) => {
        if (section.id === sectionId && Array.isArray(section.content)) {
          return {
            ...section,
            content: section.content.filter((item) => item.id !== itemId),
          }
        }
        return section
      }),
    }))
  }

  const updateSectionItem = (sectionId: string, itemId: string, item: Experience | Education | Skill | Language | Project | Certification | Interest) => {
    setCv((prevCV) => ({
      ...prevCV,
      sections: prevCV.sections.map((section) => {
        if (section.id === sectionId && Array.isArray(section.content)) {
          return {
            ...section,
            content: section.content.map((contentItem) =>
              contentItem.id === itemId ? { ...contentItem, ...item } : contentItem
            ),
          }
        }
        return section
      }),
    }))
  }

  const changeTemplate = (template: TemplateType) => {
    setCv((prevCV) => ({
      ...prevCV,
      template,
    }))
  }

  return (
    <CVContext.Provider
      value={{
        cv,
        updateCV,
        updatePersonalInfo,
        updateSection,
        addSectionItem,
        removeSectionItem,
        updateSectionItem,
        changeTemplate,
      }}
    >
      {children}
    </CVContext.Provider>
  )
}

export function useCV() {
  const context = useContext(CVContext)
  if (context === undefined) {
    throw new Error('useCV must be used within a CVProvider')
  }
  return context
}
