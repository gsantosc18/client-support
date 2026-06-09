// Custom commands for Cypress testing

Cypress.Commands.add('registerUserDirectly', (user) => {
  const backendUrl = Cypress.env('backendUrl');
  const companyId = user.company_id || '11111111-1111-1111-1111-111111111111';
  
  return cy.request({
    method: 'POST',
    url: `${backendUrl}/api/auth/register?company_id=${companyId}`,
    body: {
      first_name: user.first_name || 'Test',
      last_name: user.last_name || 'User',
      email: user.email,
      phone: user.phone || '11988888888',
      birth_date: user.birth_date ? new Date(user.birth_date).toISOString() : '1990-01-01T00:00:00Z',
      password: user.password,
      password_confirm: user.password || user.password,
      terms_accepted: user.terms_accepted !== undefined ? user.terms_accepted : true,
      company_id: companyId,
      access_code: user.access_code || 'test-passcode' // default dev passcode if not specified
    },
    failOnStatusCode: false
  });
});
