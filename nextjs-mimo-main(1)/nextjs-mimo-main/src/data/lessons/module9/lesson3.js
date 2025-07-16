// src/data/lessons/module9/lesson3.js
const lesson3 = {
  id: '9-3',
  title: "Tests d'intégration et tests E2E avec Next.js",
  description:
    "Apprenez à implémenter des tests d'intégration et des tests end-to-end pour valider le comportement complet de votre application Next.js",
  difficulty: 'avancé',
  duration: 90,
  tags: [
    'Next.js',
    "Tests d'intégration",
    'Tests E2E',
    'Cypress',
    'Playwright'
  ],
  prerequisites: ['9-1', '9-2'],
  content: `
    <h2>Tests d'intégration et tests E2E pour Next.js</h2>
    <p>Les tests unitaires sont importants, mais ils ne permettent pas de vérifier les interactions entre les composants et les systèmes. Les tests d'intégration et les tests end-to-end (E2E) comblent cette lacune.</p>

    <h3>Qu'est-ce qu'un test d'intégration ?</h3>
    <p>Les tests d'intégration vérifient que plusieurs unités (composants, fonctions) fonctionnent correctement ensemble. Pour une application Next.js, cela peut signifier :</p>
    <ul>
      <li>Tester l'interaction entre plusieurs composants</li>
      <li>Vérifier l'intégration avec l'API (réelle ou mockée)</li>
      <li>Tester le routage et la navigation</li>
      <li>Valider les interactions utilisateur complexes</li>
    </ul>

    <h3>Qu'est-ce qu'un test E2E ?</h3>
    <p>Les tests E2E simulent le comportement réel d'un utilisateur du début à la fin d'un scénario. Ils permettent de tester :</p>
    <ul>
      <li>Des flux complets comme l'inscription, la connexion, l'achat</li>
      <li>La navigation entre les pages</li>
      <li>Les interactions avec les formulaires, modales, etc.</li>
      <li>Le comportement réel dans un navigateur</li>
    </ul>

    <h3>Tests d'intégration avec React Testing Library</h3>
    <p>React Testing Library peut être utilisé pour les tests d'intégration simples :</p>
    <pre><code class="language-javascript">// Test d'intégration d'un formulaire de connexion et son message d'erreur
test('affiche une erreur lors d\'une tentative de connexion avec des identifiants invalides', async () => {
  // Mocker l'API d'authentification
  jest.spyOn(global, 'fetch').mockImplementation(() => 
    Promise.resolve({
      json: () => Promise.resolve({ error: 'Identifiants invalides' }),
      ok: false,
    })
  );
  
  render(<LoginPage />);
  
  // Remplir et soumettre le formulaire
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'user@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/mot de passe/i), {
    target: { value: 'password123' },
  });
  fireEvent.click(screen.getByRole('button', { name: /connexion/i }));
  
  // Vérifier qu'un message d'erreur est affiché
  const errorMessage = await screen.findByText(/identifiants invalides/i);
  expect(errorMessage).toBeInTheDocument();
  
  // Nettoyer le mock
  global.fetch.mockRestore();
});</code></pre>

    <h3>Tests E2E avec Cypress</h3>
    <p>Cypress est un outil populaire pour les tests E2E dans les applications web modernes :</p>

    <h4>Installation de Cypress</h4>
    <pre><code class="language-bash">npm install -D cypress</code></pre>

    <h4>Configuration dans package.json</h4>
    <pre><code class="language-json">{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run"
  }
}</code></pre>

    <h4>Exemple de test Cypress</h4>
    <pre><code class="language-javascript">// cypress/integration/login.spec.js
describe('Login Page', () => {
  beforeEach(() => {
    // Visiter la page de connexion avant chaque test
    cy.visit('/login');
  });

  it('should login successfully with valid credentials', () => {
    // Entrer identifiants valides
    cy.get('[data-cy=email-input]').type('user@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    
    // Cliquer sur le bouton de connexion
    cy.get('[data-cy=login-button]').click();
    
    // Vérifier qu'on est redirigé vers le tableau de bord
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy=welcome-message]').should('contain', 'Bienvenue');
  });

  it('should show error with invalid credentials', () => {
    // Entrer identifiants invalides
    cy.get('[data-cy=email-input]').type('wrong@example.com');
    cy.get('[data-cy=password-input]').type('wrongpassword');
    
    // Cliquer sur le bouton de connexion
    cy.get('[data-cy=login-button]').click();
    
    // Vérifier qu'un message d'erreur est affiché
    cy.get('[data-cy=error-message]')
      .should('be.visible')
      .and('contain', 'Identifiants invalides');
  });
});</code></pre>

    <h3>Tests E2E avec Playwright</h3>
    <p>Playwright est une alternative moderne à Cypress qui offre une meilleure isolation des tests et une plus grande couverture des navigateurs :</p>

    <h4>Installation de Playwright</h4>
    <pre><code class="language-bash">npm init playwright@latest</code></pre>

    <h4>Exemple de test Playwright</h4>
    <pre><code class="language-javascript">// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Visiter la page de connexion avant chaque test
    await page.goto('/login');
  });

  test('successfully logs in with valid credentials', async ({ page }) => {
    // Entrer identifiants valides
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Cliquer sur le bouton de connexion
    await page.click('button[type="submit"]');
    
    // Vérifier qu'on est redirigé vers le tableau de bord
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('h1')).toContainText('Bienvenue');
  });

  test('shows error with invalid credentials', async ({ page }) => {
    // Entrer identifiants invalides
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Cliquer sur le bouton de connexion
    await page.click('button[type="submit"]');
    
    // Vérifier qu'un message d'erreur est affiché
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Identifiants invalides');
  });
});</code></pre>

    <h3>Meilleures pratiques pour les tests d'intégration et E2E</h3>
    <ul>
      <li><strong>Cibler les flux critiques</strong> : Concentrez-vous sur les parcours utilisateur les plus importants</li>
      <li><strong>Maintenir l'isolation</strong> : Chaque test doit être indépendant des autres</li>
      <li><strong>Simuler les API externes</strong> : Utilisez des mocks pour les API externes afin de garantir une exécution fiable</li>
      <li><strong>Utiliser des sélecteurs stables</strong> : Préférez les attributs data-testid aux classes CSS ou aux textes</li>
      <li><strong>Gérer l'asynchronisme</strong> : Attendez que les éléments soient présents avant d'interagir avec eux</li>
    </ul>
  `,
  example: {
    title: "Test E2E d'un flux de connexion et navigation",
    code: `// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'Chrome',
      use: { browserName: 'chromium' },
    },
    {
      name: 'Firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'Safari',
      use: { browserName: 'webkit' },
    },
  ],
};

export default config;

// tests/authentication.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('complete login and navigation flow', async ({ page }) => {
    // 1. Visiter la page d'accueil
    await page.goto('/');
    await expect(page).toHaveTitle(/Next.js App/);
    
    // 2. Naviguer vers la page de connexion
    await page.click('text=Connexion');
    await expect(page).toHaveURL(/login/);
    
    // 3. Remplir le formulaire de connexion
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // 4. Soumettre le formulaire
    await page.click('button[type="submit"]');
    
    // 5. Vérifier que l'utilisateur est connecté et redirigé
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('h1')).toContainText('Tableau de bord');
    
    // 6. Vérifier que les informations utilisateur sont affichées
    await expect(page.locator('[data-testid="user-name"]')).toContainText('John Doe');
    
    // 7. Naviguer vers le profil utilisateur
    await page.click('text=Profil');
    await expect(page).toHaveURL(/profile/);
    
    // 8. Vérifier les informations du profil
    await expect(page.locator('h1')).toContainText('Profil');
    await expect(page.locator('[data-testid="email"]')).toContainText('user@example.com');
    
    // 9. Se déconnecter
    await page.click('text=Déconnexion');
    
    // 10. Vérifier qu'on est redirigé vers la page d'accueil
    await expect(page).toHaveURL(/$/);
    
    // 11. Vérifier que les éléments visibles pour les utilisateurs non connectés sont présents
    await expect(page.locator('text=Connexion')).toBeVisible();
  });
});`,
    explanation:
      "Cet exemple illustre un test E2E complet avec Playwright qui simule un flux utilisateur classique : visite de la page d'accueil, connexion, navigation entre les pages, et déconnexion. Le test vérifie que chaque étape fonctionne correctement, que les redirections sont effectuées comme prévu et que les informations utilisateur sont affichées correctement. Nous utilisons également un fichier de configuration Playwright pour définir les paramètres généraux et spécifier les navigateurs à tester."
  },
  exercise: {
    title: 'Implémenter un test E2E pour un flux de création de compte',
    description:
      "Écrivez un test E2E avec Cypress ou Playwright qui teste le processus d'inscription d'un nouvel utilisateur, y compris la validation des formulaires, les messages d'erreur, et la redirection après une inscription réussie.",
    options: [
      {
        id: 1,
        text: 'Utiliser cy.intercept() ou page.route() pour simuler les réponses API',
        correct: true
      },
      {
        id: 2,
        text: 'Tester la validation côté client des champs du formulaire',
        correct: true
      },
      {
        id: 3,
        text: "Vérifier l'apparition des messages d'erreur appropriés",
        correct: true
      },
      {
        id: 4,
        text: 'Confirmer la redirection après une inscription réussie',
        correct: true
      },
      {
        id: 5,
        text: "Modifier directement la base de données pour vérifier l'inscription",
        correct: false
      },
      {
        id: 6,
        text: "Inclure des attentes (assertions) sur l'état DOM à chaque étape",
        correct: true
      },
      {
        id: 7,
        text: "Tester l'envoi d'emails de confirmation en production",
        correct: false
      },
      {
        id: 8,
        text: 'Utiliser des délais fixes (timeouts) pour gérer les chargements',
        correct: false
      }
    ],
    type: 'multiple'
  },
  quiz: {
    title: "Quiz sur les tests d'intégration et E2E",
    questions: [
      {
        question:
          "Quelle est la principale différence entre les tests d'intégration et les tests E2E ?",
        options: [
          "Les tests d'intégration sont plus rapides à exécuter",
          "Les tests E2E couvrent le parcours complet de l'utilisateur dans un vrai navigateur",
          "Les tests d'intégration utilisent toujours Jest",
          'Les tests E2E ne peuvent pas être automatisés'
        ],
        correctAnswer:
          "Les tests E2E couvrent le parcours complet de l'utilisateur dans un vrai navigateur"
      },
      {
        question:
          "Pourquoi est-il recommandé d'utiliser des attributs data-testid pour les sélecteurs dans les tests E2E ?",
        options: [
          'Ils sont plus rapides à sélectionner',
          'Ils sont plus stables que les sélecteurs basés sur le CSS ou le texte',
          'Ils sont cachés aux utilisateurs finaux',
          'Ils sont requis par Cypress et Playwright'
        ],
        correctAnswer:
          'Ils sont plus stables que les sélecteurs basés sur le CSS ou le texte'
      },
      {
        question:
          "Quel outil n'est PAS conçu principalement pour les tests E2E ?",
        options: ['Cypress', 'Playwright', 'Jest', 'Selenium'],
        correctAnswer: 'Jest'
      },
      {
        question:
          'Quelle est une bonne pratique pour gérer les temps de chargement dans les tests E2E ?',
        options: [
          'Ajouter des setTimeout fixes',
          "Utiliser des attentes explicites sur les éléments de l'UI",
          'Désactiver les animations et transitions',
          'Réduire le nombre de tests'
        ],
        correctAnswer:
          "Utiliser des attentes explicites sur les éléments de l'UI"
      },
      {
        question:
          'Comment devriez-vous gérer les appels API externes dans vos tests E2E ?',
        options: [
          'Toujours utiliser des API réelles',
          'Les désactiver complètement',
          'Les intercepter et simuler les réponses',
          'Créer un serveur API de test parallèle'
        ],
        correctAnswer: 'Les intercepter et simuler les réponses'
      }
    ]
  },
  project: {
    title: 'Mise en place de tests E2E pour une application e-commerce',
    description:
      "Dans ce projet, vous allez configurer et implémenter des tests E2E avec Playwright pour une application e-commerce Next.js. Vous testerez le flux complet d'achat, de la navigation dans le catalogue jusqu'au paiement.",
    initialCode: `// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  // Configurez Playwright pour votre projet

};

export default config;

// tests/e-commerce-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E-commerce Flow', () => {
  // Implémentez les tests E2E pour le flux d'achat
  
});`,
    solution: `// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Chrome',
      use: { browserName: 'chromium' },
    },
    {
      name: 'Firefox',
      use: { browserName: 'firefox' },
    },
  ],
};

export default config;

// tests/e-commerce-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E-commerce Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Intercepter les appels API pour simuler les réponses
    await page.route('**/api/products', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          products: [
            { id: 1, name: 'Produit Test 1', price: 19.99, image: '/img/product1.jpg' },
            { id: 2, name: 'Produit Test 2', price: 29.99, image: '/img/product2.jpg' },
            { id: 3, name: 'Produit Test 3', price: 39.99, image: '/img/product3.jpg' },
          ]
        })
      });
    });

    // Simuler l'API de paiement
    await page.route('**/api/checkout', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          orderId: 'ord_1234567890'
        })
      });
    });

    // Visiter la page d'accueil
    await page.goto('/');
  });

  test('complete e-commerce purchase flow', async ({ page }) => {
    // 1. Naviguer vers la page de catalogue
    await page.click('text=Produits');
    await expect(page).toHaveURL(/products/);
    
    // 2. Vérifier que les produits sont affichés
    await expect(page.locator('.product-card')).toHaveCount(3);
    
    // 3. Ouvrir la page de détail d'un produit
    await page.click('text=Produit Test 1');
    await expect(page).toHaveURL(/products\/1/);
    await expect(page.locator('h1')).toContainText('Produit Test 1');
    
    // 4. Ajouter le produit au panier
    await page.click('button:has-text("Ajouter au panier")');
    
    // 5. Vérifier le toast/notification de confirmation
    await expect(page.locator('[data-testid="toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="toast"]')).toContainText('Produit ajouté au panier');
    
    // 6. Naviguer vers le panier
    await page.click('[data-testid="cart-icon"]');
    await expect(page).toHaveURL(/cart/);
    
    // 7. Vérifier que le produit est dans le panier
    await expect(page.locator('.cart-item')).toHaveCount(1);
    await expect(page.locator('.cart-item')).toContainText('Produit Test 1');
    await expect(page.locator('[data-testid="total-price"]')).toContainText('19.99');
    
    // 8. Procéder au checkout
    await page.click('button:has-text("Procéder au paiement")');
    await expect(page).toHaveURL(/checkout/);
    
    // 9. Remplir le formulaire de livraison
    await page.fill('input[name="fullName"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="address"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="postalCode"]', '12345');
    
    // 10. Passer à la page de paiement
    await page.click('button:has-text("Continuer")');
    
    // 11. Remplir les informations de paiement (simulées)
    await page.fill('input[name="cardNumber"]', '4111 1111 1111 1111');
    await page.fill('input[name="cardName"]', 'John Doe');
    await page.fill('input[name="expiryDate"]', '12/25');
    await page.fill('input[name="cvv"]', '123');
    
    // 12. Finaliser la commande
    await page.click('button:has-text("Passer la commande")');
    
    // 13. Vérifier la page de confirmation
    await expect(page).toHaveURL(/order-confirmation/);
    await expect(page.locator('h1')).toContainText('Commande confirmée');
    await expect(page.locator('[data-testid="order-id"]')).toContainText('ord_1234567890');
    
    // 14. Vérifier le panier vide après la commande
    await page.click('[data-testid="cart-icon"]');
    await expect(page.locator('[data-testid="empty-cart"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-cart"]')).toContainText('Votre panier est vide');
  });
});`
  },
  hasExercise: true,
  hasQuiz: true,
  hasProject: true
}

export default lesson3
