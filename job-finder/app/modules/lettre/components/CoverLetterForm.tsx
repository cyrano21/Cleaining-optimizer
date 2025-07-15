'use client'

import { useState } from 'react'
import { useCoverLetter } from '../utils/cover-letter-context'
import { coverLetterTemplates } from '../utils/types'

export default function CoverLetterForm() {
  const { coverLetter, updateField, changeTone, changeLanguage, generateWithAI } = useCoverLetter()
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value
    setSelectedTemplate(templateId)
    
    if (templateId) {
      const template = coverLetterTemplates.find(t => t.id === templateId)
      if (template) {
        let content = template.template
        content = content.replace(/{{position}}/g, coverLetter.position || '[poste]')
        content = content.replace(/{{company}}/g, coverLetter.company || '[entreprise]')
        
        updateField('content', content)
      }
    }
  }
  
  const handleGenerateWithAI = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!aiPrompt.trim()) return
    
    setIsGenerating(true)
    try {
      await generateWithAI(aiPrompt)
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Informations de base</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre de la lettre
            </label>
            <input
              type="text"
              id="title"
              value={coverLetter.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={coverLetter.date}
              onChange={(e) => updateField('date', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Entreprise
            </label>
            <input
              type="text"
              id="company"
              value={coverLetter.company}
              onChange={(e) => updateField('company', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
              Poste
            </label>
            <input
              type="text"
              id="position"
              value={coverLetter.position}
              onChange={(e) => updateField('position', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">
              Destinataire (nom)
            </label>
            <input
              type="text"
              id="recipientName"
              value={coverLetter.recipientName || ''}
              onChange={(e) => updateField('recipientName', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="recipientPosition" className="block text-sm font-medium text-gray-700 mb-1">
              Fonction du destinataire
            </label>
            <input
              type="text"
              id="recipientPosition"
              value={coverLetter.recipientPosition || ''}
              onChange={(e) => updateField('recipientPosition', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse de l&apos;entreprise
            </label>
            <input
              type="text"
              id="companyAddress"
              value={coverLetter.companyAddress || ''}
              onChange={(e) => updateField('companyAddress', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Ville
            </label>
            <input
              type="text"
              id="city"
              value={coverLetter.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Style et langue</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
              Ton
            </label>
            <select
              id="tone"
              value={coverLetter.tone}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => changeTone(e.target.value as 'formal' | 'professional' | 'casual' | 'enthusiastic')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="formal">Formel</option>
              <option value="professional">Professionnel</option>
              <option value="casual">Décontracté</option>
              <option value="enthusiastic">Enthousiaste</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Langue
            </label>
            <select
              id="language"
              value={coverLetter.language}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => changeLanguage(e.target.value as 'french' | 'english' | 'spanish' | 'german')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="french">Français</option>
              <option value="english">Anglais</option>
              <option value="spanish">Espagnol</option>
              <option value="german">Allemand</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Modèles et IA</h3>
        
        <div className="mb-4">
          <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
            Choisir un modèle
          </label>
          <select
            id="template"
            value={selectedTemplate}
            onChange={handleTemplateChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Sélectionner un modèle</option>
            {coverLetterTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <h4 className="text-md font-medium mb-2">Génération avec IA</h4>
          <form onSubmit={handleGenerateWithAI}>
            <div className="mb-2">
              <label htmlFor="aiPrompt" className="block text-sm font-medium text-gray-700 mb-1">
                Décrivez votre expérience et vos compétences
              </label>
              <textarea
                id="aiPrompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ex: J'ai 5 ans d'expérience en développement web, spécialisé en React et Node.js..."
              />
            </div>
            <button
              type="submit"
              disabled={isGenerating || !aiPrompt.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isGenerating ? 'Génération en cours...' : 'Générer avec IA'}
            </button>
          </form>
        </div>
      </div>
      
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Contenu de la lettre</h3>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Corps de la lettre
          </label>
          <textarea
            id="content"
            value={coverLetter.content}
            onChange={(e) => updateField('content', e.target.value)}
            rows={12}
            className="w-full p-2 border border-gray-300 rounded-md font-serif"
          />
        </div>
      </div>
    </div>
  )
}