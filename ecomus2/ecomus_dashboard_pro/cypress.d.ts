/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login with email and password
     * @example cy.login('user@example.com', 'password123')
     */
    login(email?: string, password?: string): Chainable<void>
    
    /**
     * Custom command to logout
     * @example cy.logout()
     */
    logout(): Chainable<void>
    
    /**
     * Custom command to create a test store
     * @example cy.createTestStore('My Test Store')
     */
    createTestStore(storeName: string): Chainable<void>
    
    /**
     * Custom command to navigate to a specific store
     * @example cy.navigateToStore('my-store-slug')
     */
    navigateToStore(storeSlug: string): Chainable<void>
    
    /**
     * Custom command to wait for page load
     * @example cy.waitForPageLoad()
     */
    waitForPageLoad(): Chainable<void>
    
    /**
     * Custom command to intercept API calls
     * @example cy.interceptAPI('GET', '/api/stores', 'stores.json')
     */
    interceptAPI(method: string, url: string, fixture?: string): Chainable<void>
  }
}

export {}