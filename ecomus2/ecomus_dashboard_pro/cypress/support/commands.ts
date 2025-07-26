/// <reference types="cypress" />
/// <reference path="../../cypress.d.ts" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login
Cypress.Commands.add('login', (email = 'test@example.com', password = 'testpassword123') => {
  cy.session([email, password], () => {
    cy.visit('/auth/signin')
    cy.get('[data-testid="email-input"]').type(email)
    cy.get('[data-testid="password-input"]').type(password)
    cy.get('[data-testid="login-button"]').click()
    cy.url().should('not.include', '/auth/signin')
  })
})

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should('include', '/auth/signin')
})

// Custom command to create a test store
Cypress.Commands.add('createTestStore', (storeName: string) => {
  cy.visit('/dashboard/stores')
  cy.get('[data-testid="create-store-button"]').click()
  cy.get('[data-testid="store-name-input"]').type(storeName)
  cy.get('[data-testid="store-description-input"]').type(`Description for ${storeName}`)
  cy.get('[data-testid="create-store-submit"]').click()
  cy.contains('Store créé avec succès').should('be.visible')
})

// Custom command to navigate to a specific store
Cypress.Commands.add('navigateToStore', (storeSlug: string) => {
  cy.visit(`/stores/${storeSlug}`)
  cy.waitForPageLoad()
})

// Custom command to wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible')
  cy.get('[data-testid="loading-spinner"]').should('not.exist')
})

// Override the visit command to wait for page load
Cypress.Commands.overwrite('visit', (originalFn, ...args) => {
  return originalFn(...args)
})

// Add command to handle API responses
Cypress.Commands.add('interceptAPI', (method: string, url: string, fixture?: string) => {
  if (fixture) {
    cy.intercept(method as any, url, { fixture })
  } else {
    cy.intercept(method as any, url)
  }
})

export {}