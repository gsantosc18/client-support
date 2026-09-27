describe('Autenticação Persistente e Refresh Token - E2E & API', () => {
  const companyId = '11111111-1111-1111-1111-111111111111';
  let testUser;

  beforeEach(() => {
    const email = `refresh_test_${Date.now()}@acme.com`;
    const password = 'P@ssw0rd99!';
    testUser = {
      first_name: 'Carlos',
      last_name: 'Silveira',
      email,
      phone: '11988887777',
      birth_date: '1990-01-15',
      password,
      company_id: companyId
    };

    cy.registerUserDirectly(testUser);
  });

  it('deve renovar a sessão com sucesso através do endpoint POST /api/auth/refresh', () => {
    // 1. Realiza login via API
    cy.request({
      method: 'POST',
      url: 'http://localhost:8080/api/auth/login',
      body: {
        email: testUser.email,
        password: testUser.password,
        company_id: companyId,
        keep_me_logged_in: true
      }
    }).then((loginResp) => {
      expect(loginResp.status).to.eq(200);
      const originalRefreshToken = loginResp.body.refresh_token;
      const originalAccessToken = loginResp.body.access_token;
      expect(originalRefreshToken).to.be.a('string');
      expect(originalAccessToken).to.be.a('string');

      // 2. Chama endpoint de refresh com o refresh token obtido
      cy.request({
        method: 'POST',
        url: 'http://localhost:8080/api/auth/refresh',
        body: {
          refresh_token: originalRefreshToken
        }
      }).then((refreshResp) => {
        expect(refreshResp.status).to.eq(200);
        expect(refreshResp.body.access_token).to.be.a('string');
        expect(refreshResp.body.refresh_token).to.be.a('string');
        expect(refreshResp.body.access_token).to.not.eq(originalAccessToken);
        expect(refreshResp.body.refresh_token).to.not.eq(originalRefreshToken);

        // 3. Testa Refresh Token Rotation: o token anterior deve agora estar na blacklist
        cy.request({
          method: 'POST',
          url: 'http://localhost:8080/api/auth/refresh',
          body: {
            refresh_token: originalRefreshToken
          },
          failOnStatusCode: false
        }).then((replayResp) => {
          expect(replayResp.status).to.eq(401);
          expect(replayResp.body.error).to.include('inválido');
        });
      });
    });
  });

  it('deve retornar 401 ao tentar refresh com token mal formatado ou inválido', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:8080/api/auth/refresh',
      body: {
        refresh_token: 'token.totalmente.invalido'
      },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(401);
      expect(resp.body.error).to.include('inválido');
    });
  });

  it('deve retornar 400 ao enviar payload vazio para /api/auth/refresh', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:8080/api/auth/refresh',
      body: {},
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(400);
      expect(resp.body.error).to.include('obrigatório');
    });
  });

  it('deve executar renovação transparente no frontend quando o accessToken expira/torna-se inválido', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('input[id="remember-me"]').check();
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/clients');

    cy.window().then((win) => {
      const storedRefreshToken = win.localStorage.getItem('refreshToken');
      expect(storedRefreshToken).to.not.be.null;

      // Simula token de acesso expirado/inválido gravado no storage
      win.localStorage.setItem('accessToken', 'expired.token.jwt');
    });

    // Intercepta a chamada ao endpoint de refresh
    cy.intercept('POST', '**/auth/refresh').as('tokenRefresh');

    // Executa uma ação de consulta de dados protegidos (ex: recarregar ou navegar para clientes)
    cy.visit('/clients');

    // A página de clientes deve carregar normalmente sem deslogar o usuário
    cy.url().should('include', '/clients');
    cy.get('body').should('not.contain.text', 'Acesse sua conta');
  });
});
