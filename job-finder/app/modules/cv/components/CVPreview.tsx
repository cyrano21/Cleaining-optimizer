'use client'

import { useCV } from '../utils/cv-context'
import { CV, Experience, Education, Skill, Language, Summary } from '../utils/types'
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react'
import Image from 'next/image'

// Import des nouveaux modèles de CV
import ModernTemplate from './ModernTemplate'
import ExecutiveTemplate from './ExecutiveTemplate'
import MinimalTemplate from './MinimalTemplate'

interface CVPreviewProps {
  className?: string
  cvOverride?: CV
}

export default function CVPreview({ className, cvOverride }: CVPreviewProps) {
  const { cv: contextCV } = useCV()
  const cvToRender = cvOverride || contextCV
  
  // Si le modèle est l'un des nouveaux modèles et n'existe pas dans le CV actuel, utilisez le modèle professionnel
  if (!cvOverride && (cvToRender.template === 'modern' || cvToRender.template === 'executive' || cvToRender.template === 'minimal')) {
    // Créez une copie du CV actuel avec le modèle professionnel
    const fallbackCV = { ...cvToRender, template: 'professional' as const }
    return <CVPreview className={className} cvOverride={fallbackCV} />
  }
  
  const renderTemplate = () => {
    switch (cvToRender.template) {
      case 'modern':
        return <ModernTemplate cv={cvToRender} />
      case 'executive':
        return <ExecutiveTemplate cv={cvToRender} />
      case 'minimal':
        return <MinimalTemplate cv={cvToRender} />
      case 'professional':
        return <ProfessionalTemplate cv={cvToRender} />
      case 'creative':
        return <CreativeTemplate cv={cvToRender} />
      case 'simple':
        return <SimpleTemplate cv={cvToRender} />
      case 'modern':
        return <ModernTemplate cv={cvToRender} />
      case 'executive':
        return <ExecutiveTemplate cv={cvToRender} />
      case 'minimal':
        return <MinimalTemplate cv={cvToRender} />
      default:
        return <ProfessionalTemplate cv={cvToRender} />
    }
  }
  
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">Aperçu en temps réel</h3>
      </div>
      
      <div className="p-6 overflow-hidden">
        {renderTemplate()}
      </div>
    </div>
  )
}

