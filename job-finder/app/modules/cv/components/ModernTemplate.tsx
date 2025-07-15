'use client'

import { CV, Experience, Education, Skill, Language, Summary, Project } from '../utils/types'
import { Mail, Phone, MapPin, Globe, Linkedin, Calendar, Building, GraduationCap, Lightbulb, MessageSquare, ExternalLink } from 'lucide-react'
import Image from 'next/image'

export default function ModernTemplate({ cv }: { cv: CV }) {
  const { personalInfo, sections } = cv
  
  const summarySection = sections.find(section => section.id === 'summary')
  const experienceSection = sections.find(section => section.id === 'experience')
  const educationSection = sections.find(section => section.id === 'education')
  const skillsSection = sections.find(section => section.id === 'skills')
  const languagesSection = sections.find(section => section.id === 'languages')
  const projectsSection = sections.find(section => section.id === 'projects')
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-6">
              {personalInfo.photo && (
                <div className="relative flex-shrink-0">
                  <Image
                    src={personalInfo.photo}
                    alt="Photo de profil"
                    width={100}
                    height={100}
                    className="rounded-full border-4 border-white/20 shadow-xl"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent to-black/20"></div>
                </div>
              )}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {personalInfo.firstName} {personalInfo.lastName}
                </h1>
                {personalInfo.title && (
                  <h2 className="text-lg md:text-xl opacity-90 mb-4 font-medium">
                    {personalInfo.title}
                  </h2>
                )}
                
                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm">
                  {personalInfo.email && (
                    <div className="flex items-center justify-center md:justify-start space-x-2">
                      <Mail className="w-4 h-4 opacity-80 flex-shrink-0" />
                      <span className="truncate">{personalInfo.email}</span>
                    </div>
                  )}
                  {personalInfo.phone && (
                    <div className="flex items-center justify-center md:justify-start space-x-2">
                      <Phone className="w-4 h-4 opacity-80 flex-shrink-0" />
                      <span>{personalInfo.phone}</span>
                    </div>
                  )}
                  {(personalInfo.address || personalInfo.city) && (
                    <div className="flex items-center justify-center md:justify-start space-x-2">
                      <MapPin className="w-4 h-4 opacity-80 flex-shrink-0" />
                      <span className="truncate">
                        {[personalInfo.address, personalInfo.city].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {personalInfo.website && (
                    <div className="flex items-center justify-center md:justify-start space-x-2">
                      <Globe className="w-4 h-4 opacity-80 flex-shrink-0" />
                      <span className="truncate">{personalInfo.website}</span>
                    </div>
                  )}
                  {personalInfo.linkedin && (
                    <div className="flex items-center justify-center md:justify-start space-x-2">
                      <Linkedin className="w-4 h-4 opacity-80 flex-shrink-0" />
                      <span className="truncate">{personalInfo.linkedin}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 md:p-8">
          {/* Left Column */}
          <div className="space-y-6 order-2 lg:order-1">
            {/* Summary */}
            {summarySection && (summarySection.content as Summary).content && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
                  <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <MessageSquare className="w-3 h-3 text-white" />
                  </div>
                  {summarySection.title}
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {(summarySection.content as Summary).content}
                </p>
              </div>
            )}
            
            {/* Skills */}
            {skillsSection && (skillsSection.content as Skill[]).length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                  <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                    <Lightbulb className="w-3 h-3 text-white" />
                  </div>
                  {skillsSection.title}
                </h3>
                <div className="space-y-3">
                  {(skillsSection.content as Skill[]).map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-800 text-sm">{skill.name}</span>
                        <span className="text-xs text-gray-600 bg-green-100 px-2 py-1 rounded-full">
                          {skill.level === 'beginner' ? 'Débutant' : 
                           skill.level === 'intermediate' ? 'Intermédiaire' : 
                           skill.level === 'advanced' ? 'Avancé' : 'Expert'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500" 
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
              </div>
            )}
            
            {/* Languages */}
            {languagesSection && (languagesSection.content as Language[]).length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center">
                  <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <Globe className="w-3 h-3 text-white" />
                  </div>
                  {languagesSection.title}
                </h3>
                <div className="space-y-2">
                  {(languagesSection.content as Language[]).map((language) => (
                    <div key={language.id} className="flex justify-between items-center">
                      <span className="font-medium text-gray-800 text-sm">{language.name}</span>
                      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        {language.level === 'native' ? 'Natif' : language.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
            {/* Experience */}
            {experienceSection && (experienceSection.content as Experience[]).length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center mr-3">
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  {experienceSection.title}
                </h3>
                <div className="space-y-4">
                  {(experienceSection.content as Experience[]).map((exp, index) => (
                    <div key={exp.id} className="relative pl-6 pb-4 border-l-2 border-blue-200 last:border-l-0">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h4 className="text-base font-semibold text-gray-800">{exp.title}</h4>
                          <div className="flex items-center text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded-full">
                            <Calendar className="w-3 h-3 mr-1" />
                            {exp.startDate} - {exp.current ? 'Présent' : exp.endDate}
                          </div>
                        </div>
                        <p className="text-blue-600 font-medium mb-2 text-sm">{exp.company} • {exp.location}</p>
                        <p className="text-gray-700 leading-relaxed text-sm">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Education */}
            {educationSection && (educationSection.content as Education[]).length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center mr-3">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  {educationSection.title}
                </h3>
                <div className="space-y-4">
                  {(educationSection.content as Education[]).map((edu, index) => (
                    <div key={edu.id} className="relative pl-6 pb-4 border-l-2 border-green-200 last:border-l-0">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-green-600 rounded-full"></div>
                      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h4 className="text-base font-semibold text-gray-800">{edu.degree}</h4>
                          <div className="flex items-center text-xs text-gray-600 bg-green-50 px-2 py-1 rounded-full">
                            <Calendar className="w-3 h-3 mr-1" />
                            {edu.startDate} - {edu.current ? 'En cours' : edu.endDate}
                          </div>
                        </div>
                        <p className="text-green-600 font-medium mb-2 text-sm">{edu.institution} • {edu.location}</p>
                        <p className="text-gray-700 leading-relaxed text-sm">{edu.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Projects */}
            {projectsSection && Array.isArray(projectsSection.content) && (projectsSection.content as Project[]).length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                  {projectsSection.title}
                </h3>
                <div className="space-y-4">
                  {(Array.isArray(projectsSection.content) ? (projectsSection.content as Project[]) : []).map((project) => (
                    <div key={project.id} className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <h4 className="text-base font-semibold text-gray-800">{project.title}</h4>
                        {(project.startDate || project.endDate) && (
                          <div className="flex items-center text-xs text-gray-600 bg-purple-50 px-2 py-1 rounded-full">
                            <Calendar className="w-3 h-3 mr-1" />
                            {project.startDate} {project.endDate && `- ${project.endDate}`}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm mb-2">{project.description}</p>
                      {project.url && (
                        <a 
                          href={project.url} 
                          className="text-purple-600 hover:text-purple-800 font-medium text-sm flex items-center"
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
