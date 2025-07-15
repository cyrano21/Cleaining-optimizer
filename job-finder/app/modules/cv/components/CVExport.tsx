'use client'

import { useState, useEffect } from 'react'
import { useCV } from '../utils/cv-context'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { CV, Experience, Education, Skill, Language, Summary } from '../utils/types'

interface CVExportProps {
  className?: string
}

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  section: {
    marginBottom: 10,
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    paddingBottom: 2,
    borderBottom: '1 solid #E5E7EB',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 10,
    color: '#4B5563',
  },
  itemDate: {
    fontSize: 10,
    color: '#6B7280',
  },
  itemDescription: {
    fontSize: 10,
    marginTop: 3,
  },
  skillsGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillItem: {
    width: '50%',
    fontSize: 10,
    marginBottom: 3,
  },
  languageItem: {
    width: '50%',
    fontSize: 10,
    marginBottom: 3,
  },
});

// Composant PDF pour le CV
const CVDocument = ({ cv }: { cv: CV }) => {
  const { personalInfo, sections } = cv
  
  const summarySection = sections.find(section => section.id === 'summary')
  const experienceSection = sections.find(section => section.id === 'experience')
  const educationSection = sections.find(section => section.id === 'education')
  const skillsSection = sections.find(section => section.id === 'skills')
  const languagesSection = sections.find(section => section.id === 'languages')
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {personalInfo.firstName} {personalInfo.lastName}
          </Text>
          {personalInfo.title && (
            <Text style={styles.title}>{personalInfo.title}</Text>
          )}
          
          <View style={styles.contactInfo}>
            {personalInfo.email && (
              <Text>Email: {personalInfo.email}</Text>
            )}
            {personalInfo.phone && (
              <Text>Téléphone: {personalInfo.phone}</Text>
            )}
            {personalInfo.address && (
              <Text>
                {personalInfo.address}, {personalInfo.city} {personalInfo.postalCode}, {personalInfo.country}
              </Text>
            )}
          </View>
        </View>
        
        {/* Summary */}
        {summarySection && (summarySection.content as Summary).content && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{summarySection.title}</Text>
            <Text style={styles.itemDescription}>
              {(summarySection.content as Summary).content}
            </Text>
          </View>
        )}
        
        {/* Experience */}
        {experienceSection && (experienceSection.content as Experience[]).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{experienceSection.title}</Text>
            {(experienceSection.content as Experience[]).map((experience, index) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <Text style={styles.itemTitle}>{experience.title}</Text>
                <Text style={styles.itemSubtitle}>
                  {experience.company}, {experience.location}
                </Text>
                <Text style={styles.itemDate}>
                  {experience.startDate} - {experience.current ? 'Présent' : experience.endDate}
                </Text>
                <Text style={styles.itemDescription}>{experience.description}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Education */}
        {educationSection && (educationSection.content as Education[]).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{educationSection.title}</Text>
            {(educationSection.content as Education[]).map((education, index) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <Text style={styles.itemTitle}>{education.degree}</Text>
                <Text style={styles.itemSubtitle}>
                  {education.institution}, {education.location}
                </Text>
                <Text style={styles.itemDate}>
                  {education.startDate} - {education.current ? 'En cours' : education.endDate}
                </Text>
                <Text style={styles.itemDescription}>{education.description}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Skills */}
        {skillsSection && (skillsSection.content as Skill[]).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{skillsSection.title}</Text>
            <View style={styles.skillsGrid}>
              {(skillsSection.content as Skill[]).map((skill, index) => (
                <Text key={index} style={styles.skillItem}>
                  {skill.name} ({skill.level === 'beginner' ? 'Débutant' : 
                               skill.level === 'intermediate' ? 'Intermédiaire' : 
                               skill.level === 'advanced' ? 'Avancé' : 'Expert'})
                </Text>
              ))}
            </View>
          </View>
        )}
        
        {/* Languages */}
        {languagesSection && (languagesSection.content as Language[]).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{languagesSection.title}</Text>
            <View style={styles.skillsGrid}>
              {(languagesSection.content as Language[]).map((language, index) => (
                <Text key={index} style={styles.languageItem}>
                  {language.name}: {language.level === 'native' ? 'Langue maternelle' : language.level}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}

export default function CVExport({ className }: CVExportProps) {
  const { cv } = useCV()
  const [format, setFormat] = useState<'pdf' | 'docx'>('pdf')
  const [saving, setSaving] = useState(false)
  const [showPDFLink, setShowPDFLink] = useState(false)

  // Délai pour afficher le lien PDF afin d'éviter le rendu initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPDFLink(true)
    }, 1000) // Délai de 1 seconde
    return () => clearTimeout(timer)
  }, [])

  const handleSaveToCloud = async () => {
    setSaving(true)
    
    try {
      // Simulation d'une sauvegarde cloud
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('CV sauvegardé avec succès !')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }
  
  return (
    <div className={className}>
      <div className="flex items-center mb-4 border-b border-gray-200 pb-3">
        <div className="flex-1">
          <label htmlFor="format-select" className="block text-sm font-medium text-gray-700 mb-1">Format de téléchargement</label>
          <select
            id="format-select"
            className="w-auto border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 bg-white"
            value={format}
            onChange={(e) => setFormat(e.target.value as 'pdf' | 'docx')}
          >
            <option value="pdf">PDF</option>
            <option value="docx" disabled>DOCX (bientôt disponible)</option>
          </select>
        </div>
        {format === 'pdf' && showPDFLink && (
          <div className="flex-1 text-right">
            <PDFDownloadLink
              document={<CVDocument cv={cv} />}
              fileName={`cv-${cv.personalInfo.firstName}-${cv.personalInfo.lastName}.pdf`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {({ loading }) => (loading ? 'Génération du PDF...' : 'Télécharger le PDF')}
            </PDFDownloadLink>
          </div>
        )}
        {format === 'pdf' && !showPDFLink && (
          <div className="flex-1 text-right">
            <button
              disabled
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Chargement...
            </button>
          </div>
        )}
        {format === 'docx' && (
          <div className="flex-1 text-right">
            <button
              disabled
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Télécharger le DOCX (bientôt)
            </button>
          </div>
        )}
      </div>
      {/* Div supprimée pour éliminer l'espace vide */}
      <div className="flex">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          onClick={handleSaveToCloud}
          disabled={saving}
        >
          {saving ? 'Sauvegarde en cours...' : 'Sauvegarder dans le cloud'}
        </button>
      </div>
    </div>
  )
}
