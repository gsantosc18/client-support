describe('Fluxo E2E de Visualização do Perfil do Cliente via Modal', () => {
  const companyId = '11111111-1111-1111-1111-111111111111';
  let testUser;
  let testClient;
  let processId;

  beforeEach(() => {
    const email = `profile_modal_qa_${Date.now()}@acme.com`;
    const password = 'P@ssw0rd99!';
    const uniqueSuffix = Date.now().toString().substring(8);
    testUser = {
      first_name: `Eduardo${uniqueSuffix}`,
      last_name: 'Santos',
      email,
      phone: '11977771234',
      birth_date: '1992-05-15',
      password,
      company_id: companyId
    };

    cy.registerUserDirectly(testUser);

    // Login via API to prepare client and process
    cy.request({
      method: 'POST',
      url: `${Cypress.env('backendUrl')}/api/auth/login`,
      body: {
        email: testUser.email,
        password: testUser.password,
        company_id: testUser.company_id,
        keep_me_logged_in: true
      }
    }).then((loginRes) => {
      const token = loginRes.body.access_token;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.user_id;
      const now = Date.now();

      // Create Client
      cy.request({
        method: 'POST',
        url: `${Cypress.env('backendUrl')}/api/clients`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          full_name: `Cliente Perfil Modal ${now}`,
          email: `client_modal_${now}@test.com`,
          phone: '11988887777',
          birth_date: '1990-10-15',
          cpf: now.toString().substring(2, 13),
          rg: now.toString().substring(4, 13),
          cnh: now.toString().substring(2, 13)
        }
      }).then((clientRes) => {
        testClient = clientRes.body;

        // Create Establishment
        cy.request({
          method: 'POST',
          url: `${Cypress.env('backendUrl')}/api/establishments`,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            name: `CRAS Modal ${now}`,
            address: 'Rua do Teste, 100',
            city: 'São Paulo',
            state: 'SP'
          }
        }).then((estRes) => {
          const establishment = estRes.body;

          // Create Process
          cy.request({
            method: 'POST',
            url: `${Cypress.env('backendUrl')}/api/processes`,
            headers: { Authorization: `Bearer ${token}` },
            body: {
              protocol: `PROC-MODAL-${now}`,
              observation: 'Processo de teste para a modal de perfil',
              client_ids: [testClient.id],
              establishment_id: establishment.id,
              user_id: userId
            }
          }).then((processRes) => {
            processId = processRes.body.id;
          });
        });
      });
    });
  });

  it('deve abrir a modal com perfil do cliente e permitir a cópia das informações', () => {
    // 1. Login via UI
    cy.visit('/login');
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('match', /\/clients$/);

    // 2. Ir para a página de detalhes do processo
    cy.visit(`/processes/${processId}`);
    cy.url().should('include', `/processes/${processId}`);

    // 3. Verificar se o cliente está listado na seção "Clientes Associados"
    cy.contains('h2', 'Clientes Associados').should('be.visible');
    cy.contains('h3', testClient.full_name).should('be.visible');

    // 4. Clicar em "Ver Perfil do Cliente"
    cy.contains('button', 'Ver Perfil do Cliente').click();

    // 5. Validar que a modal de Perfil do Cliente é aberta e exibe os dados corretos
    cy.get('h3').should('contain.text', 'Perfil do Cliente');
    cy.get('h4').should('contain.text', testClient.full_name);
    cy.contains('E-mail').parent().should('contain.text', testClient.email);
    cy.contains('Data de Nascimento').parent().should('contain.text', '15/10/1990');
    cy.contains('RG').parent().should('contain.text', testClient.rg);
    cy.contains('CNH').parent().should('contain.text', testClient.cnh);

    // 6. Testar botão de cópia (ex: Email)
    cy.contains('E-mail').parent().find('button[title="Copiar E-mail"]').click();
    cy.contains('E-mail').parent().should('contain.text', 'Copiado!');

    // 7. Testar botão de cópia (ex: CPF)
    cy.contains('CPF').parent().find('button[title="Copiar CPF"]').click();
    cy.contains('CPF').parent().should('contain.text', 'Copiado!');

    // 8. Fechar a modal clicando no botão Fechar
    cy.get('button').contains('Fechar').click();
    cy.get('h3').should('not.contain.text', 'Perfil do Cliente');
  });
});
