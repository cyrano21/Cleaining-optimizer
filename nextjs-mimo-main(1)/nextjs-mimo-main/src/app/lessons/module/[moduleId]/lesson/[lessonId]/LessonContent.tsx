'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import CodeEditor from '@/components/editor/CodeEditor'
import LessonProgress from '@/components/lessons/LessonProgress'
import QuizComponent from '@/components/lessons/QuizComponent'
import ExerciseComponent from '@/components/lessons/ExerciseComponent'

// --- INTERFACES ---
interface Example {
  title: string
  code: string
  explanation: string
  language?: string
}

interface ExerciseOption {
  id: number
  text: string
  correct: boolean
}

interface Exercise {
  title: string
  description: string
  options?: ExerciseOption[]
  type?: string
}

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: string
}

interface Quiz {
  title: string
  questions: QuizQuestion[]
}

interface Project {
  title: string
  description: string
  initialCode: string
  solution: string
  language?: string
}

interface LessonData {
  id: string
  title: string
  description?: string
  content:
    | string
    | {
        theory: string
        practicalExample?: any
        exercise?: any
        quiz?: any[]
        project?: any
      }
  example?: Example
  examples?: Example[]
  exercise?: Exercise
  quiz?: Quiz
  project?: Project
  practice?: {
    initialCode: string
    solution: string
    language?: string
  }
  duration?: number
  difficulty?: 'débutant' | 'intermédiaire' | 'avancé' | 'expert'
  prerequisites?: string[]
  tags?: string[]
}

interface ModuleLessonSummary {
  id: string
  title: string
}

export interface LessonContentProps {
  lesson: LessonData
  moduleId: string
  lessonId: string
  lessonTitles: { [key: string]: string }
  activeSection: string
  setActiveSection: (section: string) => void
  sectionCompleted: { [key: string]: boolean }
  setSectionCompleted: (
    updater: (prev: { [key: string]: boolean }) => { [key: string]: boolean }
  ) => void
  // These props should match what page.tsx provides
  currentProgress: number // Changed from 'progress' to 'currentProgress'
  setCurrentProgress: (updater: (prev: number) => number) => void // Changed from 'setProgress'

  // Props related to inter-lesson navigation, passed from parent
  availableLessons: {
    // This structure should come from page.tsx
    next?: ModuleLessonSummary
    prev?: ModuleLessonSummary
  }
  // Removed individual boolean flags if `availableLessons` object is used
}
// --- END INTERFACES ---

const formatPrerequisiteDisplay = (
  prereq: string,
  lessonTitles: { [key: string]: string }
) => {
  if (/^\d+-\d+$/.test(prereq) && lessonTitles[prereq]) {
    return `${lessonTitles[prereq]} (Leçon ${prereq})`
  }
  return prereq
}

type ContentItem = {
  type: 'text' | 'code' | 'heading' | 'paragraph'
  content: string
  language?: string
  level?: number
}

