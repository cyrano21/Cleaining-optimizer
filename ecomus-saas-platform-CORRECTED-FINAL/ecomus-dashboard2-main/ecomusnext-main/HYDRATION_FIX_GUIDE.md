# Guide de Correction des Erreurs d'Hydratation React

## 🔧 Corrections Appliquées

### 1. ThemeProvider (`components/providers/theme-provider.tsx`)

**Problème :** Utilisation directe de `window`, `localStorage` et `document` sans vérification côté serveur.

**Solution :**
- Ajout d'un état `mounted` pour détecter le montage côté client
- Vérification `typeof window !== "undefined"` avant d'accéder aux APIs du navigateur
- Rendu conditionnel pour éviter les différences SSR/client
- Récupération du thème depuis localStorage après le montage

### 2. Context Principal (`context/Context.jsx`)

**Problème :** Accès direct à `localStorage` sans vérification côté serveur.

**Solution :**
- Ajout d'un état `mounted` pour détecter le montage côté client
- Vérification `typeof window !== "undefined"` avant d'accéder à localStorage
- Gestion sécurisée du parsing JSON avec fallback sur tableau vide
- Synchronisation des effets avec l'état `mounted`

### 3. Utilitaire Modal (`utlis/openCartModal.js`)

**Problème :** Utilisation directe de `document` sans vérification côté serveur.

**Solution :**
- Vérification `typeof window !== "undefined"` et `typeof document !== "undefined"`
- Retour anticipé si les APIs ne sont pas disponibles
- Vérification de l'existence des éléments DOM avant manipulation

## 🛡️ Pattern de Prévention

### Pour les Composants React

```jsx
"use client";
import { useState, useEffect } from "react";

export function MyComponent() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    
    // Code utilisant les APIs du navigateur
    const storedData = localStorage.getItem('key');
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, [mounted]);

  // Éviter le rendu côté serveur si nécessaire
  if (!mounted) {
    return <div>Loading...</div>; // ou null
  }

  return <div>{/* Contenu normal */}</div>;
}
```

### Pour les Utilitaires

```javascript
export const myUtility = () => {
  // Vérification préalable
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  
  // Code utilisant les APIs du navigateur
  const element = document.getElementById('myElement');
  if (!element) return;
  
  // Manipulation DOM sécurisée
};
```

## 🚨 APIs à Surveiller

### Côté Client Uniquement
- `window.*`
- `document.*`
- `localStorage`
- `sessionStorage`
- `navigator.*`
- `location.*`
- `history.*`

### Fonctions Dynamiques
- `Date.now()`
- `Math.random()`
- `new Date().getTime()`

## ✅ Bonnes Pratiques

1. **Toujours vérifier la disponibilité des APIs**
   ```javascript
   if (typeof window !== "undefined") {
     // Code côté client
   }
   ```

2. **Utiliser l'état mounted pour les composants**
   ```jsx
   const [mounted, setMounted] = useState(false);
   useEffect(() => setMounted(true), []);
   ```

3. **Gérer les erreurs de parsing JSON**
   ```javascript
   const data = JSON.parse(localStorage.getItem('key') || '[]');
   ```

4. **Éviter les conditions de rendu dynamiques**
   ```jsx
   // ❌ Mauvais
   {typeof window !== "undefined" && <Component />}
   
   // ✅ Bon
   {mounted && <Component />}
   ```

5. **Utiliser dynamic import pour les composants côté client**
   ```jsx
   import dynamic from 'next/dynamic';
   
   const ClientComponent = dynamic(
     () => import('./ClientComponent'),
     { ssr: false }
   );
   ```

## 🔍 Debugging

Pour identifier les erreurs d'hydratation :

1. Vérifiez la console du navigateur
2. Recherchez les messages "Hydration failed"
3. Utilisez React DevTools
4. Activez `reactStrictMode: true` dans `next.config.js`

## 📝 Checklist de Vérification

- [ ] Tous les accès à `window` sont protégés
- [ ] Tous les accès à `localStorage`/`sessionStorage` sont protégés
- [ ] Tous les accès à `document` sont protégés
- [ ] Les composants utilisent l'état `mounted` si nécessaire
- [ ] Les utilitaires vérifient la disponibilité des APIs
- [ ] Aucune condition de rendu dynamique côté serveur
- [ ] Les erreurs de parsing JSON sont gérées

---

**Date de création :** $(date)
**Statut :** Corrections appliquées
**Prochaine étape :** Tester l'application pour vérifier la résolution des erreurs