describe('Backend Auth API Integration Tests', () => {
  const backendUrl = Cypress.env('backendUrl');
  const companyId = '11111111-1111-1111-1111-111111111111';
  let testUser;

  beforeEach(() => {
    const email = `api_test_${Date.now()}@acme.com`;
    testUser = {
      first_name: 'Daniel',
      last_name: 'Costa',
      email,
      phone: '11955555555',
      birth_date: '1987-10-30T00:00:00Z',
      password: 'P@ssw0rd99!',
      password_confirm: 'P@ssw0rd99!',
      terms_accepted: true,
      company_id: companyId
    };
  });

  it('POST /api/auth/register - deve cadastrar usuário com sucesso', () => {
    cy.request({
      method: 'POST',
      url: `${backendUrl}/api/auth/register?company_id=${companyId}`,
      body: testUser
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('message', 'usuário cadastrado com sucesso');
    });
  });

  it('POST /api/auth/register - deve falhar se o email já existe', () => {
    // Cadastra primeiro
    cy.request({
      method: 'POST',
      url: `${backendUrl}/api/auth/register?company_id=${companyId}`,
      body: testUser
    }).then(() => {
      // Tenta cadastrar idêntico novamente
      cy.request({
        method: 'POST',
        url: `${backendUrl}/api/auth/register?company_id=${companyId}`,
        body: testUser,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error', 'já existe um usuário com este e-mail na companhia');
      });
    });
  });

  it('POST /api/auth/login - deve logar e retornar tokens válidos', () => {
    // Primeiro cadastra o usuário
    cy.request({
      method: 'POST',
      url: `${backendUrl}/api/auth/register?company_id=${companyId}`,
      body: testUser
    }).then(() => {
      // Em seguida, tenta logar
      cy.request({
        method: 'POST',
        url: `${backendUrl}/api/auth/login`,
        body: {
          email: testUser.email,
          password: testUser.password,
          company_id: companyId,
          keep_me_logged_in: true
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('access_token');
        expect(response.body).to.have.property('refresh_token');
      });
    });
  });

  it('POST /api/auth/forgot-password - deve retornar mensagem genérica sempre', () => {
    cy.request({
      method: 'POST',
      url: `${backendUrl}/api/auth/forgot-password`,
      body: {
        email: 'qualquer_email@acme.com',
        company_id: companyId
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('message', 'Se o e-mail estiver cadastrado e ativo, você receberá um link de recuperação.');
    });
  });

  it('POST /api/auth/logout - deve invalidar o token de acesso', () => {
    // Cadastra e loga
    cy.request({
      method: 'POST',
      url: `${backendUrl}/api/auth/register?company_id=${companyId}`,
      body: testUser
    }).then(() => {
      cy.request({
        method: 'POST',
        url: `${backendUrl}/api/auth/login`,
        body: {
          email: testUser.email,
          password: testUser.password,
          company_id: companyId
        }
      }).then((loginRes) => {
        const token = loginRes.body.access_token;

        // Efetua logout
        cy.request({
          method: 'POST',
          url: `${backendUrl}/api/auth/logout`,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }).then((logoutRes) => {
          expect(logoutRes.status).to.eq(200);
          expect(logoutRes.body).to.have.property('message', 'logout realizado com sucesso');

          // Tenta reutilizar o token -> deve dar 401 Unauthorized
          cy.request({
            method: 'POST',
            url: `${backendUrl}/api/auth/logout`,
            headers: {
              Authorization: `Bearer ${token}`
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
