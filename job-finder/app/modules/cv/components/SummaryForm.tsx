'use client'

import { useCV } from '../utils/cv-context'
import { Summary } from '../utils/types'

export default function SummaryForm() {
  const { cv, updateSection } = useCV()
  const summarySection = cv.sections.find((section) => section.id === 'summary')
  const summary = summarySection?.content as Summary || { content: '' }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target
    updateSection('summary', { content: value })
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium">Résumé professionnel</h3>
      
      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
          Présentez-vous en quelques lignes
        </label>
        <textarea
          id="summary"
          value={summary.content}
          onChange={handleChange}
          rows={6}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Résumez votre parcours, vos compétences clés et vos objectifs professionnels..."
        />
      </div>
    </div>
  )
}
