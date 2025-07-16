"use client";

import { useState } from 'react';

export default function CourseCreator() {
  const [courseType, setCourseType] = useState('nextjs');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'web-development',
    difficulty: 'beginner',
    estimatedHours: 5,
    thumbnailUrl: '',
    isPublished: false
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [modules, setModules] = useState([
    { id: 1, title: '', description: '', lessons: [] }
  ]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleModuleChange = (index, field, value) => {
    const updatedModules = [...modules];
    updatedModules[index] = {
      ...updatedModules[index],
      [field]: value
    };
    setModules(updatedModules);
  };
  
  const addModule = () => {
    setModules([
      ...modules,
      { id: modules.length + 1, title: '', description: '', lessons: [] }
    ]);
  };
  
  const removeModule = (index) => {
    if (modules.length > 1) {
      const updatedModules = [...modules];
      updatedModules.splice(index, 1);
      setModules(updatedModules);
    }
  };
  
  const addLesson = (moduleIndex) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons.push({
      id: updatedModules[moduleIndex].lessons.length + 1,
      title: '',
      type: 'theory',
      content: '',
      estimatedMinutes: 10,
      xpReward: 20,
      contributeToPortfolio: false
    });
    setModules(updatedModules);
  };
  
  const handleLessonChange = (moduleIndex, lessonIndex, field, value) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons[lessonIndex] = {
      ...updatedModules[moduleIndex].lessons[lessonIndex],
      [field]: value
    };
    setModules(updatedModules);
  };
  
  const removeLesson = (moduleIndex, lessonIndex) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons.splice(lessonIndex, 1);
    setModules(updatedModules);
  };
  
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Dans une application réelle, nous enverrions les données au serveur
    console.log('Course data:', { ...formData, modules });
    alert('Cours créé avec succès !');
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-indigo-600 text-white">
        <h2 className="text-xl font-bold">Créer un nouveau cours</h2>
        <p className="text-indigo-100">Suivez les étapes pour créer un cours complet</p>
      </div>
      
      {/* Étapes de progression */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${
            currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'
          }`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className={`flex-1 h-1 mx-2 ${
            currentStep >= 3 ? 'bg-indigo-600' : 'bg-gray-200'
          }`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Informations générales</span>
          <span>Modules</span>
          <span>Finalisation</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Étape 1: Informations générales */}
        {currentStep === 1 && (
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Type de cours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer ${
                    courseType === 'nextjs' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => setCourseType('nextjs')}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">N</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">Next.js / Développement Web</h4>
                      <p className="text-sm text-gray-500">Cours techniques sur Next.js, React et le développement web</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer ${
                    courseType === 'personal-dev' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => setCourseType('personal-dev')}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">P</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">Développement Personnel</h4>
                      <p className="text-sm text-gray-500">Cours sur le développement personnel, coaching holistique</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Titre du cours *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {courseType === 'nextjs' ? (
                      <>
                        <option value="web-development">Développement Web</option>
                        <option value="frontend">Frontend</option>
                        <option value="react">React</option>
                        <option value="nextjs">Next.js</option>
                      </>
                    ) : (
                      <>
                        <option value="mindfulness">Mindfulness</option>
                        <option value="productivity">Productivité</option>
                        <option value="leadership">Leadership</option>
                        <option value="wellness">Bien-être</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                    Niveau de difficulté
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="beginner">Débutant</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="advanced">Avancé</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700">
                    Durée estimée (heures)
                  </label>
                  <input
                    type="number"
                    id="estimatedHours"
                    name="estimatedHours"
                    min="1"
                    max="100"
                    value={formData.estimatedHours}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700">
                    URL de l'image de couverture
                  </label>
                  <input
                    type="text"
                    id="thumbnailUrl"
                    name="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                  Publier immédiatement
                </label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
        
        {/* Étape 2: Modules et leçons */}
        {currentStep === 2 && (
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Modules du cours</h3>
                <button
                  type="button"
                  onClick={addModule}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Ajouter un module
                </button>
              </div>
              
              {modules.map((module, moduleIndex) => (
                <div key={module.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900">Module {moduleIndex + 1}</h4>
                    {modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeModule(moduleIndex)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor={`module-title-${moduleIndex}`} className="block text-sm font-medium text-gray-700">
                        Titre du module
                      </label>
                      <input
                        type="text"
                        id={`module-title-${moduleIndex}`}
                        value={module.title}
                        onChange={(e) => handleModuleChange(moduleIndex, 'title', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor={`module-description-${moduleIndex}`} className="block text-sm font-medium text-gray-700">
                        Description du module
                      </label>
                      <textarea
                        id={`module-description-${moduleIndex}`}
                        rows="2"
                        value={module.description}
                        onChange={(e) => handleModuleChange(moduleIndex, 'description', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      ></textarea>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h5 className="text-sm font-medium text-gray-700">Leçons</h5>
                        <button
                          type="button"
                          onClick={() => addLesson(moduleIndex)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Ajouter une leçon
                        </button>
                      </div>
                      
                      {module.lessons.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Aucune leçon ajoutée</p>
                      ) : (
                        <div className="space-y-3">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="border border-gray-200 rounded p-3 bg-gray-50">
                              <div className="flex justify-between items-start">
                                <h6 className="text-sm font-medium text-gray-800">Leçon {lessonIndex + 1}</h6>
                                <button
                                  type="button"
                                  onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                  className="text-red-600 hover:text-red-800 text-xs"
                                >
                                  Supprimer
                                </button>
                              </div>
                              
                              <div className="mt-2 space-y-2">
                                <div>
                                  <label htmlFor={`lesson-title-${moduleIndex}-${lessonIndex}`} className="block text-xs font-medium text-gray-700">
                                    Titre
                                  </label>
                                  <input
                                    type="text"
                                    id={`lesson-title-${moduleIndex}-${lessonIndex}`}
                                    value={lesson.title}
                                    onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'title', e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label htmlFor={`lesson-type-${moduleIndex}-${lessonIndex}`} className="block text-xs font-medium text-gray-700">
                                      Type
                                    </label>
                                    <select
                                      id={`lesson-type-${moduleIndex}-${lessonIndex}`}
                                      value={lesson.type}
                                      onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'type', e.target.value)}
                                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                                    >
                                      <option value="theory">Théorie</option>
                                      <option value="exercise">Exercice</option>
                                      <option value="project">Projet</option>
                                      <option value="quiz">Quiz</option>
                                    </select>
                                  </div>
                                  
                                  <div>
                                    <label htmlFor={`lesson-minutes-${moduleIndex}-${lessonIndex}`} className="block text-xs font-medium text-gray-700">
                                      Durée (min)
                                    </label>
                                    <input
                                      type="number"
                                      id={`lesson-minutes-${moduleIndex}-${lessonIndex}`}
                                      value={lesson.estimatedMinutes}
                                      onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'estimatedMinutes', parseInt(e.target.value))}
                                      min="1"
                                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                                    />
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label htmlFor={`lesson-xp-${moduleIndex}-${lessonIndex}`} className="block text-xs font-medium text-gray-700">
                                      Récompense XP
                                    </label>
                                    <input
                                      type="number"
                                      id={`lesson-xp-${moduleIndex}-${lessonIndex}`}
                                      value={lesson.xpReward}
                                      onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'xpReward', parseInt(e.target.value))}
                                      min="0"
                                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                                    />
                                  </div>
                                  
                                  <div className="flex items-center mt-5">
                                    <input
                                      type="checkbox"
                                      id={`lesson-portfolio-${moduleIndex}-${lessonIndex}`}
                                      checked={lesson.contributeToPortfolio}
                                      onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'contributeToPortfolio', e.target.checked)}
                                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor={`lesson-portfolio-${moduleIndex}-${lessonIndex}`} className="ml-2 block text-xs text-gray-700">
                                      Contribue au portfolio
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
        
        {/* Étape 3: Finalisation */}
        {currentStep === 3 && (
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Résumé du cours</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">{formData.title || 'Sans titre'}</h4>
                <p className="text-sm text-gray-600 mt-1">{formData.description || 'Aucune description'}</p>
                
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span> {courseType === 'nextjs' ? 'Next.js / Développement Web' : 'Développement Personnel'}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Catégorie:</span> {formData.category}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Difficulté:</span> {formData.difficulty}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Durée estimée:</span> {formData.estimatedHours} heures
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Statut:</span> {formData.isPublished ? 'Publié' : 'Brouillon'}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Modules:</span> {modules.length}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Modules et leçons</h4>
                
                {modules.map((module, moduleIndex) => (
                  <div key={module.id} className="border border-gray-200 rounded p-3">
                    <h5 className="font-medium text-gray-800">{module.title || `Module ${moduleIndex + 1}`}</h5>
                    <p className="text-sm text-gray-600 mt-1">{module.description || 'Aucune description'}</p>
                    
                    {module.lessons.length > 0 ? (
                      <ul className="mt-2 space-y-1">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <li key={lesson.id} className="text-sm">
                            <span className="font-medium">{lesson.title || `Leçon ${lessonIndex + 1}`}</span>
                            <span className="text-gray-500 ml-2">({lesson.type}, {lesson.estimatedMinutes} min, {lesson.xpReward} XP)</span>
                            {lesson.contributeToPortfolio && (
                              <span className="ml-2 text-indigo-600 text-xs">Portfolio</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic mt-2">Aucune leçon</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Précédent
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Créer le cours
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
