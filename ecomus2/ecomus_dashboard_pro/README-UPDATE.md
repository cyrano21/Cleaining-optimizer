# Mise à jour du 13 juin 2025

Correction de l'utilisation de 'store.logo' vers 'store.logoUrl' dans src/app/api/stores/route.ts pour assurer la cohérence entre le modèle de données et l'interface TypeScript.

## Détails de la correction
- Ligne 55: `logo: store.logo` → `logoUrl: store.logo`
- Ligne 111: `logo: store.logo` → `logoUrl: store.logo`

Cette modification résout le problème d'affichage des logos de boutiques dans l'interface utilisateur.
