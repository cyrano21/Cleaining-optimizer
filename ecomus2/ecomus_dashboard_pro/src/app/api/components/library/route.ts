import { NextRequest, NextResponse } from 'next/server';
import { 
  ALL_COMPONENTS, 
  getComponentsByCategory, 
  searchComponentsByTags,
  ComponentCategory 
} from '@/lib/dynamic-components';

/**
 * API CATALOGUE DES COMPOSANTS DISPONIBLES
 * 
 * Fournit la liste de tous les composants disponibles pour la construction
 * dynamique des stores, avec leurs configurations et schémas.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as ComponentCategory | null;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const search = searchParams.get('search')?.toLowerCase() || '';
    const premium = searchParams.get('premium'); // 'true', 'false', ou null pour tous

    let components = ALL_COMPONENTS;

    // Filtrer par catégorie
    if (category) {
      components = getComponentsByCategory(category);
    }

    // Filtrer par tags
    if (tags.length > 0) {
      const taggedComponents = searchComponentsByTags(tags);
      components = components.filter(comp => 
        taggedComponents.some(tagged => tagged.id === comp.id)
      );
    }

    // Filtrer par recherche textuelle
    if (search) {
      components = components.filter(comp =>
        comp.name.toLowerCase().includes(search) ||
        comp.description.toLowerCase().includes(search) ||
        comp.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Filtrer par type premium
    if (premium !== null) {
      const isPremiumFilter = premium === 'true';
      components = components.filter(comp => 
        (comp.isPremium || false) === isPremiumFilter
      );
    }

    // Organiser les composants par catégorie pour l'affichage
    const componentsByCategory = components.reduce((acc, component) => {
      if (!acc[component.category]) {
        acc[component.category] = [];
      }
      acc[component.category].push(component);
      return acc;
    }, {} as Record<string, any[]>);

    // Statistiques
    const stats = {
      total: components.length,
      byCategory: Object.entries(componentsByCategory).map(([cat, comps]) => ({
        category: cat,
        count: comps.length
      })),
      premium: components.filter(comp => comp.isPremium).length,
      free: components.filter(comp => !comp.isPremium).length
    };

    return NextResponse.json({
      success: true,
      data: {
        components,
        componentsByCategory,
        stats,
        filters: {
          categories: ['hero', 'products', 'content', 'utility'],
          availableTags: [...new Set(ALL_COMPONENTS.flatMap(comp => comp.tags))].sort()
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des composants:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Valider la configuration d'un composant
export async function POST(request: NextRequest) {
  try {
    const { componentId, config } = await request.json();

    if (!componentId || !config) {
      return NextResponse.json(
        { success: false, error: 'ID du composant et configuration requis' },
        { status: 400 }
      );
    }

    const component = ALL_COMPONENTS.find(comp => comp.id === componentId);
    
    if (!component) {
      return NextResponse.json(
        { success: false, error: 'Composant non trouvé' },
        { status: 404 }
      );
    }

    // Validation de la configuration selon le schéma
    const validationErrors = validateComponentConfig(component, config);
    
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Configuration invalide',
        details: validationErrors
      }, { status: 400 });
    }

    // Fusionner avec la configuration par défaut
    const mergedConfig = {
      ...component.defaultConfig,
      ...config
    };

    return NextResponse.json({
      success: true,
      data: {
        componentId,
        validatedConfig: mergedConfig,
        component: {
          id: component.id,
          name: component.name,
          category: component.category
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la validation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Fonction de validation de configuration
function validateComponentConfig(component: any, config: any): string[] {
  const errors: string[] = [];
  const schema = component.configSchema.properties;

  for (const [key, property] of Object.entries(schema) as any[]) {
    const value = config[key];

    // Vérifier les champs requis
    if (property.required && (value === undefined || value === null || value === '')) {
      errors.push(`Le champ "${property.label}" est requis`);
      continue;
    }

    // Valider le type
    if (value !== undefined && value !== null) {
      const validationType = property.type;
      
      switch (validationType) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`Le champ "${property.label}" doit être une chaîne de caractères`);
          }
          break;
          
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push(`Le champ "${property.label}" doit être un nombre`);
          } else if (property.validation) {
            if (property.validation.min !== undefined && value < property.validation.min) {
              errors.push(`Le champ "${property.label}" doit être supérieur ou égal à ${property.validation.min}`);
            }
            if (property.validation.max !== undefined && value > property.validation.max) {
              errors.push(`Le champ "${property.label}" doit être inférieur ou égal à ${property.validation.max}`);
            }
          }
          break;
          
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`Le champ "${property.label}" doit être un booléen`);
          }
          break;
          
        case 'color':
          if (typeof value !== 'string' || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
            errors.push(`Le champ "${property.label}" doit être une couleur hexadécimale valide`);
          }
          break;
          
        case 'url':
          if (typeof value !== 'string') {
            errors.push(`Le champ "${property.label}" doit être une URL`);
          } else {
            try {
              new URL(value);
            } catch {
              // Accepter les URLs relatives
              if (!value.startsWith('/') && !value.startsWith('#')) {
                errors.push(`Le champ "${property.label}" doit être une URL valide`);
              }
            }
          }
          break;
          
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`Le champ "${property.label}" doit être un tableau`);
          }
          break;
      }

      // Valider les options (enum)
      if (property.options && !property.options.includes(value)) {
        errors.push(`Le champ "${property.label}" doit être l'une des valeurs suivantes: ${property.options.join(', ')}`);
      }

      // Validation par pattern
      if (property.validation?.pattern && typeof value === 'string') {
        const regex = new RegExp(property.validation.pattern);
        if (!regex.test(value)) {
          errors.push(`Le champ "${property.label}" ne respecte pas le format requis`);
        }
      }

      // Validation enum
      if (property.validation?.enum && !property.validation.enum.includes(value)) {
        errors.push(`Le champ "${property.label}" doit être l'une des valeurs: ${property.validation.enum.join(', ')}`);
      }
    }
  }

  return errors;
}