export const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  moduleId,
  lessonId,
  lessonTitles,
  activeSection,
  setActiveSection,
  sectionCompleted,
  setSectionCompleted,
  currentProgress, // Use the corrected prop name
  setCurrentProgress, // Use the corrected prop name
  availableLessons
}) => {
  const [practiceCode, setPracticeCode] = useState<string>(
    lesson.practice?.initialCode || ''
  )

  useEffect(() => {
    setPracticeCode(lesson.practice?.initialCode || '')
  }, [lesson.practice])

  const availableSections = useMemo(() => {
    const sections: string[] = []
    // Pour les deux formats de contenu (string et objet avec theory)
    if (lesson.content) sections.push('theory')
    if (lesson.example || (lesson.examples && lesson.examples.length > 0))
      sections.push('example')
    if (lesson.practice) sections.push('practice')
    if (
      lesson.exercise ||
      (typeof lesson.content === 'object' && lesson.content.exercise)
    )
      sections.push('exercise')
    if (
      lesson.quiz ||
      (typeof lesson.content === 'object' && lesson.content.quiz)
    )
      sections.push('quiz')
    if (
      lesson.project ||
      (typeof lesson.content === 'object' && lesson.content.project)
    )
      sections.push('project')
    return sections
  }, [lesson])

  useEffect(() => {
    const completedCount =
      Object.values(sectionCompleted).filter(Boolean).length
    const totalPresentSections = availableSections.length
    if (totalPresentSections > 0) {
      // Use setCurrentProgress (passed from parent) to update overall lesson progress in page.tsx
      setCurrentProgress(() =>
        Math.round((completedCount / totalPresentSections) * 100)
      )
    } else {
      setCurrentProgress(() => 0)
    }
  }, [sectionCompleted, availableSections, setCurrentProgress])

  const completeSection = (sectionKey: string) => {
    setSectionCompleted(prev => {
      // Créer un nouvel objet avec les propriétés existantes et la nouvelle section
      const newState = { ...prev, [sectionKey]: true } as {
        [key: string]: boolean
      }
      // Recalculer la progression basée sur le nouvel état
      const completedCount = Object.values(newState).filter(Boolean).length
      const totalPresentSections = availableSections.length
      if (totalPresentSections > 0) {
        setCurrentProgress(prev =>
          Math.round((completedCount / totalPresentSections) * 100)
        )
      } else {
        setCurrentProgress(prev => 0)
      }
      return newState
    })

    // Auto-navigate after completing a section (except the last one)
    const currentIndex = availableSections.indexOf(sectionKey)
    if (currentIndex !== -1 && currentIndex < availableSections.length - 1) {
      setActiveSection(availableSections[currentIndex + 1])
    } else if (currentIndex === availableSections.length - 1) {
      console.log('Lesson fully completed!') // Or trigger some other action
    }
  }

  const navigateToNextSection = () => {
    const currentIndex = availableSections.indexOf(activeSection)
    if (currentIndex !== -1 && currentIndex < availableSections.length - 1) {
      setActiveSection(availableSections[currentIndex + 1])
    }
  }

  const navigateToPreviousSection = () => {
    const currentIndex = availableSections.indexOf(activeSection)
    if (currentIndex !== -1 && currentIndex > 0) {
      setActiveSection(availableSections[currentIndex - 1])
    }
  }

  const contentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: 'easeIn' } }
  }

  const sectionDisplayNames: { [key: string]: string } = {
    theory: 'Théorie',
    example: 'Exemple(s)',
    practice: 'Pratique',
    exercise: 'Exercice',
    quiz: 'Quiz',
    project: 'Projet'
  }

  // Types pour le gestionnaire de tâches
  type Task = {
    id: number
    text: string
    completed: boolean
  }

  type TaskAction =
    | { type: 'ADD'; text: string }
    | { type: 'TOGGLE'; id: number }
    | { type: 'DELETE'; id: number }

  const tasksReducer = (state: Task[], action: TaskAction): Task[] => {
    switch (action.type) {
      case 'ADD':
        return [
          ...state,
          {
            id: Date.now(),
            text: action.text,
            completed: false
          }
        ]
      case 'TOGGLE':
        return state.map(task =>
          task.id === action.id ? { ...task, completed: !task.completed } : task
        )
      case 'DELETE':
        return state.filter(task => task.id !== action.id)
      default:
        return state
    }
  }

  const TaskManager = () => {
    const [tasks, dispatch] = React.useReducer(tasksReducer, [])
    const [inputValue, setInputValue] = React.useState('')

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (inputValue.trim()) {
        dispatch({ type: 'ADD', text: inputValue })
        setInputValue('')
      }
    }

    return (
      <div className='space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
        <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
          Gestionnaire de tâches
        </h3>

        <form onSubmit={handleSubmit} className='flex gap-2'>
          <input
            type='text'
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder='Ajouter une tâche...'
            className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white'
          />
          <button
            type='submit'
            className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            Ajouter
          </button>
        </form>

        <ul className='space-y-2'>
          {tasks.map(task => (
            <li
              key={task.id}
              className='flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-md shadow'
            >
              <div className='flex items-center space-x-3'>
                <input
                  type='checkbox'
                  checked={task.completed}
                  onChange={() => dispatch({ type: 'TOGGLE', id: task.id })}
                  className='h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500'
                />
                <span
                  className={`${
                    task.completed
                      ? 'line-through text-gray-400'
                      : 'text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {task.text}
                </span>
              </div>
              <button
                onClick={() => dispatch({ type: 'DELETE', id: task.id })}
                className='text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                aria-label='Supprimer'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const renderTheoryContent = useCallback(() => {
    if (!lesson.content) {
      return (
        <p className='text-gray-500 dark:text-gray-400'>
          Aucun contenu théorique pour cette leçon.
        </p>
      )
    }

    // Détermine le contenu théorique en fonction du format
    const theoryContent =
      typeof lesson.content === 'string'
        ? lesson.content
        : typeof lesson.content === 'object' && lesson.content.theory
        ? lesson.content.theory
        : null

    if (!theoryContent) {
      return (
        <p className='text-gray-500 dark:text-gray-400'>
          Aucun contenu théorique pour cette leçon.
        </p>
      )
    }

    // Détecte si le contenu est déjà formaté en HTML avec des balises
    const hasHtmlTags = typeof theoryContent === 'string' && /<[a-z][\s\S]*>/i.test(theoryContent);
    
    // Contenu déjà formaté en HTML - rendu direct avec dangerouslySetInnerHTML
    if (hasHtmlTags) {
      return (
        <div 
          className='prose dark:prose-invert max-w-none'
          dangerouslySetInnerHTML={{ __html: theoryContent }}
        />
      );
    }
    
    // Traitement du contenu théorique ligne par ligne si non HTML
    if (typeof theoryContent === 'string') {
      const lines = theoryContent.split('\n')
      const elements: JSX.Element[] = []
      let currentParagraph: string[] = []
      let inCodeBlock = false
      let currentCodeBlock: string[] = []
      let codeLanguage = 'javascript'
      let inCodeSignature = false

      const flushParagraph = () => {
        if (currentParagraph.length > 0) {
          const paragraphContent = currentParagraph.join(' ')
          if (paragraphContent.trim()) {
            if (/<[a-z][\s\S]*>/i.test(paragraphContent)) {
              elements.push(
                <div
                  key={`p-${elements.length}`}
                  className='text-gray-700 dark:text-gray-300 leading-relaxed mb-4'
                  dangerouslySetInnerHTML={{ __html: paragraphContent }}
                />
              )
            } else {
              elements.push(
                <p
                  key={`p-${elements.length}`}
                  className='text-gray-700 dark:text-gray-300 leading-relaxed mb-4'
                >
                  {paragraphContent}
                </p>
              )
            }
          }
          currentParagraph = []
        }
      }

      const flushCodeBlock = () => {
        if (currentCodeBlock.length > 0) {
          while (
            currentCodeBlock.length > 0 &&
            currentCodeBlock[0].trim() === ''
          ) {
            currentCodeBlock.shift()
          }
          while (
            currentCodeBlock.length > 0 &&
            currentCodeBlock[currentCodeBlock.length - 1].trim() === ''
          ) {
            currentCodeBlock.pop()
          }

          if (currentCodeBlock.length > 0) {
            const code = currentCodeBlock.join('\n')
            elements.push(
              <div key={`code-${elements.length}`} className='my-6'>
                <CodeEditor
                  initialCode={code}
                  language={codeLanguage}
                  readOnly={true}
                  onCodeChange={() => {}}
                  onCodeRun={() => {}}
                />
              </div>
            )
          }
          currentCodeBlock = []
          codeLanguage = 'javascript'
        }
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const trimmedLine = line.trim()

        if (trimmedLine.startsWith('// ') && !inCodeBlock) {
          if (!inCodeSignature) {
            flushParagraph()
            inCodeSignature = true
            currentCodeBlock = []
            codeLanguage = 'typescript'
          }
          currentCodeBlock.push(trimmedLine)
          continue
        } else if (inCodeSignature) {
          if (trimmedLine === '') {
            flushCodeBlock()
            inCodeSignature = false
          } else if (trimmedLine.startsWith('// ')) {
            currentCodeBlock.push(trimmedLine)
          } else {
            flushCodeBlock()
            inCodeSignature = false
            currentParagraph.push(line)
          }
          continue
        }

        if (trimmedLine.startsWith('```')) {
          if (inCodeBlock) {
            flushCodeBlock()
          } else {
            flushParagraph()
            codeLanguage =
              trimmedLine.substring(3).trim().toLowerCase() || 'javascript'
          }
          inCodeBlock = !inCodeBlock
          continue
        }

        if (inCodeBlock) {
          currentCodeBlock.push(line)
        } else {
          if (trimmedLine.startsWith('## ')) {
            flushParagraph()
            elements.push(
              <h2
                key={`h2-${elements.length}`}
                className='text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-100 border-b pb-1 border-gray-300 dark:border-gray-700'
              >
                {trimmedLine.substring(3).trim()}
              </h2>
            )
          } else if (trimmedLine.startsWith('### ')) {
            flushParagraph()
            elements.push(
              <h3
                key={`h3-${elements.length}`}
                className='text-xl font-semibold mt-5 mb-2 text-gray-700 dark:text-gray-200'
              >
                {trimmedLine.substring(4).trim()}
              </h3>
            )
          } else if (trimmedLine === '') {
            flushParagraph()
          } else {
            currentParagraph.push(line)
          }
        }
      }

      flushParagraph()
      flushCodeBlock()

      return <div className='space-y-2'>{elements}</div>
    }

    if (Array.isArray(lesson.content)) {
      return (
        <div className='space-y-6'>
          {(lesson.content as ContentItem[]).map(
            (item: ContentItem, index: number) => {
              if (item && typeof item === 'object' && 'type' in item) {
                if (item.type === 'text' && 'content' in item) {
                  return (
                    <div
                      key={index}
                      className='prose dark:prose-invert max-w-none'
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  )
                } else if (item.type === 'code' && 'content' in item) {
                  return (
                    <div key={index} className='my-4'>
                      <CodeEditor
                        initialCode={item.content}
                        language={item.language || 'javascript'}
                        readOnly={true}
                        onCodeChange={() => {}}
                        onCodeRun={() => {}}
                      />
                    </div>
                  )
                } else if (
                  item.type === 'heading' &&
                  'content' in item &&
                  'level' in item
                ) {
                  if (item.level === 2)
                    return (
                      <h2
                        key={index}
                        className='text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-100 border-b pb-1 border-gray-300 dark:border-gray-700'
                      >
                        {item.content}
                      </h2>
                    )
                  if (item.level === 3)
                    return (
                      <h3
                        key={index}
                        className='text-xl font-semibold mt-5 mb-2 text-gray-700 dark:text-gray-200'
                      >
                        {item.content}
                      </h3>
                    )
                  return (
                    <p key={index}>
                      <b>{item.content}</b>
                    </p>
                  )
                } else if (item.type === 'paragraph' && 'content' in item) {
                  return (
                    <p
                      key={index}
                      className='text-gray-700 dark:text-gray-300 leading-relaxed mb-4'
                    >
                      {item.content}
                    </p>
                  )
                }
              }
              return (
                <div key={index} className='text-gray-700 dark:text-gray-300'>
                  {JSON.stringify(item)}
                </div>
              )
            }
          )}
        </div>
      )
    }

    // Traitement spécial pour le contenu de type object avec HTML intégré
    if (typeof lesson.content === 'object' && lesson.content.theory) {
      return (
        <div 
          className='prose dark:prose-invert max-w-none'
          dangerouslySetInnerHTML={{ __html: lesson.content.theory }}
        />
      );
    }
    
    return (
      <div className='text-gray-700 dark:text-gray-300'>
        {JSON.stringify(lesson.content)}
      </div>
    )
  }, [lesson.content])

  const renderExercise = () => {
    // Récupère l'exercice soit de lesson.exercise, soit de lesson.content.exercise
    const exerciseContent =
      lesson.exercise ||
      (typeof lesson.content === 'object' && lesson.content.exercise
        ? lesson.content.exercise
        : null)

    if (!exerciseContent) return null
    
    // Gestion des contenus HTML dans la description
    const hasHtmlDescription = 
      typeof exerciseContent.description === 'string' && 
      /<[a-z][\s\S]*>/i.test(exerciseContent.description);

    return (
      <div className='space-y-6'>
        <h2 className='text-2xl font-bold text-gray-800 dark:text-white'>
          {exerciseContent.title || 'Exercice'}
        </h2>
        {exerciseContent.description && (
          hasHtmlDescription ? (
            <div 
              className='text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none'
              dangerouslySetInnerHTML={{ __html: exerciseContent.description }}
            />
          ) : (
            <p className='text-gray-700 dark:text-gray-300'>
              {exerciseContent.description}
            </p>
          )
        )}
        <ExerciseComponent
          exercise={exerciseContent}
          onComplete={() => completeSection('exercise')}
        />
      </div>
    )
  }

  const renderQuiz = () => {
    // Récupère le quiz soit de lesson.quiz, soit de lesson.content.quiz
    const quizContent =
      lesson.quiz ||
      (typeof lesson.content === 'object' && lesson.content.quiz
        ? lesson.content.quiz
        : null)

    if (!quizContent) return null

    return (
      <QuizComponent
        quiz={quizContent}
        onComplete={() => completeSection('quiz')}
      />
    )
  }

  const renderProject = () => {
    // Récupère le projet soit de lesson.project, soit de lesson.content.project
    const projectContent =
      lesson.project ||
      (typeof lesson.content === 'object' && lesson.content.project
        ? lesson.content.project
        : null)

    if (!projectContent) return null
    
    // Gestion des contenus HTML dans la description
    const hasHtmlDescription = 
      typeof projectContent.description === 'string' && 
      /<[a-z][\s\S]*>/i.test(projectContent.description);

    return (
      <div>
        <h2 className='text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100'>
          {projectContent.title}
        </h2>
        {hasHtmlDescription ? (
          <div 
            className='text-gray-600 dark:text-gray-300 mb-4 prose dark:prose-invert max-w-none'
            dangerouslySetInnerHTML={{ __html: projectContent.description }}
          />
        ) : (
          <p className='text-gray-600 dark:text-gray-300 mb-4'>
            {projectContent.description}
          </p>
        )}
        <CodeEditor
          initialCode={projectContent.initialCode}
          language={projectContent.language || 'javascript'}
          onCodeChange={() => {}}
          onCodeRun={() => completeSection('project')}
        />
      </div>
    )
  }

  // Fonction pour traiter les balises div.code-example dans le contenu HTML
  const processHTMLWithCodeBlocks = useCallback((htmlContent: string) => {
    if (!htmlContent) return '';
    
    // Utilisation d'une expression régulière pour trouver les balises div.code-example
    const codeBlockRegex = /<div class="code-example">[\s\S]*?<pre><code>([\s\S]*?)<\/code><\/pre>[\s\S]*?<\/div>/gi;
    
    // Remplace chaque bloc de code trouvé par une version formatée
    const processedHTML = htmlContent.replace(codeBlockRegex, (match, codeContent) => {
      // Extraction du langage s'il est mentionné (comme "Typescript")
      const langMatch = match.match(/<div[^>]*>([\s\S]*?)<pre>/i);
      let language = 'javascript'; // Par défaut
      
      if (langMatch && langMatch[1]) {
        const langText = langMatch[1].toLowerCase();
        if (langText.includes('typescript')) {
          language = 'typescript';
        } else if (langText.includes('javascript')) {
          language = 'javascript';
        } // Ajoutez d'autres langages au besoin
      }
      
      // Nettoie le contenu du code des caractères d'échappement
      const cleanedCode = codeContent
        .replace(/\\\\\\\\/g, '\\')  // Remplace les doubles backslashes échappés
        .replace(/\\\\\$/g, '$')     // Gère les $ échappés
        .replace(/\\\\\{/g, '{')     // Gère les accolades échappées
        .replace(/\\\\\}/g, '}')
        .replace(/\\\\`/g, '`');     // Gère les backticks échappés
      
      // Renvoie une div qui contiendra l'éditeur de code
      return `<div class="code-editor" data-code="${encodeURIComponent(cleanedCode)}" data-language="${language}"></div>`;
    });
    
    return processedHTML;
  }, []);

  // Fonction pour rendre le contenu HTML traité avec les blocs de code
  const renderHTMLWithCodeBlocks = useCallback((htmlContent: string) => {
    const processedHTML = processHTMLWithCodeBlocks(htmlContent);
    
    // Création d'un élément temporaire pour analyser le HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedHTML;
    
    // Récupération de tous les éditeurs de code
    const codeEditors = tempDiv.querySelectorAll('.code-editor');
    const elements: JSX.Element[] = [];
    
    // Fonction pour ajouter le texte entre deux éléments d'éditeur de code
    const addTextBetween = (html: string) => {
      if (html.trim()) {
        elements.push(
          <div 
            key={`html-${elements.length}`}
            className='prose dark:prose-invert max-w-none'
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }
    };
    
    // Traitement du HTML avec les éditeurs de code
    let currentNode = tempDiv.firstChild;
    let htmlParts = processedHTML.split('<div class="code-editor"');
    
    // Ajout de la première partie HTML (avant le premier éditeur)
    if (htmlParts.length > 0) {
      addTextBetween(htmlParts[0]);
    }
    
    // Traitement des éditeurs de code
    codeEditors.forEach((editor, index) => {
      const code = decodeURIComponent(editor.getAttribute('data-code') || '');
      const language = editor.getAttribute('data-language') || 'javascript';
      
      // Ajout de l'éditeur de code
      elements.push(
        <div key={`code-${index}`} className='my-6'>
          <CodeEditor
            initialCode={code}
            language={language}
            readOnly={true}
            onCodeChange={() => {}}
            onCodeRun={() => {}}
          />
        </div>
      );
      
      // Ajout du texte suivant (s'il y en a)
      if (index + 1 < htmlParts.length) {
        // Extraire la partie après cette balise d'éditeur mais avant la suivante
        const nextPart = htmlParts[index + 1];
        const closingDivPos = nextPart.indexOf('</div>');
        if (closingDivPos !== -1) {
          const textAfter = nextPart.substring(closingDivPos + 6);
          addTextBetween(textAfter);
        }
      }
    });
    
    return <div className='space-y-4'>{elements}</div>;
  }, [processHTMLWithCodeBlocks]);

  // Version améliorée de renderTheoryContent qui utilise renderHTMLWithCodeBlocks
  const renderTheoryContentEnhanced = useCallback(() => {
    if (!lesson.content) {
      return (
        <p className='text-gray-500 dark:text-gray-400'>
          Aucun contenu théorique pour cette leçon.
        </p>
      )
    }

    // Détermine le contenu théorique en fonction du format
    const theoryContent =
      typeof lesson.content === 'string'
        ? lesson.content
        : typeof lesson.content === 'object' && lesson.content.theory
        ? lesson.content.theory
        : null

    if (!theoryContent) {
      return (
        <p className='text-gray-500 dark:text-gray-400'>
          Aucun contenu théorique pour cette leçon.
        </p>
      )
    }

    // Rendu du contenu théorique avec traitement des blocs de code
    return renderHTMLWithCodeBlocks(theoryContent);
  }, [lesson.content, renderHTMLWithCodeBlocks]);

  return (
    <div>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 border border-gray-200 dark:border-gray-700'>
        <div className='flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto'>
          {availableSections.map((sectionKey: string, index: number) => (
            <button
              key={sectionKey}
              onClick={() => setActiveSection(sectionKey)}
              className={`px-4 sm:px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors relative focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 ${
                activeSection === sectionKey
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <div className='flex items-center'>
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center mr-2 text-xs font-bold shadow-sm transition-all
                  ${
                    activeSection === sectionKey
                      ? 'bg-indigo-500 text-white scale-110'
                      : sectionCompleted[sectionKey]
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {sectionCompleted[sectionKey] ? '✓' : index + 1}
                </div>
                <span className='hidden sm:inline'>
                  {sectionDisplayNames[sectionKey] ||
                    sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}
                </span>
                <span className='sm:hidden'>{index + 1}</span>
              </div>

              {activeSection === sectionKey && (
                <motion.div
                  layoutId='activeLessonSectionTab'
                  className='absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-400'
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className='mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
        <div className='flex justify-between items-center mb-1'>
          <span className='text-xs font-medium text-gray-600 dark:text-gray-300'>
            Progression de la leçon
          </span>
          <span className='text-xs font-semibold text-indigo-600 dark:text-indigo-400'>
            {currentProgress}%
          </span>{' '}
          {/* Use currentProgress */}
        </div>
        <div className='w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${currentProgress}%` }}
            transition={{ duration: 0.5, ease: 'circOut' }}
            className='h-full bg-gradient-to-r from-indigo-500 to-purple-600'
          />
        </div>
      </div>

      {lesson.prerequisites && lesson.prerequisites.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className='mb-6 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-4 rounded-md text-sm border border-blue-200 dark:border-blue-700'
        >
          <h4 className='font-semibold mb-1 text-blue-800 dark:text-blue-200'>
            Prérequis :
          </h4>
          <ul className='list-disc list-inside space-y-1'>
            {lesson.prerequisites.map((prereq: string, index: number) => (
              <li key={index}>
                {/^\d+-\d+$/.test(prereq) ? (
                  <Link
                    href={`/lessons/module/${prereq.split('-')[0]}/lesson/${
                      prereq.split('-')[1]
                    }`}
                    className='text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 font-medium'
                  >
                    {formatPrerequisiteDisplay(prereq, lessonTitles)}
                  </Link>
                ) : (
                  <span className='font-medium'>
                    {formatPrerequisiteDisplay(prereq, lessonTitles)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 min-h-[300px]'>
        <AnimatePresence mode='wait'>
          {activeSection === 'theory' && (
            <motion.div
              key='theory'
              variants={contentVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
            >
              {renderTheoryContentEnhanced()}
            </motion.div>
          )}

          {activeSection === 'example' &&
            (lesson.example ||
              (lesson.examples && lesson.examples.length > 0)) && (
              <motion.div
                key='example'
                variants={contentVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
              >
                <h2 className='text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100'>
                  Exemple Pratique
                </h2>
                {(lesson.examples && lesson.examples.length > 0
                  ? lesson.examples
                  : lesson.example
                  ? [lesson.example]
                  : []
                ).map((ex, idx) => (
                  <div
                    key={idx}
                    className='mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50'
                  >
                    <h3 className='text-xl font-medium mb-2 text-gray-700 dark:text-gray-200'>
                      {ex.title}
                    </h3>
                    <CodeEditor
                      initialCode={ex.code}
                      language={ex.language || 'javascript'}
                      readOnly={true}
                      onCodeChange={() => {}}
                      onCodeRun={() => {}}
                    />
                    {ex.explanation && (
                      <p className='text-sm text-gray-600 dark:text-gray-400 mt-3 italic'>
                        {ex.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

          {activeSection === 'practice' && lesson.practice && (
            <motion.div
              key='practice'
              variants={contentVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
            >
              <h2 className='text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100'>
                Mise en Pratique
              </h2>
              <p className='text-gray-600 dark:text-gray-300 mb-4'>
                Essayez d&apos;écrire le code vous-même. Comparez avec la
                solution si besoin.
              </p>
              <CodeEditor
                initialCode={practiceCode}
                language={lesson.practice.language || 'javascript'}
                onCodeChange={setPracticeCode}
                onCodeRun={() =>
                  console.log('Running practice code:', practiceCode)
                }
              />
            </motion.div>
          )}

          {activeSection === 'exercise' &&
            (lesson.exercise ||
              (typeof lesson.content === 'object' &&
                lesson.content.exercise)) && (
              <motion.div
                key='exercise'
                variants={contentVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
              >
                {renderExercise()}
              </motion.div>
            )}

          {activeSection === 'quiz' &&
            (lesson.quiz ||
              (typeof lesson.content === 'object' && lesson.content.quiz)) && (
              <motion.div
                key='quiz'
                variants={contentVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
              >
                {renderQuiz()}
              </motion.div>
            )}

          {activeSection === 'project' &&
            (lesson.project ||
              (typeof lesson.content === 'object' &&
                lesson.content.project)) && (
              <motion.div
                key='project'
                variants={contentVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
              >
                {renderProject()}
              </motion.div>
            )}

          {activeSection === 'theory' && !lesson.content && (
            <p className='text-gray-500 dark:text-gray-400'>
              Aucun contenu théorique pour cette leçon.
            </p>
          )}
          {activeSection === 'example' &&
            !(
              lesson.example ||
              (lesson.examples && lesson.examples.length > 0)
            ) && (
              <p className='text-gray-500 dark:text-gray-400'>
                Aucun exemple pour cette leçon.
              </p>
            )}
          {activeSection === 'practice' && !lesson.practice && (
            <p className='text-gray-500 dark:text-gray-400'>
              Aucune section de pratique pour cette leçon.
            </p>
          )}
          {activeSection === 'exercise' &&
            !lesson.exercise &&
            !(
              typeof lesson.content === 'object' && lesson.content.exercise
            ) && (
              <p className='text-gray-500 dark:text-gray-400'>
                Aucun exercice pour cette leçon.
              </p>
            )}
          {activeSection === 'quiz' &&
            !lesson.quiz &&
            !(typeof lesson.content === 'object' && lesson.content.quiz) && (
              <p className='text-gray-500 dark:text-gray-400'>
                Aucun quiz pour cette leçon.
              </p>
            )}
          {activeSection === 'project' &&
            !lesson.project &&
            !(typeof lesson.content === 'object' && lesson.content.project) && (
              <p className='text-gray-500 dark:text-gray-400'>
                Aucun projet pour cette leçon.
              </p>
            )}
        </AnimatePresence>

        <div className='mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center'>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={navigateToPreviousSection}
            disabled={availableSections.indexOf(activeSection) === 0}
            className='px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 mr-2'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
            Précédent
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (!sectionCompleted[activeSection]) {
                completeSection(activeSection) // This will also update progress via useEffect
              } else if (
                availableSections.indexOf(activeSection) <
                availableSections.length - 1
              ) {
                navigateToNextSection()
              } else {
                console.log('Toutes les sections de la leçon sont complétées!')
                // Potentially navigate to next lesson if available via `availableLessons.next`
                if (availableLessons.next) {
                  const nextLessonParts = availableLessons.next.id.split('-')
                  // Router.push or Link to `/lessons/module/${moduleId}/lesson/${nextLessonParts[1]}`
                }
              }
            }}
            // Button logic:
            // - If current section is not completed -> "Compléter et Continuer" or "Terminer la section"
            // - If current section is completed AND it's not the last -> "Continuer"
            // - If current section is completed AND it's the last -> "Leçon Terminée" (disabled or navigates to module page)
            className='px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed text-sm'
          >
            {availableSections.indexOf(activeSection) <
            availableSections.length - 1
              ? sectionCompleted[activeSection]
                ? 'Continuer'
                : `Compléter "${sectionDisplayNames[activeSection]}" et Continuer`
              : sectionCompleted[activeSection]
              ? 'Leçon Terminée'
              : `Terminer "${sectionDisplayNames[activeSection]}"`}
            {(availableSections.indexOf(activeSection) <
              availableSections.length - 1 ||
              !sectionCompleted[activeSection]) && (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4 inline-block ml-2'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            )}
          </motion.button>
        </div>
      </div>

      <div className='mt-10'>
        <LessonProgress
          currentLessonId={lesson.id}
          moduleId={moduleId}
          isNextLessonAvailable={!!availableLessons.next}
          isPrevLessonAvailable={!!availableLessons.prev}
        />
      </div>
    </div>
  )
}