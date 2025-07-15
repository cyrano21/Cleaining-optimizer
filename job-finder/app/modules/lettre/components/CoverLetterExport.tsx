'use client'

import { useCoverLetter } from '../utils/cover-letter-context'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { CoverLetter } from '../utils/types'

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  date: {
    fontSize: 11,
    marginBottom: 5,
    textAlign: 'right',
  },
  city: {
    fontSize: 11,
    marginBottom: 15,
    textAlign: 'right',
  },
  recipient: {
    fontSize: 11,
    marginBottom: 15,
  },
  subject: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  content: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 30,
    textAlign: 'justify',
  },
  signature: {
    fontSize: 11,
    textAlign: 'right',
  },
});

// Composant PDF pour la lettre de motivation
const CoverLetterDocument = ({ coverLetter }: { coverLetter: CoverLetter }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.date}>{coverLetter.date}</Text>
          {coverLetter.city && <Text style={styles.city}>{coverLetter.city}</Text>}
          
          <View style={styles.recipient}>
            {coverLetter.recipientName && <Text>{coverLetter.recipientName}</Text>}
            {coverLetter.recipientPosition && <Text>{coverLetter.recipientPosition}</Text>}
            {coverLetter.company && <Text>{coverLetter.company}</Text>}
            {coverLetter.companyAddress && <Text>{coverLetter.companyAddress}</Text>}
          </View>
          
          <Text style={styles.subject}>
            Objet : Candidature au poste de {coverLetter.position || "[poste]"}
          </Text>
        </View>
        
        {/* Corps de la lettre */}
        <Text style={styles.content}>
          {coverLetter.content || "Contenu de votre lettre de motivation..."}
        </Text>
        
        {/* Signature */}
        <Text style={styles.signature}>Signature</Text>
      </Page>
    </Document>
  )
}

// Explicitement exporter l'interface pour que TypeScript la reconnaisse
export interface CoverLetterExportProps {
  compact?: boolean;
}

export default function CoverLetterExport({ compact = false }: CoverLetterExportProps) {
  const { coverLetter } = useCoverLetter()
  
  // Style des boutons en fonction du mode compact ou non
  const buttonBaseStyle = compact 
    ? "w-full mb-2 py-2 text-white rounded-md flex items-center justify-center text-sm" 
    : "px-4 py-2 text-white rounded-md hover:shadow-md transition-all duration-200";
    
  const containerStyle = compact 
    ? "flex flex-col space-y-2" 
    : "flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0";
  
  return (
    <div className={compact ? "" : "p-4 bg-white rounded-lg shadow"}>
      {!compact && <h3 className="text-lg font-medium mb-4">Exporter votre lettre</h3>}
      
      <div className={containerStyle}>
        <PDFDownloadLink
          document={<CoverLetterDocument coverLetter={coverLetter} />}
          fileName={`${coverLetter.title.replace(/\s+/g, '_')}.pdf`}
          className={`${buttonBaseStyle} bg-green-600 hover:bg-green-700`}
        >
          {({ loading }) => (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              {loading ? 'Préparation...' : compact ? 'PDF' : 'Télécharger en PDF'}
            </span>
          )}
        </PDFDownloadLink>
        
        <button
          className={`${buttonBaseStyle} bg-blue-600 hover:bg-blue-700`}
          onClick={() => alert('Fonctionnalité DOCX en développement')}
        >
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {compact ? 'DOCX' : 'Télécharger en DOCX'}
          </span>
        </button>
        
        <button
          className={`${buttonBaseStyle} bg-purple-600 hover:bg-purple-700`}
          onClick={() => alert('Lettre sauvegardée avec succès !')}
        >
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {compact ? 'Sauvegarder' : 'Sauvegarder la lettre'}
          </span>
        </button>
      </div>
    </div>
  )
}
