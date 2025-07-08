# 🚀 Guide de Démarrage Rapide - Ecomus SaaS Advanced

## Démarrage Immédiat

```bash
# 1. Démarrer le serveur de développement
npm run dev

# 2. Accéder à l'application
open http://localhost:3000
```

## ✨ Nouvelles Fonctionnalités

### 🎮 Modèles 3D
- **Accès:** Pages produits → Bouton "Vue 3D"
- **Upload:** Dashboard admin → Section "Modèles 3D"
- **Formats:** GLB, GLTF, OBJ, FBX

### 🤖 Chatbot IA
- **Accès:** Icône chat flottante (toutes les pages)
- **Fonctions:** Assistance produits, recommandations, support
- **IA:** Ollama local + Hugging Face cloud

### 👤 Profils Avancés
- **Accès:** Menu utilisateur → "Profil Avancé"
- **Dashboard:** Analytics, outils IA, gestion 3D
- **Rôles:** Admin, Manager, User, Guest

## 🔧 Configuration IA

```bash
# Variables d'environnement (.env.local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
HUGGINGFACE_API_KEY=hf_your_api_key_here
```

## 📋 Tests Rapides

```bash
# Test intégration
node scripts/test-integration.js

# Test services IA
node scripts/test-ai-services.js

# Démarrage complet
./scripts/start-complete.sh
```

## 🎯 Points d'Entrée Clés

- **3D Viewer:** `/components/shop/Model3DViewer.jsx`
- **Chatbot:** `/components/common/AIChatbot.jsx`
- **Profil:** `/components/dashboard/AdvancedUserProfile.jsx`
- **Services IA:** `/utils/ai-services.js`

---
**Système prêt ! 🎉 Toutes les fonctionnalités avancées sont opérationnelles.**
