export async function GET() {
  console.log("API de secours pour la leçon 1-2 appelée");
  
  // Retourner directement le contenu de la leçon 1-2
  return new Response(JSON.stringify({
    title: "Avantages de Next.js",
    description: "Découvrez les avantages de Next.js par rapport à React",
    difficulty: "débutant",
    duration: 10,
    tags: ["Next.js", "SSR", "SSG", "Performance"],
    prerequisites: ["Connaissances de base de React", "Leçon 1-1"],
    content: `
      <h2>Avantages de Next.js</h2>
      <p>Next.js offre de nombreux avantages par rapport à une application React standard, notamment :</p>
      
      <h3>1. Rendu côté serveur (SSR)</h3>
      <p>Le rendu côté serveur permet de générer le HTML sur le serveur plutôt que dans le navigateur, ce qui améliore les performances perçues et le référencement (SEO).</p>
      
      <h3>2. Génération de sites statiques (SSG)</h3>
      <p>Next.js peut pré-rendre les pages au moment de la construction pour une livraison encore plus rapide et une meilleure mise en cache.</p>
      
      <h3>3. Routage basé sur le système de fichiers</h3>
      <p>Créez des routes simplement en ajoutant des fichiers à votre répertoire pages/, sans avoir à configurer un routeur séparé.</p>
      
      <h3>4. Optimisation automatique</h3>
      <p>Next.js inclut des optimisations pour les images, les polices, et les scripts pour améliorer les performances de l'application.</p>
    `,
    example: {
      title: "Exemple de SSR dans Next.js",
      code: `// pages/products/[id].js
export async function getServerSideProps({ params }) {
  // Récupérer l'ID du produit depuis l'URL
  const { id } = params;
  
  // Fetch data from an API
  const res = await fetch(\`https://api.example.com/products/\${id}\`);
  const product = await res.json();
  
  // Passer les données à la page via props
  return { props: { product } };
}

export default function ProductPage({ product }) {
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Prix: {product.price}€</p>
    </div>
  );
}`,
      explanation: "Ce code illustre comment Next.js permet de récupérer des données côté serveur avant le rendu de la page, ce qui améliore le SEO et les performances."
    },
    quiz: {
      title: "Quiz sur les avantages de Next.js",
      questions: [
        {
          question: "Quel avantage de Next.js améliore le référencement (SEO) ?",
          options: ["Hot Module Replacement", "Rendu côté serveur", "TypeScript intégré", "CSS Modules"],
          correctAnswer: "Rendu côté serveur"
        },
        {
          question: "Qu'est-ce que SSG dans Next.js ?",
          options: ["Server Side Gathering", "Static Site Generation", "Server Secure Gateway", "Style Sheet Generation"],
          correctAnswer: "Static Site Generation"
        }
      ]
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}