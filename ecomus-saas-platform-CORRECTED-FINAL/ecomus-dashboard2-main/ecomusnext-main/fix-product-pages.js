const fs = require('fs');
const path = require('path');

// List of files that need to be fixed based on the grep search results
const filesToFix = [
  'app/(shop-details)/product-zoom-magnifier/[id]/page.jsx',
  'app/(shop-details)/product-zoom-popup/[id]/page.jsx',
  'app/(shop-details)/product-quick-order-list/[id]/page.jsx',
  'app/(shop-details)/product-stacked/[id]/page.jsx',
  'app/(shop-details)/product-upsell-features/[id]/page.jsx',
  'app/(shop-details)/product-video/[id]/page.jsx',
  'app/(shop-details)/product-swatch-image-rounded/[id]/page.jsx',
  'app/(shop-details)/product-swatch-image/[id]/page.jsx',
  'app/(shop-details)/product-options-customizer/[id]/page.jsx',
  'app/(shop-details)/product-swatch-dropdown/[id]/page.jsx',
  'app/(shop-details)/product-swatch-dropdown-color/[id]/page.jsx',
  'app/(shop-details)/product-right-thumbnails/[id]/page.jsx',
  'app/(shop-details)/product-rectangle/[id]/page.jsx',
  'app/(shop-details)/product-pre-orders/[id]/page.jsx'
];

const oldPattern = /export default async function page\(\{ params \}\) \{\s*const \{ id \} = await params[\s\S]*?const product =\s*allProducts\.filter\(\(elm\) => elm\.id == id\)\[0\] \|\| allProducts\[0\];/;

const newReplacement = `export default async function page({ params }) {
  const { id } = await params;
  
  // Convert id to number for proper comparison and ensure it's valid
  const productId = parseInt(id) || 1;
  
  // Find product with proper type checking
  const product = allProducts.find((elm) => elm.id === productId) || allProducts[0];`;

filesToFix.forEach(filePath => {
  const fullPath = path.resolve(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Apply the fix
    if (content.includes('allProducts.filter((elm) => elm.id == id)[0]')) {
      content = content.replace(oldPattern, newReplacement);
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('Product page fixes completed!');
