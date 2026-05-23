describe('Fluxo E2E de Anotações de Acompanhamento de Processos', () => {
  const companyId = '11111111-1111-1111-1111-111111111111';
  let testUser;
  let testProcess;
  let testClient;

  beforeEach(() => {
    // Criar um novo usuário exclusivo para o teste de anotações
    const email = `annotations_qa_${Date.now()}@acme.com`;
    const password = 'P@ssw0rd99!';
    const uniqueSuffix = Date.now().toString().substring(8);
    testUser = {
      first_name: `Carlos${uniqueSuffix}`,
      last_name: `Gomes`,
      email,
      phone: '11988889999',
      birth_date: '1985-03-10',
      password,
      company_id: companyId
    };

    cy.registerUserDirectly(testUser);

    // Fazer login e criar dados necessários via API
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
      const now = Date.now();
      
      // Decodificar o JWT token para extrair o user_id real gerado
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.user_id;

      // Criar Cliente
      cy.request({
        method: 'POST',
        url: `${Cypress.env('backendUrl')}/api/clients`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          full_name: `Cliente de Teste das Notas ${now}`,
          email: `clientenotas_${now}@test.com`,
          phone: '11987654321',
          birth_date: '1990-01-01',
          cpf: now.toString().substring(2, 13)
        }
      }).then((clientRes) => {
        testClient = clientRes.body;

        // Criar Estabelecimento
        cy.request({
          method: 'POST',
          url: `${Cypress.env('backendUrl')}/api/establishments`,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            name: `CRAS Notas ${now}`,
            address: 'Rua do Teste, 100',
            city: 'São Paulo',
            state: 'SP'
          }
        }).then((estRes) => {
          const establishment = estRes.body;

          // Criar Processo com o user_id real
          cy.request({
            method: 'POST',
            url: `${Cypress.env('backendUrl')}/api/processes`,
            headers: { Authorization: `Bearer ${token}` },
            body: {
              user_id: userId,
              establishment_id: establishment.id,
              protocol: `PROC-NOTA-${now}`,
              observation: 'Observação inicial do processo',
              status: 'PENDING',
              client_ids: [testClient.id]
            }
          }).then((procRes) => {
            testProcess = procRes.body;
          });
        });
      });
    });
  });

  it('deve criar, visualizar, editar e excluir fisicamente anotações de acompanhamento', () => {
    // 1. Logar via UI
    cy.visit('/login');
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('match', /\/clients$/);

    // 2. Navegar diretamente para os detalhes do processo criado
    cy.visit(`/processes/${testProcess.id}`);
    cy.url().should('include', `/processes/${testProcess.id}`);

    // 3. Validar se a seção de anotações está visível
    cy.contains('h3', 'Anotações de Acompanhamento').should('be.visible');
    cy.contains('Nenhuma anotação de acompanhamento foi registrada').should('be.visible');

    // 4. Criar uma anotação pública
    const publicNoteText = 'Esta é uma anotação pública de andamento criada pelo QA E2E.';
    cy.get('textarea[id="annotation-text"]').type(publicNoteText);
    cy.get('select[id="annotation-visibility"]').select('PUBLIC');
    cy.get('button[type="submit"]').contains('Adicionar Anotação').click();

    // Deve aparecer na listagem
    cy.contains(publicNoteText).should('be.visible');
    cy.contains('🌍 Pública (Geral)').should('be.visible');

    // 5. Criar uma anotação privada
    const privateNoteText = 'Esta é uma anotação interna/privada super secreta.';
    cy.get('textarea[id="annotation-text"]').type(privateNoteText);
    cy.get('select[id="annotation-visibility"]').select('PRIVATE');
    cy.get('button[type="submit"]').contains('Adicionar Anotação').click();

    // Deve aparecer na listagem
    cy.contains(privateNoteText).should('be.visible');
    cy.contains('🔒 Privada (Interna)').should('be.visible');

    // 6. Editar a anotação pública
    cy.contains(publicNoteText)
      .parents('.bg-white')
      .contains('button', 'Editar')
      .click();

    const editedText = 'Anotação pública ATUALIZADA e modificada.';
    cy.contains(publicNoteText)
      .parents('.bg-white')
      .find('textarea')
      .clear()
      .type(editedText);

    cy.contains(editedText)
      .parents('.bg-white')
      .contains('button', 'Salvar Alterações')
      .click();

    // O texto modificado deve estar visível
    cy.contains(editedText).should('be.visible');
    cy.contains(publicNoteText).should('not.exist');

    // 7. Excluir a anotação privada
    cy.contains('span', '🔒 Privada (Interna)')
      .parents('div.bg-white')
      .as('privateCard');

    cy.get('@privateCard')
      .contains('button', 'Excluir')
      .click();

    // Avisar confirmação
    cy.contains('Tem certeza que deseja deletar fisicamente esta anotação').should('be.visible');

    // Clicar em cancelar na exclusão
    cy.get('@privateCard')
      .contains('button', 'Cancelar')
      .click();

    // Ainda deve existir
    cy.contains(privateNoteText).should('be.visible');

    // Clicar em excluir novamente e confirmar
    cy.get('@privateCard')
      .contains('button', 'Excluir')
      .click();

    cy.get('@privateCard')
      .contains('button', 'Excluir Definitivo')
      .click();

    // A nota privada deve desaparecer
    cy.contains(privateNoteText).should('not.exist');
  });
});
