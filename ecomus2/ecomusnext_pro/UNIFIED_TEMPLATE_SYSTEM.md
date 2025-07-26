# 🎨 Système de Templates Unifié Ecomus

## 📋 Vue d'ensemble

Le système de templates unifié d'Ecomus permet de créer et gérer des templates de home page de manière modulaire et efficace. Il élimine la duplication de code en factorisant les composants partagés et offre une configuration centralisée pour chaque template.

## 🏗️ Architecture

### Structure des fichiers
```
components/
├── homes/
│   ├── shared/                 # 🧩 Composants factorisés
│   │   ├── Hero.jsx           # Hero sections
│   │   ├── Categories.jsx     # Grilles de catégories
│   │   ├── Products.jsx       # Listes de produits
│   │   ├── Collections.jsx    # Collections/bannières
│   │   ├── Testimonials.jsx   # Témoignages clients
│   │   ├── Blogs.jsx          # Articles de blog
│   │   ├── Newsletter.jsx     # Newsletter
│   │   ├── Marquee.jsx        # Messages défilants
│   │   ├── Countdown.jsx      # Compteurs
│   │   └── Footer.jsx         # Pieds de page
│   └── [anciens templates]    # ⚠️ À migrer/supprimer
├── TemplateConfigEditor.jsx   # 🔧 Éditeur de configuration
├── UnifiedTemplateDemo.jsx    # 👁️ Démo du système
└── DynamicHomeTemplate.tsx    # 🎯 Rendu dynamique

lib/
└── template-config.js         # ⚙️ Configuration centralisée

pages/
└── template-demo.js          # 🖥️ Page de démonstration
```

## 🧩 Composants Disponibles

### 🎪 Hero Sections
- `hero-electronic` - Style électronique/tech
- `hero-fashion` - Style mode/lifestyle  
- `hero-cosmetic` - Style beauté/cosmétique
- `hero-default` - Style par défaut

### 📦 Categories
- `categories-grid` - Grille de catégories
- `categories-slider` - Carrousel de catégories
- `categories-list` - Liste simple

### 🛍️ Products
- `products-featured` - Produits mis en avant
- `products-bestsellers` - Meilleures ventes
- `products-new` - Nouveautés
- `products-sale` - Promotions
- `products-grid` - Grille de produits
- `products-slider` - Carrousel de produits

### 🎨 Collections
- `collections-featured` - Collections mises en avant
- `collections-grid` - Grille de collections
- `collections-banner` - Bannières promotionnelles

### 💬 Testimonials
- `testimonials-slider` - Carrousel de témoignages
- `testimonials-grid` - Grille de témoignages
- `testimonials-simple` - Affichage simple

### 📰 Blogs
- `blogs-grid` - Grille d'articles
- `blogs-list` - Liste d'articles
- `blogs-featured` - Articles mis en avant

### 📧 Newsletter
- `newsletter-horizontal` - Mise en page horizontale
- `newsletter-vertical` - Mise en page verticale
- `newsletter-popup` - Format popup

### 📢 Marquee
- `marquee-offers` - Messages d'offres
- `marquee-shipping` - Infos livraison
- `marquee-news` - Actualités

### ⏰ Countdown
- `countdown-sale` - Vente limitée
- `countdown-launch` - Lancement produit
- `countdown-deal` - Offre spéciale

### 🦶 Footer
- `footer-default` - Pied de page standard
- `footer-minimal` - Version minimaliste
- `footer-extended` - Version étendue

## ⚙️ Configuration des Templates

### Structure d'un template
```javascript
export const TEMPLATE_DEFAULTS = {
  'home-electronic': {
    name: 'Electronics Store',
    sections: [
      {
        id: 'hero-1',                    // ID unique
        component: 'hero-electronic',   // Composant à utiliser
        enabled: true,                  // Actif/inactif
        order: 1,                       // Ordre d'affichage
        props: {                        // Propriétés du composant
          variant: 'electronic',
          title: 'Latest Electronics & Gadgets',
          subtitle: 'Discover cutting-edge technology',
          ctaText: 'Shop Now',
          ctaLink: '/category/electronics'
        }
      },
      // ... autres sections
    ]
  }
};
```

### Variants disponibles
- `default` - Style par défaut
- `electronic` - Style électronique (bleu/tech)
- `fashion` - Style mode (rose/élégant)
- `cosmetic` - Style beauté (violet/premium)

## 🚀 Utilisation

