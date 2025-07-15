'use client'

import { useState } from 'react'
import { useCoaching } from '../utils/coaching-context'

export default function InterviewSimulator() {
  const { 
    currentQuestion, 
    interviewHistory, 
    interviewFeedback,
    startInterview, 
    answerQuestion, 
    getNextQuestion, 
    endInterview 
  } = useCoaching()
  
  const [answer, setAnswer] = useState('')
  const [isAnswering, setIsAnswering] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState('')
  const [showPreparationTips, setShowPreparationTips] = useState(false)
  const [userContext, setUserContext] = useState('') // Expérience, compétences, etc.
  const [showExampleAnswers, setShowExampleAnswers] = useState(false)
  
  const handleStartInterview = () => {
    // Inclure le contexte enrichi pour un entretien plus personnalisé
    // Note: stockons les informations contextuelles dans le localStorage pour les utiliser plus tard
    if (jobTitle || company || industry || userContext) {
      localStorage.setItem('interviewContext', JSON.stringify({
        jobTitle,
        company,
        industry,
        userContext
      }))
    }
    
    // Lancer l'entretien avec la catégorie et la difficulté sélectionnées
    startInterview(
      selectedCategory || undefined, 
      selectedDifficulty || undefined
    )
  }
  
  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !currentQuestion) return
    
    setIsLoading(true)
    await answerQuestion(answer)
    setAnswer('')
    setIsAnswering(false)
    setIsLoading(false)
    
    getNextQuestion()
  }
  
  const handleFinishInterview = async () => {
    setIsLoading(true)
    await endInterview()
    setIsLoading(false)
  }
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'technical': return 'Technique'
      case 'behavioral': return 'Comportemental'
      case 'experience': return 'Expérience'
      case 'company': return 'Entreprise'
      case 'personal': return 'Personnel'
      default: return category
    }
  }
  
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Facile'
      case 'medium': return 'Moyen'
      case 'hard': return 'Difficile'
      default: return difficulty
    }
  }
  
  // Affichage de la configuration de l'entretien
  if (!currentQuestion && !interviewFeedback && interviewHistory.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Simulateur d&apos;entretien IA</h3>
        
        <p className="text-gray-600 mb-4">
          Préparez-vous pour vos entretiens d&apos;embauche en vous entraînant avec notre IA. Répondez à des questions typiques et recevez un feedback personnalisé.
        </p>

        {/* Bannière de conseils de préparation */}
        <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-blue-800 font-medium flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Conseils de préparation
            </h4>
            <button 
              onClick={() => setShowPreparationTips(!showPreparationTips)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showPreparationTips ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          {showPreparationTips && (
            <div className="text-sm text-gray-700 space-y-2 animate-fadeIn">
              <p>✓ Recherchez l&apos;entreprise et le poste avant de commencer l&apos;entretien</p>
              <p>✓ Préparez des exemples concrets de vos réalisations pour illustrer vos réponses</p>
              <p>✓ Structurez vos réponses avec la méthode STAR : Situation, Tâche, Action, Résultat</p>
              <p>✓ Entraînez-vous à parler à voix haute pour améliorer votre fluidité</p>
              <p>✓ Plus vous fournissez de contexte, plus l&apos;IA pourra personnaliser ses questions</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Colonne 1: Configuration basique */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Configuration de l&apos;entretien</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de questions
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Toutes les catégories</option>
                <option value="technical">Techniques</option>
                <option value="behavioral">Comportementales</option>
                <option value="experience">Expérience</option>
                <option value="company">Entreprise</option>
                <option value="personal">Personnelles</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Niveau de difficulté
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Tous les niveaux</option>
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
            </div>
          </div>
          
          {/* Colonne 2: Contexte enrichi */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Contexte personnalisé <span className="text-xs text-blue-600">(Recommandé)</span></h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poste visé
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ex: Développeur Full Stack, Designer UX/UI..."
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entreprise (optionnel)
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ex: Google, Startup tech..."
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secteur d&apos;activité
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Ex: Technologie, Finance, Santé..."
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
        
        {/* Section pour les compétences/expériences */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Votre profil et compétences clés <span className="text-xs text-blue-600">(Pour des questions plus pertinentes)</span>
          </label>
          <textarea
            value={userContext}
            onChange={(e) => setUserContext(e.target.value)}
            placeholder="Décrivez brièvement votre expérience, vos compétences principales et ce que vous recherchez. L&apos;IA utilisera ces informations pour rendre l&apos;entretien plus réaliste."
            className="w-full p-2 border border-gray-300 rounded-md h-24"
          />
        </div>
        
        {/* Exemples de réponses */}
        <div className="mb-6 p-4 border border-green-200 bg-green-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-green-800 font-medium flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Exemples de réponses efficaces
            </h4>
            <button 
              onClick={() => setShowExampleAnswers(!showExampleAnswers)}
              className="text-sm text-green-600 hover:text-green-800"
            >
              {showExampleAnswers ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          {showExampleAnswers && (
            <div className="text-sm text-gray-700 space-y-3 animate-fadeIn">
              <div>
                <p className="font-medium">Question : Parlez-moi de vous</p>
                <p className="pl-4 border-l-2 border-green-300 mt-1">Je suis un développeur web avec 3 ans d&apos;expérience, spécialisé dans React et Node.js. J&apos;ai travaillé sur plusieurs projets qui ont amélioré l&apos;engagement utilisateur de 30%. Je suis passionné par les interfaces intuitives et je recherche un poste où je pourrai combiner mes compétences techniques et ma créativité.</p>
              </div>
              
              <div>
                <p className="font-medium">Question : Décrivez une situation difficile au travail</p>
                <p className="pl-4 border-l-2 border-green-300 mt-1">Lors d&apos;un projet critique, nous avons rencontré un bug majeur juste avant le lancement. J&apos;ai organisé une session de débogage avec l&apos;équipe, en divisant les tâches selon nos forces. J&apos;ai mis en place un système de tests rigoureux, ce qui nous a permis d&apos;identifier et résoudre le problème en 24h. Cet incident nous a amenés à améliorer nos procédures de tests automatisés.</p>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">Ces exemples suivent la structure STAR: Situation, Tâche, Action, Résultat</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleStartInterview}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center font-medium transition-all duration-200 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Commencer l&apos;entretien
          </button>
        </div>
      </div>
    )
  }
  
  // Affichage du feedback final
  if (interviewFeedback) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Feedback de l&apos;entretien</h3>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Score global</h4>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {interviewFeedback.overallScore}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium mb-1">Confiance</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${interviewFeedback.confidenceScore}%` }}
                ></div>
              </div>
              <p className="text-right text-xs mt-1">{interviewFeedback.confidenceScore}/100</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium mb-1">Clarté</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${interviewFeedback.clarityScore}%` }}
                ></div>
              </div>
              <p className="text-right text-xs mt-1">{interviewFeedback.clarityScore}/100</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium mb-1">Pertinence</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${interviewFeedback.relevanceScore}%` }}
                ></div>
              </div>
              <p className="text-right text-xs mt-1">{interviewFeedback.relevanceScore}/100</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium mb-2 text-green-600">Points forts</h4>
            <ul className="list-disc pl-5 space-y-1">
              {interviewFeedback.strengths.map((strength, index) => (
                <li key={index} className="text-sm">{strength}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-amber-600">Points à améliorer</h4>
            <ul className="list-disc pl-5 space-y-1">
              {interviewFeedback.improvements.map((improvement, index) => (
                <li key={index} className="text-sm">{improvement}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-medium mb-2">Suggestions</h4>
          <p className="text-sm text-gray-700">{interviewFeedback.suggestions}</p>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={() => startInterview()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Nouvel entretien
          </button>
        </div>
      </div>
    )
  }
  
  // Affichage de l'entretien en cours
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Entretien en cours</h3>
        <div className="text-sm text-gray-500">
          Question {interviewHistory.length + 1}/5
        </div>
      </div>
      
      {currentQuestion && (
        <div className="mb-6">
          <div className="flex space-x-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {getCategoryLabel(currentQuestion.category)}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {getDifficultyLabel(currentQuestion.difficulty)}
            </span>
          </div>
          
          <p className="text-lg font-medium mb-4">{currentQuestion.question}</p>
          
          {!isAnswering ? (
            <button
              onClick={() => setIsAnswering(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Répondre
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Saisissez votre réponse ici..."
                className="w-full p-3 border border-gray-300 rounded-md h-32"
              />
              
              <div className="flex space-x-2">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isLoading ? 'Analyse en cours...' : 'Soumettre'}
                </button>
                <button
                  onClick={() => setIsAnswering(false)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {interviewHistory.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-2">Questions précédentes</h4>
          <div className="space-y-3">
            {interviewHistory.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium text-sm mb-1">{item.question.question}</p>
                <p className="text-sm text-gray-700">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!currentQuestion && interviewHistory.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleFinishInterview}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
          >
            {isLoading ? 'Génération du feedback...' : 'Terminer l\'entretien et obtenir un feedback'}
          </button>
        </div>
      )}
    </div>
  )
}
