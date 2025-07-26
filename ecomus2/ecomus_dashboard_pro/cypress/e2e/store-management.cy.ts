describe('Store Management E2E Tests', () => {
  beforeEach(() => {
    // Login before each test
    cy.login()
  })

  it('should display stores list page', () => {
    cy.visit('/stores')
    cy.get('[data-testid="stores-grid"]').should('be.visible')
    cy.get('[data-testid="store-card"]').should('have.length.at.least', 1)
  })

  it('should allow searching stores', () => {
    cy.visit('/stores')
    cy.get('[data-testid="search-input"]').type('electronics')
    cy.get('[data-testid="search-button"]').click()
    cy.get('[data-testid="store-card"]').each(($card) => {
      cy.wrap($card).should('contain.text', 'electronics')
    })
  })

  it('should navigate to store details', () => {
    cy.visit('/stores')
    cy.get('[data-testid="store-card"]').first().click()
    cy.url().should('match', /\/stores\/[a-z0-9-]+$/)
    cy.get('[data-testid="store-header"]').should('be.visible')
    cy.get('[data-testid="store-products"]').should('be.visible')
  })

  it('should handle pagination', () => {
    cy.visit('/stores')
    cy.get('[data-testid="pagination"]').should('be.visible')
    cy.get('[data-testid="next-page"]').click()
    cy.url().should('include', 'page=2')
    cy.get('[data-testid="store-card"]').should('have.length.at.least', 1)
  })

  it('should filter stores by category', () => {
    cy.visit('/stores')
    cy.get('[data-testid="category-filter"]').select('Electronics')
    cy.get('[data-testid="apply-filters"]').click()
    cy.get('[data-testid="store-card"]').should('have.length.at.least', 1)
    cy.url().should('include', 'category=electronics')
  })

  it('should display store subscription status', () => {
    cy.visit('/stores')
    cy.get('[data-testid="store-card"]').first().within(() => {
      cy.get('[data-testid="subscription-badge"]').should('be.visible')
      cy.get('[data-testid="subscription-badge"]').should('contain.text', /FREE|BASIC|PREMIUM|ENTERPRISE/)
    })
  })

  it('should handle empty search results', () => {
    cy.visit('/stores')
    cy.get('[data-testid="search-input"]').type('nonexistentstore12345')
    cy.get('[data-testid="search-button"]').click()
    cy.get('[data-testid="no-results"]').should('be.visible')
    cy.get('[data-testid="no-results"]').should('contain.text', 'Aucun store trouvé')
  })

  it('should load more stores on scroll (infinite scroll)', () => {
    cy.visit('/stores')
    cy.get('[data-testid="store-card"]').its('length').then((initialCount) => {
      cy.scrollTo('bottom')
      cy.wait(2000) // Wait for new stores to load
      cy.get('[data-testid="store-card"]').should('have.length.greaterThan', initialCount)
    })
  })
})

describe('Store Details E2E Tests', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display store information correctly', () => {
    cy.navigateToStore('test-store-1')
    cy.get('[data-testid="store-name"]').should('be.visible')
    cy.get('[data-testid="store-description"]').should('be.visible')
    cy.get('[data-testid="store-rating"]').should('be.visible')
    cy.get('[data-testid="store-contact"]').should('be.visible')
  })

  it('should display store products', () => {
    cy.navigateToStore('test-store-1')
    cy.get('[data-testid="products-section"]').should('be.visible')
    cy.get('[data-testid="product-card"]').should('have.length.at.least', 1)
  })

  it('should allow filtering products within store', () => {
    cy.navigateToStore('test-store-1')
    cy.get('[data-testid="product-category-filter"]').select('Electronics')
    cy.get('[data-testid="apply-product-filters"]').click()
    cy.get('[data-testid="product-card"]').should('have.length.at.least', 1)
  })

  it('should handle store not found', () => {
    cy.visit('/stores/nonexistent-store', { failOnStatusCode: false })
    cy.get('[data-testid="store-not-found"]').should('be.visible')
    cy.get('[data-testid="back-to-stores"]').click()
    cy.url().should('include', '/stores')
  })
})