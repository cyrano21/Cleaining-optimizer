// Types pour le module Lettre de motivation
export interface CoverLetterTemplate {
  id: string;
  name: string;
  previewImage?: string;
}

export interface CoverLetterContent {
  recipient?: string;
  company?: string;
  position?: string;
  date?: Date;
  greeting?: string;
  introduction: string;
  body: string;
  conclusion: string;
  signature?: string;
}

export interface CoverLetterData {
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
  content: CoverLetterContent;
  templateId?: string;
}

export interface CoverLetterContextType {
  letterData: CoverLetterData;
  updatePersonalInfo: (info: Partial<CoverLetterData['personalInfo']>) => void;
  updateContent: (content: Partial<CoverLetterContent>) => void;
  setTemplate: (templateId: string) => void;
  resetLetter: () => void;
  generateFromCV: (cvData: {
    personalInfo: {
      fullName: string;
      email: string;
      phone?: string;
      address?: string;
      city?: string;
      country?: string;
      postalCode?: string;
    };
    summary?: string;
  }, jobDescription?: string) => void;
  generateFromAI: (jobDescription: string, tone?: string) => Promise<void>;
}