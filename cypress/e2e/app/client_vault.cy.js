describe('Fluxo E2E do Cofre de Credenciais de Clientes', () => {
  const companyId = '11111111-1111-1111-1111-111111111111';
  let testUser;
  let clientId;
  let clientName;

  beforeEach(() => {
    const email = `vault_qa_${Date.now()}@acme.com`;
    const password = 'P@ssw0rd99!';
    testUser = {
      first_name: 'Guilherme',
      last_name: 'Santos',
      email,
      phone: '11966665555',
      birth_date: '1995-04-12',
      password,
      company_id: companyId
    };

    clientName = `Cliente Vault ${Date.now()}`;

    // Cadastra usuário de teste
    cy.registerUserDirectly(testUser);

    // Faz login via API e cria o cliente para agilizar o setup
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
      
      cy.request({
        method: 'POST',
        url: `${Cypress.env('backendUrl')}/api/clients`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          full_name: clientName,
          email: `cliente_v_${Date.now()}@teste.com`,
          phone: '11999998888',
          birth_date: '1990-10-15',
          cpf: Date.now().toString().substring(2, 13)
        }
      }).then((clientRes) => {
        clientId = clientRes.body.id;
      });
    });
  });

  it('deve gerenciar credenciais sigilosas (criar, listar, revelar, editar e excluir)', () => {
    // 1. Login via UI e ir direto para o detalhe do cliente
    cy.visit('/login');
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('match', /\/clients$/);

    cy.visit(`/clients/${clientId}`);
    cy.get('h1').should('contain.text', clientName);

    // 2. Verificar seção do cofre e que está vazia
    cy.get('h3').should('contain.text', 'Cofre de Credenciais Sigilosas');
    cy.get('p').should('contain.text', 'Nenhuma credencial sigilosa cadastrada.');

    // 3. Cadastrar nova credencial sigilosa
    cy.get('button').contains('Nova Credencial').click();
    cy.get('h2').should('contain.text', 'Nova Credencial Sigilosa');

    cy.get('input[id="vault-title"]').type('Acesso Portal e-CAC');
    cy.get('input[id="vault-password"]').type('SenhaSuperSigilosa123');
    cy.get('textarea[id="vault-notes"]').type('Nota confidencial de teste.');

    cy.get('button[type="submit"]').contains('Guardar Credencial').click();

    // 4. Deve listar o item mascarado
    cy.get('table').should('be.visible');
    cy.get('tbody').should('contain.text', 'Acesso Portal e-CAC');
    cy.get('tbody').should('contain.text', '••••••••');
    cy.get('tbody').should('contain.text', '• Ocultado •');

    // 5. Clicar em Revelar e verificar decriptação
    cy.get('button[title="Revelar e Descriptografar"]').click();
    cy.get('tbody').should('contain.text', 'SenhaSuperSigilosa123');
    cy.get('tbody').should('contain.text', 'Nota confidencial de teste.');

    // 6. Clicar em Ocultar
    cy.get('button[title="Ocultar Credencial"]').click();
    cy.get('tbody').should('contain.text', '••••••••');
    cy.get('tbody').should('contain.text', '• Ocultado •');

    // 7. Editar a credencial
    cy.get('button[title="Editar Credencial"]').click();
    cy.get('h2').should('contain.text', 'Editar Credencial');
    // Campos devem estar preenchidos com os dados decriptados
    cy.get('input[id="vault-title"]').clear().type('e-CAC Atualizado');
    cy.get('input[id="vault-password"]').clear().type('NovaSenhaSegura999');

    cy.get('button[type="submit"]').contains('Salvar Alterações').click();

    // Validar atualização
    cy.get('tbody').should('contain.text', 'e-CAC Atualizado');
    cy.get('tbody').should('contain.text', '••••••••');

    // Revelar para validar nova senha
    cy.get('button[title="Revelar e Descriptografar"]').click();
    cy.get('tbody').should('contain.text', 'NovaSenhaSegura999');

    // 8. Excluir a credencial
    cy.get('button[title="Excluir Credencial"]').click();
    
    // Deve exibir o aviso do window.confirm (Cypress aceita confirmação automaticamente)
    cy.get('p').should('contain.text', 'Nenhuma credencial sigilosa cadastrada.');
  });
});
