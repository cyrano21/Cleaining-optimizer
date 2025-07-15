'use client'

import { CV, Experience, Education, Skill, Language, Summary, Project } from '../utils/types'
import { Mail, Phone, MapPin, Globe, Linkedin, Calendar, Building, GraduationCap, Award, ExternalLink } from 'lucide-react'
import Image from 'next/image'

export default function ExecutiveTemplate({ cv }: { cv: CV }) {
  const { personalInfo, sections } = cv
  
  const summarySection = sections.find(section => section.id === 'summary')
  const experienceSection = sections.find(section => section.id === 'experience')
  const educationSection = sections.find(section => section.id === 'education')
  const skillsSection = sections.find(section => section.id === 'skills')
  const languagesSection = sections.find(section => section.id === 'languages')
  const projectsSection = sections.find(section => section.id === 'projects')
  
  return (
    <div className="bg-white font-serif max-w-4xl mx-auto shadow-2xl">
      {/* Executive Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/5 to-transparent rounded-full -ml-16 -mb-16"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {personalInfo.photo && (
              <div className="relative flex-shrink-0">
                <Image
                  src={personalInfo.photo}
                  alt="Photo de profil"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white/20 shadow-2xl"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent to-black/20"></div>
              </div>
            )}
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold tracking-wider mb-2 text-white">
                {personalInfo.firstName} {personalInfo.lastName}
              </h1>
              {personalInfo.title && (
                <h2 className="text-xl md:text-2xl font-light text-gray-300 mb-6 tracking-wide">
                  {personalInfo.title}
                </h2>
              )}
              
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {personalInfo.email && (
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{personalInfo.phone}</span>
                  </div>
                )}
                {(personalInfo.address || personalInfo.city) && (
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {[personalInfo.address, personalInfo.city].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{personalInfo.website}</span>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <Linkedin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{personalInfo.linkedin}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Executive Summary */}
        {summarySection && (summarySection.content as Summary).content && (
          <section className="mb-8 bg-gray-50 p-6 rounded-lg border-l-4 border-gray-800">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 uppercase tracking-wide flex items-center">
              <Award className="w-6 h-6 mr-3 text-gray-800" />
              {summarySection.title}
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg">
              {(summarySection.content as Summary).content}
            </p>
          </section>
        )}

        {/* Professional Experience */}
        {experienceSection && (experienceSection.content as Experience[]).length > 0 && (
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 uppercase tracking-wide border-b-2 border-gray-800 pb-2 flex items-center">
              <Building className="w-6 h-6 mr-3" />
              {experienceSection.title}
            </h3>
            <div className="space-y-8">
              {(experienceSection.content as Experience[]).map((experience, index) => (
                <div key={experience.id} className="relative">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{experience.title}</h4>
                        <div className="text-gray-700 font-semibold mb-2 flex items-center">
                          <Building className="w-4 h-4 mr-2 text-gray-600" />
                          {experience.company} • {experience.location}
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="font-medium">
                          {experience.startDate} - {experience.current ? 'Présent' : experience.endDate}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{experience.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {educationSection && (educationSection.content as Education[]).length > 0 && (
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 uppercase tracking-wide border-b-2 border-gray-800 pb-2 flex items-center">
              <GraduationCap className="w-6 h-6 mr-3" />
              {educationSection.title}
            </h3>
            <div className="space-y-6">
              {(educationSection.content as Education[]).map((education, index) => (
                <div key={education.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{education.degree}</h4>
                      <div className="text-gray-700 font-semibold mb-2 flex items-center">
                        <GraduationCap className="w-4 h-4 mr-2 text-gray-600" />
                        {education.institution} • {education.location}
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="font-medium">
                        {education.startDate} - {education.current ? 'En cours' : education.endDate}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{education.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills and Languages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Core Competencies */}
          {skillsSection && (skillsSection.content as Skill[]).length > 0 && (
            <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-2">
                Compétences Clés
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {(skillsSection.content as Skill[]).map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-800">{skill.name}</span>
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {skill.level === 'beginner' && 'Débutant'}
                      {skill.level === 'intermediate' && 'Intermédiaire'}
                      {skill.level === 'advanced' && 'Avancé'}
                      {skill.level === 'expert' && 'Expert'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {languagesSection && (languagesSection.content as Language[]).length > 0 && (
            <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-2">
                Langues
              </h3>
              <div className="space-y-3">
                {(languagesSection.content as Language[]).map((language) => (
                  <div key={language.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-800">{language.name}</span>
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {language.level === 'native' ? 'Langue maternelle' : language.level}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Projects */}
        {projectsSection && Array.isArray(projectsSection.content) && projectsSection.content.length > 0 && (
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 uppercase tracking-wide border-b-2 border-gray-800 pb-2 flex items-center">
              <ExternalLink className="w-6 h-6 mr-3" />
              {projectsSection.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(projectsSection.content as Project[]).map((project) => (
                <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-bold text-gray-900">{project.title}</h4>
                    {(project.startDate || project.endDate) && (
                      <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {project.startDate} {project.endDate && `- ${project.endDate}`}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3 leading-relaxed">{project.description}</p>
                  {project.url && (
                    <a 
                      href={project.url} 
                      className="text-gray-800 hover:text-gray-600 font-medium text-sm flex items-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Voir le projet
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white p-6 text-center">
        <p className="text-sm text-gray-400">
          CV généré par Job Finder - Plateforme de recherche d&apos;emploi IA
        </p>
      </footer>
    </div>
  )
}