function ProfessionalTemplate({ cv }: { cv: CV }) {
  const { personalInfo, sections } = cv
  
  const summarySection = sections.find(section => section.id === 'summary')
  const experienceSection = sections.find(section => section.id === 'experience')
  const educationSection = sections.find(section => section.id === 'education')
  const skillsSection = sections.find(section => section.id === 'skills')
  const languagesSection = sections.find(section => section.id === 'languages')
  
  return (
    <div className="font-sans max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Sidebar */}
      <aside className="md:col-span-6 bg-blue-600 text-white p-6 rounded-lg">
        {personalInfo.photo && (
          <Image
            src={personalInfo.photo}
            alt="Photo"
            width={96}
            height={96}
            className="rounded-full mx-auto mb-4"
          />
        )}
        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        <ul className="space-y-2">
          {personalInfo.email && (
            <li className="flex items-center"> 
              <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="overflow-visible">{personalInfo.email}</span>
            </li>
          )}
          {personalInfo.phone && (
            <li className="flex items-center">
              <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{personalInfo.phone}</span>
            </li>
          )}
          {personalInfo.address && (
            <li className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{personalInfo.address}, {personalInfo.city}</span>
            </li>
          )}
          {personalInfo.website && (
            <li className="flex items-center">
              <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="overflow-visible">{personalInfo.website}</span>
            </li>
          )}
          {personalInfo.linkedin && (
            <li className="flex items-center">
              <Linkedin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="overflow-visible">{personalInfo.linkedin}</span>
            </li>
          )}
          
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">Compétences</h2>
        <ul className="list-disc list-inside text-white">
          {skillsSection && (skillsSection.content as Skill[]).map(skill => <li key={skill.id}>{skill.name}</li>)}
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">Langues</h2>
        <ul className="list-disc list-inside text-white">
          {languagesSection && (languagesSection.content as Language[]).map(lang => (
            <li key={lang.id}>{lang.name}: {lang.level === 'native' ? 'Langue maternelle' : lang.level}</li>
          ))}
        </ul>
      </aside>
      {/* Main content */}
      <div className="md:col-span-6 bg-white p-6 rounded-lg">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{personalInfo.firstName} {personalInfo.lastName}</h1>
          {personalInfo.title && <h2 className="text-xl text-gray-600 mt-1">{personalInfo.title}</h2>}
        </header>
        {/* Résumé */}
        {summarySection && (summarySection.content as Summary).content && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-3">{summarySection.title}</h3>
            <p className="text-gray-700">{(summarySection.content as Summary).content}</p>
          </section>
        )}
        {/* Expériences */}
        {experienceSection && (experienceSection.content as Experience[]).length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-3">{experienceSection.title}</h3>
            <div className="border-l-2 border-gray-300 pl-4">
              {(experienceSection.content as Experience[]).map(exp => (
                <div key={exp.id} className="mb-6 flex items-start relative">
                  <div className="w-4 flex-shrink-0 flex justify-center pt-1">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-1"></div>
                  </div>
                  <div className="pl-3">
                    <h4 className="font-medium">{exp.title}</h4>
                    <span className="text-sm text-gray-600">{exp.startDate} - {exp.current ? 'Présent' : exp.endDate}</span>
                    <p className="text-sm text-gray-700">{exp.company}, {exp.location}</p>
                    <p className="mt-1 text-sm">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* Formations */}
        {educationSection && (educationSection.content as Education[]).length > 0 && (
          <section>
            <h3 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-3">{educationSection.title}</h3>
            <div className="border-l-2 border-gray-300 pl-4">
              {(educationSection.content as Education[]).map(ed => (
                <div key={ed.id} className="mb-6 flex items-start relative">
                  <div className="w-4 flex-shrink-0 flex justify-center pt-1">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-1"></div>
                  </div>
                  <div className="pl-3">
                    <h4 className="font-medium">{ed.degree}</h4>
                    <span className="text-sm text-gray-600">{ed.startDate} - {ed.current ? 'En cours' : ed.endDate}</span>
                    <p className="text-sm text-gray-700">{ed.institution}, {ed.location}</p>
                    <p className="mt-1 text-sm">{ed.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function CreativeTemplate({ cv }: { cv: CV }) {
  const { personalInfo, sections } = cv
  
  const summarySection = sections.find(section => section.id === 'summary')
  const experienceSection = sections.find(section => section.id === 'experience')
  const educationSection = sections.find(section => section.id === 'education')
  const skillsSection = sections.find(section => section.id === 'skills')
  const languagesSection = sections.find(section => section.id === 'languages')
  
  return (
    <div className="font-sans max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8 bg-gradient-to-r from-purple-600 to-blue-500 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold">
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        {personalInfo.title && (
          <h2 className="text-xl mt-1 opacity-90">{personalInfo.title}</h2>
        )}
        
        <div className="mt-4 text-sm flex flex-wrap gap-4 opacity-80">
          {personalInfo.email && (
            <div>Email: {personalInfo.email}</div>
          )}
          {personalInfo.phone && (
            <div>Téléphone: {personalInfo.phone}</div>
          )}
          {personalInfo.address && (
            <div>
              {personalInfo.address}, {personalInfo.city} {personalInfo.postalCode}, {personalInfo.country}
            </div>
          )}
          {personalInfo.linkedin && (
            <div>LinkedIn: {personalInfo.linkedin}</div>
          )}
        </div>
      </header>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          {/* Summary */}
          {summarySection && (summarySection.content as Summary).content && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold text-purple-600 mb-3">
                {summarySection.title}
              </h3>
              <p className="text-gray-700">
                {(summarySection.content as Summary).content}
              </p>
            </section>
          )}
          
          {/* Experience */}
          {experienceSection && (experienceSection.content as Experience[]).length > 0 && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold text-purple-600 mb-3">
                {experienceSection.title}
              </h3>
              <div className="space-y-4">
                {(experienceSection.content as Experience[]).map((experience) => (
                  <div key={experience.id} className="border-l-2 border-purple-300 pl-4">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{experience.title}</h4>
                      <span className="text-sm text-gray-600">
                        {experience.startDate} - {experience.current ? 'Présent' : experience.endDate}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {experience.company}, {experience.location}
                    </p>
                    <p className="mt-1 text-sm">{experience.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Education */}
          {educationSection && (educationSection.content as Education[]).length > 0 && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold text-purple-600 mb-3">
                {educationSection.title}
              </h3>
              <div className="space-y-4">
                {(educationSection.content as Education[]).map((education) => (
                  <div key={education.id} className="border-l-2 border-purple-300 pl-4">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{education.degree}</h4>
                      <span className="text-sm text-gray-600">
                        {education.startDate} - {education.current ? 'En cours' : education.endDate}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {education.institution}, {education.location}
                    </p>
                    <p className="mt-1 text-sm">{education.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        
        <div className="col-span-1">
          {/* Skills */}
          {skillsSection && (skillsSection.content as Skill[]).length > 0 && (
            <section className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-600 mb-3">
                {skillsSection.title}
              </h3>
              <div className="space-y-2">
                {(skillsSection.content as Skill[]).map((skill) => (
                  <div key={skill.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{skill.name}</span>
                      <span className="text-xs text-gray-500">
                        {skill.level === 'beginner' ? 'Débutant' : 
                         skill.level === 'intermediate' ? 'Intermédiaire' : 
                         skill.level === 'advanced' ? 'Avancé' : 'Expert'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-purple-600 h-1.5 rounded-full" 
                        style={{ 
                          width: skill.level === 'beginner' ? '25%' : 
                                 skill.level === 'intermediate' ? '50%' : 
                                 skill.level === 'advanced' ? '75%' : '100%' 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Languages */}
          {languagesSection && (languagesSection.content as Language[]).length > 0 && (
            <section className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-600 mb-3">
                {languagesSection.title}
              </h3>
              <div className="space-y-2">
                {(languagesSection.content as Language[]).map((language) => (
                  <div key={language.id}>
                    <div className="flex justify-between">
                      <span className="text-sm">{language.name}</span>
                      <span className="text-xs text-gray-500">
                        {language.level === 'native' ? 'Langue maternelle' : language.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function SimpleTemplate({ cv }: { cv: CV }) {
  const { personalInfo, sections } = cv
  
  const summarySection = sections.find(section => section.id === 'summary')
  const experienceSection = sections.find(section => section.id === 'experience')
  const educationSection = sections.find(section => section.id === 'education')
  const skillsSection = sections.find(section => section.id === 'skills')
  const languagesSection = sections.find(section => section.id === 'languages')
  
  return (
    <div className="font-sans max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        {personalInfo.title && (
          <h2 className="text-xl text-gray-600 mt-1">{personalInfo.title}</h2>
        )}
        
        <div className="mt-4 text-sm text-gray-600 flex flex-wrap justify-center gap-4">
          {personalInfo.email && (
            <div>{personalInfo.email}</div>
          )}
          {personalInfo.phone && (
            <div>{personalInfo.phone}</div>
          )}
          {personalInfo.address && (
            <div>
              {personalInfo.address}, {personalInfo.city} {personalInfo.postalCode}, {personalInfo.country}
            </div>
          )}
        </div>
      </header>
      
      {/* Summary */}
      {summarySection && (summarySection.content as Summary).content && (
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-center mb-3">
            {summarySection.title}
          </h3>
          <p className="text-gray-700 text-center">
            {(summarySection.content as Summary).content}
          </p>
        </section>
      )}
      
      {/* Experience */}
      {experienceSection && (experienceSection.content as Experience[]).length > 0 && (
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-center mb-3">
            {experienceSection.title}
          </h3>
          <div className="space-y-4">
            {(experienceSection.content as Experience[]).map((experience) => (
              <div key={experience.id}>
                <div className="flex justify-between">
                  <h4 className="font-medium">{experience.title}</h4>
                  <span className="text-sm text-gray-600">
                    {experience.startDate} - {experience.current ? 'Présent' : experience.endDate}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {experience.company}, {experience.location}
                </p>
                <p className="mt-1 text-sm">{experience.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Education */}
      {educationSection && (educationSection.content as Education[]).length > 0 && (
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-center mb-3">
            {educationSection.title}
          </h3>
          <div className="space-y-4">
            {(educationSection.content as Education[]).map((education) => (
              <div key={education.id}>
                <div className="flex justify-between">
                  <h4 className="font-medium">{education.degree}</h4>
                  <span className="text-sm text-gray-600">
                    {education.startDate} - {education.current ? 'En cours' : education.endDate}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {education.institution}, {education.location}
                </p>
                <p className="mt-1 text-sm">{education.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      
      <div className="grid grid-cols-2 gap-6">
        {/* Skills */}
        {skillsSection && (skillsSection.content as Skill[]).length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-center mb-3">
              {skillsSection.title}
            </h3>
            <div className="space-y-1">
              {(skillsSection.content as Skill[]).map((skill) => (
                <div key={skill.id}>
                  <span className="text-sm">{skill.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Languages */}
        {languagesSection && (languagesSection.content as Language[]).length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-center mb-3">
              {languagesSection.title}
            </h3>
            <div className="space-y-1">
              {(languagesSection.content as Language[]).map((language) => (
                <div key={language.id}>
                  <span className="text-sm">{language.name}: </span>
                  <span className="text-sm text-gray-700">
                    {language.level === 'native' ? 'Langue maternelle' : language.level}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
