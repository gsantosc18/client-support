import './commands';

// Bypass uncaught exceptions from React/Next.js to prevent false failures
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
