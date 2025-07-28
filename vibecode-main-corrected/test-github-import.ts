import { importGitHubRepository } from "./features/playground/actions";

// Test avec un dépôt public simple
async function testGitHubImport() {
  console.log("🧪 Test d'import GitHub...");
  
  try {
    // Test avec un dépôt public simple
    const testRepo = "https://github.com/facebook/react";
    console.log(`📂 Test avec: ${testRepo}`);
    
    const result = await importGitHubRepository(testRepo);
    console.log("✅ Import réussi:", result);
    
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

// Note: Ce script doit être exécuté dans un environnement Next.js
// Pour tester manuellement, utilisez l'interface web
console.log("💡 Pour tester l'import GitHub:");
console.log("1. Allez sur http://localhost:3004/dashboard");
console.log("2. Cliquez sur 'Open GitHub Repository'");
console.log("3. Entrez l'URL d'un dépôt public comme: https://github.com/facebook/react");
console.log("4. Le token GitHub configuré sera automatiquement utilisé");