### 1. Rendu dynamique d'un template
```jsx
import { getTemplateConfig, getComponent } from '@/lib/template-config';

const MyTemplate = ({ templateId }) => {
  const config = getTemplateConfig(templateId);
  
  return (
    <div>
      {config.sections
        .filter(section => section.enabled)
        .sort((a, b) => a.order - b.order)
        .map((section) => {
          const Component = getComponent(section.component);
          return (
            <Component key={section.id} {...section.props} />
          );
        })}
    </div>
  );
};
```

### 2. Utilisation d'un composant spécifique
```jsx
import Hero from '@/components/homes/shared/Hero';

const MyPage = () => (
  <Hero
    variant="fashion"
    title="New Collection"
    subtitle="Discover the latest trends"
    ctaText="Explore"
    ctaLink="/collection"
  />
);
```

### 3. Configuration personnalisée
```javascript
// Ajouter un nouveau template
export const TEMPLATE_DEFAULTS = {
  // ... templates existants
  'home-custom': {
    name: 'Custom Store',
    sections: [
      {
        id: 'hero-1',
        component: 'hero-default',
        enabled: true,
        order: 1,
        props: {
          variant: 'custom',
          title: 'My Custom Store',
          // ... autres props
        }
      }
    ]
  }
};
```

## 🔧 Outils de Développement

### Script de migration
```bash
node scripts/migrate-templates.js
```
Analyse le projet et identifie les composants à migrer.

### Page de démonstration
```
/template-demo?template=home-electronic
```
Interface complète pour tester et configurer les templates.

### Éditeur de configuration
Le `TemplateConfigEditor` permet de :
- ✅ Activer/désactiver des sections
- 🔢 Réorganiser l'ordre des sections
- 🎨 Modifier les propriétés en temps réel
- 💾 Sauvegarder les configurations
- 👁️ Prévisualiser les changements

## 📈 Avantages du Système Unifié

### 🚀 Performance
- Composants optimisés et réutilisables
- Chargement à la demande
- Bundle size réduit

### 🔧 Maintenance
- Code DRY (Don't Repeat Yourself)
- Point de modification unique
- Tests centralisés

### 🎯 Flexibilité
- Configuration sans code
- Variants multiples
- Extensibilité facile

### 📊 Gestion
- Interface d'administration
- Configuration centralisée
- Versioning des templates

## 🧪 Tests et Validation

### Tests recommandés
```bash
# Tests unitaires des composants
npm test components/homes/shared/

# Tests d'intégration
npm test pages/template-demo

# Tests de configuration
npm test lib/template-config
```

### Validation manuelle
1. Tester chaque variant de composant
2. Vérifier la responsivité
3. Contrôler les performances
4. Valider l'accessibilité

## 🚀 Migration depuis l'Ancien Système

### Étapes de migration
1. **Analyser** - Utiliser le script de migration
2. **Factoriser** - Déplacer les composants vers `shared/`
3. **Configurer** - Ajouter les templates dans `template-config.js`
4. **Tester** - Valider le rendu avec la page de démo
5. **Nettoyer** - Supprimer les anciens fichiers

### Checklist de migration
- [ ] Composants factorisés dans `shared/`
- [ ] Configuration ajoutée dans `template-config.js`
- [ ] Imports mis à jour
- [ ] Tests passants
- [ ] Documentation mise à jour
- [ ] Anciens fichiers supprimés

## 🎨 Personnalisation Avancée

### Ajouter un nouveau composant
1. Créer le composant dans `shared/`
2. L'ajouter au `COMPONENT_REGISTRY`
3. Configurer les variants
4. Tester avec l'éditeur

### Créer un nouveau variant
```jsx
const MyComponent = ({ variant, ...props }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'my-custom':
        return 'bg-custom-gradient text-custom';
      default:
        return 'bg-default';
    }
  };
  
  return (
    <div className={getVariantClasses()}>
      {/* contenu */}
    </div>
  );
};
```

## 📚 Ressources Supplémentaires

- 📖 [Guide d'utilisation des composants](./docs/components-guide.md)
- 🎨 [Guide des variants et styles](./docs/styling-guide.md)
- 🔧 [API de configuration](./docs/config-api.md)
- 🧪 [Guide des tests](./docs/testing-guide.md)

## 🤝 Contribution

Pour contribuer au système unifié :
1. Fork le projet
2. Créer une branche feature
3. Ajouter vos modifications
4. Tester avec la page de démo
5. Soumettre une Pull Request

## 📞 Support

En cas de problème avec le système unifié :
- 🐛 [Issues GitHub](https://github.com/ecomus/issues)
- 💬 [Discord de la communauté](https://discord.gg/ecomus)
- 📧 [Email support](mailto:support@ecomus.com)

---

✨ **Le système de templates unifié Ecomus - Pour une architecture modulaire et évolutive !** ✨
