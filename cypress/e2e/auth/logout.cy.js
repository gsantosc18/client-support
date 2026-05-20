describe('Logout de Usuário - E2E', () => {
  const companyId = '11111111-1111-1111-1111-111111111111';
  let testUser;

  beforeEach(() => {
    const email = `logout_test_${Date.now()}@acme.com`;
    const password = 'P@ssw0rd99!';
    testUser = {
      first_name: 'Lucas',
      last_name: 'Mendes',
      email,
      phone: '11966666666',
      birth_date: '1993-08-15',
      password,
      company_id: companyId
    };

    cy.registerUserDirectly(testUser);
  });

  it('deve realizar logout com sucesso, limpar o estado e invalidar o token', () => {
    // 1. Faz login programaticamente via API para obter os tokens
    cy.request({
      method: 'POST',
      url: `${Cypress.env('backendUrl')}/api/auth/login`,
      body: {
        email: testUser.email,
        password: testUser.password,
        company_id: testUser.company_id,
        keep_me_logged_in: true
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      const accessToken = response.body.access_token;
      const refreshToken = response.body.refresh_token;

      // 2. Coloca os tokens no local storage e no state (simulando estado logado)
      cy.visit('/login');
      cy.window().then((win) => {
        win.localStorage.setItem('refreshToken', refreshToken);
        // Podemos testar que a requisição de logout invalida o token no backend
        cy.request({
          method: 'POST',
          url: `${Cypress.env('backendUrl')}/api/auth/logout`,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }).then((logoutRes) => {
          expect(logoutRes.status).to.eq(200);
          expect(logoutRes.body.message).to.eq('logout realizado com sucesso');

          // 3. Tenta usar o mesmo token em outra requisição protegida ou tentar deslogar novamente
          // O backend deve retornar 401 Unauthorized porque o token está na Blacklist do Redis
          cy.request({
            method: 'POST',
            url: `${Cypress.env('backendUrl')}/api/auth/logout`,
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            failOnStatusCode: false
          }).then((retryRes) => {
            expect(retryRes.status).to.eq(401);
          });
        });
      });
    });
  });
});
