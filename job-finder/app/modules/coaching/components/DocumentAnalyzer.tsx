'use client'

import { useState } from 'react'
import { useCoaching } from '../utils/coaching-context'
import { CVFeedback, CoverLetterFeedback } from '../utils/types'
import { useCVs } from '../../cv/utils/cvs-context'
import { useCoverLetters } from '../../lettre/utils/cover-letters-context'

export default function DocumentAnalyzer() {
  const { analyzeCv, analyzeCoverLetter } = useCoaching()
  const { cvs } = useCVs()
  const { coverLetters } = useCoverLetters()
  
  const [selectedDocType, setSelectedDocType] = useState<'cv' | 'letter'>('cv')
  const [selectedDocId, setSelectedDocId] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [cvFeedback, setCvFeedback] = useState<CVFeedback | null>(null)
  const [letterFeedback, setCoverLetterFeedback] = useState<CoverLetterFeedback | null>(null)
  
  const handleAnalyze = async () => {
    if (!selectedDocId) return
    
    setIsAnalyzing(true)
    
    try {
      if (selectedDocType === 'cv') {
        const feedback = await analyzeCv(selectedDocId)
        setCvFeedback(feedback)
        setCoverLetterFeedback(null)
      } else {
        const feedback = await analyzeCoverLetter(selectedDocId)
        setCoverLetterFeedback(feedback)
        setCvFeedback(null)
      }
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  const handleReset = () => {
    setCvFeedback(null)
    setCoverLetterFeedback(null)
    setSelectedDocId('')
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Analyse de documents par IA</h3>
      
      {!cvFeedback && !letterFeedback ? (
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Notre IA peut analyser vos CV et lettres de motivation pour vous donner des suggestions d&apos;amélioration personnalisées.
          </p>
          
          {selectedDocType === 'cv' && cvs.length === 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Vous n&apos;avez pas encore de CV</strong>. Créez votre premier CV pour pouvoir l&apos;analyser et recevoir des conseils personnalisés.
              </p>
              <a href="/cv" className="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Créer mon CV
              </a>
            </div>
          )}

          {selectedDocType === 'letter' && coverLetters.length === 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Vous n&apos;avez pas encore de lettre de motivation</strong>. Créez votre première lettre pour pouvoir l&apos;analyser et recevoir des conseils personnalisés.
              </p>
              <a href="/lettre" className="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Créer ma lettre de motivation
              </a>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de document
            </label>
            <div className="flex space-x-4">
              <button
                className={`px-4 py-2 rounded-md ${
                  selectedDocType === 'cv' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setSelectedDocType('cv')}
              >
                CV
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  selectedDocType === 'letter' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setSelectedDocType('letter')}
              >
                Lettre de motivation
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sélectionner un document
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Sélectionnez un document</option>
              {selectedDocType === 'cv' ? (
                cvs.length > 0 ? (
                  cvs.map(cv => (
                    <option key={cv.id} value={cv.id}>
                      {cv.personalInfo.firstName && cv.personalInfo.lastName ? 
                        `${cv.personalInfo.firstName} ${cv.personalInfo.lastName}` : 
                        `${cv.title || `CV ${cv.id}`}`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Aucun CV disponible</option>
                )
              ) : (
                coverLetters.length > 0 ? (
                  coverLetters.map(letter => (
                    <option key={letter.id} value={letter.id}>
                      {letter.title ? letter.title : `Lettre ${letter.id}`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Aucune lettre disponible</option>
                )
              )}
            </select>
          </div>
          
          <div className="flex justify-center pt-2">
            <button
              onClick={handleAnalyze}
              disabled={!selectedDocId || isAnalyzing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isAnalyzing ? 'Analyse en cours...' : 'Analyser'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          {cvFeedback && (
            <div className="space-y-4">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Score global</h4>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {cvFeedback.overallScore}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium mb-1">Format</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${cvFeedback.formatScore}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs mt-1">{cvFeedback.formatScore}/100</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium mb-1">Contenu</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${cvFeedback.contentScore}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs mt-1">{cvFeedback.contentScore}/100</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium mb-1">Impact</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${cvFeedback.impactScore}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs mt-1">{cvFeedback.impactScore}/100</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium mb-2 text-green-600">Points forts</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {cvFeedback.strengths.map((strength, index) => (
                      <li key={index} className="text-sm">{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-amber-600">Points faibles</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {cvFeedback.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm">{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Suggestions d&apos;amélioration</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {cvFeedback.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm">{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {letterFeedback && (
            <div className="space-y-4">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Score global</h4>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {letterFeedback.overallScore}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium mb-1">Pertinence</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${letterFeedback.relevanceScore}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs mt-1">{letterFeedback.relevanceScore}/100</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium mb-1">Persuasion</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${letterFeedback.persuasionScore}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs mt-1">{letterFeedback.persuasionScore}/100</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium mb-1">Langage</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${letterFeedback.languageScore}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs mt-1">{letterFeedback.languageScore}/100</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium mb-2 text-green-600">Points forts</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {letterFeedback.strengths.map((strength, index) => (
                      <li key={index} className="text-sm">{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-amber-600">Points faibles</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {letterFeedback.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm">{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Suggestions d&apos;amélioration</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {letterFeedback.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm">{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Analyser un autre document
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
