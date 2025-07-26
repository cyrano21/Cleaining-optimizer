"use client";

import React, { useMemo } from "react";
import { TemplateConfig, getDefaultConfigForTemplate } from "@/types/templateConfig";
import { getComponent } from "@/components/common/FactorizedComponents";

interface UniversalTemplateProps {
  store?: any;
  products?: any;
  templateId: string;
  isStore?: boolean;
  isVitrine?: boolean;
  vitrineConfig?: any;
  templateConfig?: TemplateConfig;
  sections?: string[]; // Ajout pour sections dynamiques
}

export default function UniversalTemplate({
  store,
  products,
  templateId,
  isStore,
  isVitrine,
  vitrineConfig,
  templateConfig,
  sections = [],
}: UniversalTemplateProps) {
  // Debug: vérifier que les données arrivent au template
  console.log('🌐 UniversalTemplate - Props reçues:', {
    store,
    products,
    templateId,
    isStore,
    isVitrine,
    templateConfig
  });

  // Utiliser la configuration fournie ou la configuration par défaut du template
  const config = useMemo(() => {
    return templateConfig || getDefaultConfigForTemplate(templateId);
  }, [templateConfig, templateId]);

  // Créer une liste ordonnée des sections activées
  const orderedSections = useMemo(() => {
    const sections = Object.entries(config.sections)
      .filter(([key, sectionConfig]) => sectionConfig.enabled)
      .map(([key, sectionConfig]) => ({
        key,
        config: sectionConfig,
        order: sectionConfig.order || 999
      }))
      .sort((a, b) => a.order - b.order);

    console.log(`🔧 ${templateId} - Sections activées et ordonnées:`, sections);
    return sections;
  }, [config.sections, templateId]);

  return (
    <>
      {orderedSections.map(({ key, config: sectionConfig }) => {
        const Component = getComponent(key, templateId, sectionConfig, store, products);

        if (!Component) {
          console.warn(`⚠️ Composant de section non trouvé pour: ${key} dans ${templateId}`);
          return null;
        }

        return (
          <React.Fragment key={key}>
            {Component}
          </React.Fragment>
        );
      })}
    </>
  );
}
