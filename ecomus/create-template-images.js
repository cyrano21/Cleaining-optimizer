const fs = require('fs');
const path = require('path');

// Créer le dossier des images templates s'il n'existe pas
const templatesDir = path.join('G:', 'ecomus', 'ecommerce-dashboard-core', 'public', 'images', 'templates');

async function createTemplateImages() {
    console.log('🖼️ Création des images placeholder pour les templates');
    
    try {
        // Créer les dossiers si nécessaires
        fs.mkdirSync(templatesDir, { recursive: true });
        console.log(`✅ Dossier créé: ${templatesDir}`);
        
        // Liste des templates
        const templates = [
            'modern-template', 'home-02', 'home-03', 'home-04', 'home-05',
            'home-06', 'home-07', 'home-08', 'home-accessories', 'home-activewear',
            'home-baby', 'home-bookstore', 'home-camp-and-hike', 'home-ceramic',
            'home-cosmetic', 'home-decor', 'home-dog-accessories', 'home-electric-bike',
            'home-electronic', 'home-food', 'home-footwear', 'home-furniture',
            'home-furniture-02', 'home-gaming-accessories', 'home-giftcard',
            'home-glasses', 'home-grocery', 'home-handbag', 'home-headphone',
            'home-jewerly', 'home-kids', 'home-kitchen-wear', 'home-men',
            'home-multi-brand', 'home-paddle-boards', 'home-personalized-pod',
            'home-phonecase', 'home-pickleball', 'home-plant', 'home-pod-store',
            'home-search', 'home-setup-gear', 'home-skateboard', 'home-skincare',
            'home-sneaker', 'home-sock', 'home-stroller', 'home-swimwear',
            'home-tee', 'default', 'placeholder'
        ];
        
        // Créer un fichier SVG simple pour chaque template
        for (const template of templates) {
            const svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f3f4f6"/>
  <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#374151">
    Preview
  </text>
  <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
    ${template}
  </text>
</svg>`;
            
            const filePath = path.join(templatesDir, `${template}.svg`);
            fs.writeFileSync(filePath, svgContent);
        }
        
        console.log(`✅ ${templates.length} images placeholder créées`);
        console.log(`📁 Dossier: ${templatesDir}`);
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

createTemplateImages();
