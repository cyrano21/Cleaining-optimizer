const fs = require('fs');
const path = require('path');

// List of all shop-details directories
const shopDetailsPages = [
  'product-frequently-bought-together',
  'product-rectangle-color',
  'product-right-thumbnails',
  'product-rectangle',
  'product-zoom-magnifier',
  'product-zoom-popup',
  'product-video',
  'product-upsell-features',
  'product-swatch-image',
  'product-swatch-dropdown-color',
  'product-swatch-dropdown',
  'product-stacked',
  'product-quick-order-list',
  'product-pickup',
  'product-photoswipe-popup',
  'product-options-customizer',
  'product-detail-volume-discount-grid'
];

// Pattern to find and replace
const oldPattern = /export default async function page\(\{ params \}\) ?\{[\s]*const \{ id \} = await params[\s]*const product =[\s]*allProducts\.filter\(\(elm\) => elm\.id == id\)\[0\] \|\| allProducts\[0\];/g;

const newPattern = `export default async function page({ params }) {
  const { id } = await params;
  
  // Convert id to number for proper comparison and ensure it's valid
  const productId = parseInt(id) || 1;
  
  // Find product with proper type checking
  const product = allProducts.find((elm) => elm.id === productId) || allProducts[0];`;

shopDetailsPages.forEach(pageName => {
  const filePath = path.join(__dirname, 'app', '(shop-details)', pageName, '[id]', 'page.jsx');
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // More flexible pattern matching
      if (content.includes('allProducts.filter((elm) => elm.id == id)[0]')) {
        // Replace the problematic pattern
        content = content.replace(
          /export default async function page\(\{ params \}\) ?\{[\s]*const \{ id \} = await params[\s]*const product =[\s]*allProducts\.filter\(\(elm\) => elm\.id == id\)\[0\] \|\| allProducts\[0\];/,
          newPattern
        );
        
        // Alternative patterns
        content = content.replace(
          /const \{ id \} = await params[\s]*const product =[\s]*allProducts\.filter\(\(elm\) => elm\.id == id\)\[0\] \|\| allProducts\[0\];/,
          `const { id } = await params;
  
  // Convert id to number for proper comparison and ensure it's valid
  const productId = parseInt(id) || 1;
  
  // Find product with proper type checking
  const product = allProducts.find((elm) => elm.id === productId) || allProducts[0];`
        );
        
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${pageName}`);
      } else {
        console.log(`Skipped: ${pageName} (already fixed or different pattern)`);
      }
    } catch (error) {
      console.error(`Error processing ${pageName}:`, error.message);
    }
  } else {
    console.log(`File not found: ${pageName}`);
  }
});

console.log('Finished processing all product pages.');
