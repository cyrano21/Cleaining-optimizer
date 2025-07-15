'use client'

import { useState } from 'react'
import { useCV } from '../utils/cv-context'
import CVPreview from './CVPreview'
import { defaultCV, CV } from '../utils/types'
import ModernTemplate from './ModernTemplate'
import ExecutiveTemplate from './ExecutiveTemplate'
import MinimalTemplate from './MinimalTemplate'

// Définition du type pour les modèles de CV disponibles
type TemplateKey = 'professional' | 'creative' | 'simple' | 'modern' | 'executive' | 'minimal'

interface TemplateSelectionProps {
  className?: string
}

const baseSampleCV: CV = {
  ...defaultCV,
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    title: 'Développeur Front-End',
    email: 'john.doe@example.com',
    phone: '06 12 34 56 78'
  },
  sections: defaultCV.sections.map(section => {
    switch (section.id) {
      case 'summary':
        return { ...section, content: { content: "Passionné de développement avec 5 ans d'expérience..." } }
      case 'experience':
        return {
          ...section,
          content: [{ id: '1', title: 'Ingénieur Front-End', company: 'Acme Corp', location: 'Paris', startDate: '2019', endDate: '2022', current: false, description: "Création d'applications web performantes." }]
        }
      case 'education':
        return {
          ...section,
          content: [{ id: '1', degree: 'Master Informatique', institution: 'Université Exemple', location: 'Paris', startDate: '2016', endDate: '2018', current: false, description: "Spécialisation en développement logiciel." }]
        }
      default:
        return section
    }
  })
}

const sampleCVs: Record<TemplateKey, CV> = {
  professional: { ...baseSampleCV, template: 'professional' },
  creative:    { ...baseSampleCV, template: 'creative'    },
  simple:      { ...baseSampleCV, template: 'simple'      },
  modern:      { ...baseSampleCV, template: 'modern'      },
  executive:   { ...baseSampleCV, template: 'executive'   },
  minimal:     { ...baseSampleCV, template: 'minimal'     }
}

const descriptions: Record<TemplateKey, string> = {
  professional: "Un design sobre et élégant, idéal pour la plupart des secteurs.",
  creative:     "Un design moderne avec des touches de couleur, parfait pour les métiers créatifs.",
  simple:       "Un design minimaliste et efficace, adapté à tous les profils.",
  modern:       "Un design contemporain avec mise en page en deux colonnes et accents de couleur.",
  executive:    "Un design professionnel et formel, parfait pour les postes de direction et cadres supérieurs.",
  minimal:      "Un design épuré et élégant, mettant en valeur l'essentiel de votre parcours."
}

export default function TemplateSelection({ className }: TemplateSelectionProps) {
  const { cv, changeTemplate } = useCV()
  const [modalCV, setModalCV] = useState<CV | null>(null)

  return (
    <>
      <div className={`space-y-4 p-4 bg-white rounded-lg shadow ${className}`}>  
        <h3 className="text-lg font-medium mb-4">Modèle de CV</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['professional', 'creative', 'simple', 'modern', 'executive', 'minimal'] as TemplateKey[]).map(key => (
            <div
              key={key}
              className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 ${
                cv.template === key ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => changeTemplate(key)}
            >
              <h4 className="text-xl font-semibold mb-2 capitalize">{key}</h4>
              <p className="text-sm text-gray-600 mb-4">{descriptions[key]}</p>
              <div className="flex flex-col">
                <button 
                  className="text-blue-600 hover:text-blue-800 text-sm mb-2 flex items-center"
                  onClick={e => { e.stopPropagation(); setModalCV(sampleCVs[key]) }}
                >
                  <span>Aperçu en temps réel</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
                <div 
                  className="border rounded-md overflow-hidden cursor-pointer relative group"
                  onClick={e => { e.stopPropagation(); setModalCV(sampleCVs[key]) }}
                  style={{ height: '180px' }}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="transform scale-[0.25] origin-top-left">
                      <CVPreview cvOverride={sampleCVs[key]} className="w-[400%] pointer-events-none" />
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-blue-500 bg-opacity-30 flex items-center justify-center transition-opacity">
                    <span className="bg-white px-2 py-1 rounded text-sm font-medium">Agrandir</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {modalCV && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-auto p-0">
          <button
            onClick={() => setModalCV(null)}
            className="fixed top-4 right-4 bg-white rounded-full w-8 h-8 flex items-center justify-center text-xl z-50"
          >
            ×
          </button>
          
          <div className="flex justify-center">
            {/* Utiliser directement le template au lieu de CVPreview pour éviter l'élément en bas */}
            <div className="bg-white p-0 m-0 overflow-visible max-w-3xl w-full">
              {modalCV.template === 'modern' && <ModernTemplate cv={modalCV} />}
              {modalCV.template === 'executive' && <ExecutiveTemplate cv={modalCV} />}
              {modalCV.template === 'minimal' && <MinimalTemplate cv={modalCV} />}
              {modalCV.template === 'professional' && <CVPreview cvOverride={{...modalCV, template: 'professional'}} />}
              {modalCV.template === 'creative' && <CVPreview cvOverride={{...modalCV, template: 'creative'}} />}
              {modalCV.template === 'simple' && <CVPreview cvOverride={{...modalCV, template: 'simple'}} />}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
