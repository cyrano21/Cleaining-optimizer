import { useState } from 'react';
import { SettingsState, SettingsSectionType } from './types';
import { defaultSettingsState } from './constants';

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettingsState);
  const [loading, setLoading] = useState(false);
  const [savedSections, setSavedSections] = useState<Set<string>>(new Set());

  const updateSettings = <T extends SettingsSectionType>(
    section: T,
    updates: Partial<SettingsState[T]>
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates,
      },
    }));
    
    // Retirer la section des sections sauvegardées quand on fait des modifications
    setSavedSections(prev => {
      const newSet = new Set(prev);
      newSet.delete(section);
      return newSet;
    });
  };

  const handleSave = async (section: SettingsSectionType) => {
    setLoading(true);
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Marquer la section comme sauvegardée
      setSavedSections(prev => {
        const newSet = new Set(prev);
        newSet.add(section);
        return newSet;
      });
      
      console.log(`Saving ${section} settings:`, settings[section]);
    } catch (error) {
      console.error(`Error saving ${section} settings:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      // Simulation d'un appel API pour sauvegarder tous les paramètres
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Marquer toutes les sections comme sauvegardées
      setSavedSections(new Set(Object.keys(settings) as SettingsSectionType[]));
      
      console.log('Saving all settings:', settings);
    } catch (error) {
      console.error('Error saving all settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSectionSaved = (section: SettingsSectionType) => {
    return savedSections.has(section);
  };

  return {
    settings,
    loading,
    updateSettings,
    handleSave,
    handleSaveAll,
    isSectionSaved,
  };
}
