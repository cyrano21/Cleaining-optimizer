'use client'

import { CV, Experience, Education, Skill, Language, Summary, Project } from '../utils/types'
import { Mail, Phone, MapPin, Globe, Linkedin, ExternalLink, Dot } from 'lucide-react'
import Image from 'next/image'

export default function MinimalTemplate({ cv }: { cv: CV }) {
  const { personalInfo, sections } = cv
  
  const summarySection = sections.find(section => section.id === 'summary')
  const experienceSection = sections.find(section => section.id === 'experience')
  const educationSection = sections.find(section => section.id === 'education')
  const skillsSection = sections.find(section => section.id === 'skills')
  const languagesSection = sections.find(section => section.id === 'languages')
  const projectsSection = sections.find(section => section.id === 'projects')
  const projectItems = Array.isArray(projectsSection?.content) ? (projectsSection.content as Project[]) : []
  
  return (
    <div className="bg-white font-sans max-w-4xl mx-auto p-8 min-h-screen">
      {/* Clean Header */}
      <header className="mb-12 text-center">
        {personalInfo.photo && (
          <div className="mb-6">
            <Image
              src={personalInfo.photo}
              alt="Photo de profil"
              width={100}
              height={100}
              className="rounded-full mx-auto border-2 border-gray-200 shadow-sm"
            />
          </div>
        )}
        
        <h1 className="text-4xl font-light mb-2 text-gray-900 tracking-wide">
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        {personalInfo.title && (
          <h2 className="text-lg text-gray-600 mb-6 font-light">
            {personalInfo.title}
          </h2>
        )}
        
        {/* Contact Info as inline list */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          {personalInfo.email && (
            <div className="flex items-center">
              <Mail size={14} className="mr-1.5 text-gray-400" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center">
              <Phone size={14} className="mr-1.5 text-gray-400" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {(personalInfo.address || personalInfo.city) && (
            <div className="flex items-center">
              <MapPin size={14} className="mr-1.5 text-gray-400" />
              <span>
                {[personalInfo.address, personalInfo.city].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center">
              <Globe size={14} className="mr-1.5 text-gray-400" />
              <span>{personalInfo.website}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center">
              <Linkedin size={14} className="mr-1.5 text-gray-400" />
              <span>{personalInfo.linkedin}</span>
            </div>
          )}
        </div>
      </header>

      {/* Subtle divider */}
      <div className="w-24 h-px bg-gray-300 mx-auto mb-12"></div>

      {/* Content */}
      <div className="space-y-12">
        {/* Summary */}
        {summarySection && (summarySection.content as Summary).content && (
          <section>
            <h3 className="text-lg font-normal mb-4 text-gray-900 tracking-wide">
              {summarySection.title}
            </h3>
            <p className="text-gray-700 leading-relaxed max-w-3xl">
              {(summarySection.content as Summary).content}
            </p>
          </section>
        )}

        {/* Experience */}
        {experienceSection && (experienceSection.content as Experience[]).length > 0 && (
          <section>
            <h3 className="text-lg font-normal mb-6 text-gray-900 tracking-wide">
              {experienceSection.title}
            </h3>
            <div className="space-y-8">
              {(experienceSection.content as Experience[]).map((experience, index) => (
                <div key={experience.id} className="border-l-2 border-gray-200 pl-6 relative">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-gray-400 rounded-full"></div>
                  <div className="pb-6">
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-base">{experience.title}</h4>
                      <span className="text-sm text-gray-500 font-light">
                        {experience.startDate} - {experience.current ? 'Présent' : experience.endDate}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3 font-light">
                      {experience.company} • {experience.location}
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
          <section>
            <h3 className="text-lg font-normal mb-6 text-gray-900 tracking-wide">
              {educationSection.title}
            </h3>
            <div className="space-y-8">
              {(educationSection.content as Education[]).map((education, index) => (
                <div key={education.id} className="border-l-2 border-gray-200 pl-6 relative">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-gray-400 rounded-full"></div>
                  <div className="pb-6">
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-base">{education.degree}</h4>
                      <span className="text-sm text-gray-500 font-light">
                        {education.startDate} - {education.current ? 'En cours' : education.endDate}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3 font-light">
                      {education.institution} • {education.location}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{education.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills and Languages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Skills */}
          {skillsSection && (skillsSection.content as Skill[]).length > 0 && (
            <section>
              <h3 className="text-lg font-normal mb-6 text-gray-900 tracking-wide">
                {skillsSection.title}
              </h3>
              <div className="space-y-3">
                {(skillsSection.content as Skill[]).map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between py-1">
                    <span className="text-gray-800">{skill.name}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
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
            <section>
              <h3 className="text-lg font-normal mb-6 text-gray-900 tracking-wide">
                {languagesSection.title}
              </h3>
              <div className="space-y-3">
                {(languagesSection.content as Language[]).map((language) => (
                  <div key={language.id} className="flex items-center justify-between py-1">
                    <span className="text-gray-800">{language.name}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {language.level === 'native' ? 'Natif' : language.level}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Projects */}
        {projectsSection && projectItems.length > 0 && (
          <section>
            <h3 className="text-lg font-normal mb-6 text-gray-900 tracking-wide">
              {projectsSection.title}
            </h3>
            <div className="space-y-6">
              {projectItems.map((project) => (
                <div key={project.id} className="border-l-2 border-gray-200 pl-6 relative">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-gray-400 rounded-full"></div>
                  <div className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{project.title}</h4>
                      {(project.startDate || project.endDate) && (
                        <span className="text-sm text-gray-500 font-light">
                          {project.startDate} {project.endDate && `- ${project.endDate}`}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-2">{project.description}</p>
                    {project.url && (
                      <a 
                        href={project.url} 
                        className="text-sm text-gray-500 hover:text-gray-800 font-light inline-flex items-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Voir le projet
                        <ExternalLink size={12} className="ml-1" />
                      </a>
                    )}
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