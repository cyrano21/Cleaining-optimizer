'use client'

import { useCoverLetter } from '../utils/cover-letter-context'

export default function CoverLetterPreview() {
  const { coverLetter, translateContent } = useCoverLetter()
  
  const handleTranslate = async (language: 'french' | 'english' | 'spanish' | 'german') => {
    if (language !== coverLetter.language) {
      await translateContent(language)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Aperçu en temps réel</h3>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleTranslate('french')}
              className={`px-2 py-1 text-xs rounded-md ${
                coverLetter.language === 'french' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => handleTranslate('english')}
              className={`px-2 py-1 text-xs rounded-md ${
                coverLetter.language === 'english' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleTranslate('spanish')}
              className={`px-2 py-1 text-xs rounded-md ${
                coverLetter.language === 'spanish' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ES
            </button>
            <button
              onClick={() => handleTranslate('german')}
              className={`px-2 py-1 text-xs rounded-md ${
                coverLetter.language === 'german' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              DE
            </button>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto bg-white p-8 border shadow-sm">
          {/* En-tête */}
          <div className="mb-8">
            <div className="text-right mb-4">
              <p>{coverLetter.date}</p>
              {coverLetter.city && <p>{coverLetter.city}</p>}
            </div>
            
            {(coverLetter.recipientName || coverLetter.recipientPosition || coverLetter.companyAddress) && (
              <div className="mb-6">
                {coverLetter.recipientName && <p>{coverLetter.recipientName}</p>}
                {coverLetter.recipientPosition && <p>{coverLetter.recipientPosition}</p>}
                {coverLetter.company && <p>{coverLetter.company}</p>}
                {coverLetter.companyAddress && <p>{coverLetter.companyAddress}</p>}
              </div>
            )}
            
            <div className="mb-6">
              <p className="font-bold">
                Objet : Candidature au poste de {coverLetter.position || "[poste]"}
              </p>
            </div>
          </div>
          
          {/* Corps de la lettre */}
          <div className="mb-8 whitespace-pre-line font-serif">
            {coverLetter.content || "Contenu de votre lettre de motivation..."}
          </div>
          
          {/* Signature */}
          <div className="text-right">
            <p>Signature</p>
          </div>
        </div>
      </div>
    </div>
  )
}