import { createContext, useContext, useState, useCallback } from 'react'
import { Profile, defaultProfile, SocialLink, Project } from './types'
import { v4 as uuidv4 } from 'uuid'

interface ProfileContextType {
  profile: Profile
  updateProfile: (profile: Profile) => void
  updateField: (field: keyof Profile, value: string) => void
  addSocialLink: (socialLink: Omit<SocialLink, 'id'>) => void
  updateSocialLink: (id: string, socialLink: Partial<SocialLink>) => void
  removeSocialLink: (id: string) => void
  addProject: (project: Omit<Project, 'id'>) => void
  updateProject: (id: string, project: Partial<Project>) => void
  removeProject: (id: string) => void
  generateSlug: (title: string) => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(defaultProfile)

  const updateProfile = useCallback((newProfile: Profile) => {
    setProfile(newProfile)
  }, [])

  const updateField = useCallback((field: keyof Profile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const addSocialLink = useCallback((socialLink: Omit<SocialLink, 'id'>) => {
    const newSocialLink = {
      ...socialLink,
      id: uuidv4(),
    }
    
    setProfile((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, newSocialLink],
    }))
  }, [])

  const updateSocialLink = useCallback((id: string, socialLink: Partial<SocialLink>) => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link) =>
        link.id === id ? { ...link, ...socialLink } : link
      ),
    }))
  }, [])

  const removeSocialLink = useCallback((id: string) => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((link) => link.id !== id),
    }))
  }, [])

  const addProject = useCallback((project: Omit<Project, 'id'>) => {
    const newProject = {
      ...project,
      id: uuidv4(),
    }
    
    setProfile((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }))
  }, [])

  const updateProject = useCallback((id: string, project: Partial<Project>) => {
    setProfile((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, ...project } : p
      ),
    }))
  }, [])

  const removeProject = useCallback((id: string) => {
    setProfile((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }))
  }, [])

  const generateSlug = useCallback((title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
    
    setProfile((prev) => ({
      ...prev,
      slug,
    }))
  }, [])

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        updateField,
        addSocialLink,
        updateSocialLink,
        removeSocialLink,
        addProject,
        updateProject,
        removeProject,
        generateSlug,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}