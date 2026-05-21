describe('Fluxo E2E de Clientes - CRUD completo e Validações', () => {
  const companyId = '11111111-1111-1111-1111-111111111111';
  let testUser;

  beforeEach(() => {
    // Criar um novo usuário a cada teste para isolamento absoluto
    const email = `clients_qa_${Date.now()}@acme.com`;
    const password = 'P@ssw0rd99!';
    testUser = {
      first_name: 'Ana',
      last_name: 'Silveira',
      email,
      phone: '11966665555',
      birth_date: '1995-04-12',
      password,
      company_id: companyId
    };

    cy.registerUserDirectly(testUser);
  });

  it('deve renderizar a tela de listagem de clientes vazia com os cabeçalhos apropriados', () => {
    // Fazer login via UI no escopo do teste
    cy.visit('/login');
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('match', /\/clients$/);

    cy.get('h1').should('contain.text', 'Clientes');
    cy.get('button').should('contain.text', 'Adicionar Cliente');
    cy.get('input[id="search-input"]').should('be.visible');
    cy.get('select[id="status-select"]').should('be.visible');
    
    // Tabela vazia inicialmente
    cy.get('td').should('contain.text', 'Nenhum cliente cadastrado ou encontrado.');
  });

  it('deve cadastrar um cliente com sucesso, visualizar detalhes, editar e excluir', () => {
    // Fazer login via UI
    cy.visit('/login');
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('match', /\/clients$/);

    const clientCPF = Date.now().toString().substring(2, 13);
    const clientRG = Math.floor(100000000 + Math.random() * 900000000).toString();
    const clientCNH = Math.floor(10000000000 + Math.random() * 90000000000).toString().substring(0, 11);
    const clientName = `Cliente E2E ${Date.now()}`;

    // 1. Ir para a tela de criação
    cy.get('button').contains('Adicionar Cliente').click();
    cy.url().should('include', '/clients/new');

    // 2. Preencher formulário de criação com delay na digitação de campos mascarados
    cy.get('input[id="full-name"]').type(clientName);
    cy.get('input[id="email"]').type(`cliente_${Date.now()}@teste.com`);
    cy.get('input[id="phone"]').type('11999998888', { delay: 15 });
    cy.get('input[id="birth-date"]').type('1990-10-15');
    cy.get('input[id="cpf"]').type(clientCPF, { delay: 15 });
    cy.get('input[id="rg"]').type(clientRG);
    cy.get('input[id="cnh"]').type(clientCNH);

    cy.get('button[type="submit"]').contains('Salvar').click();

    // 3. Deve voltar para a listagem e conter o cliente
    cy.url().should('match', /\/clients$/);
    cy.get('tbody').should('contain.text', clientName);

    // 4. Ver detalhes do cliente usando click forçado
    cy.get('tbody').contains(clientName).parent().find('a[title="Ver detalhes"]').click({ force: true });
    cy.url().should('match', /\/clients\/[a-f0-9-]{36}$/);

    cy.get('h1').should('contain.text', clientName);

    // 5. Ir para edição do cliente
    cy.get('button').contains('Editar Cliente').click();
    cy.url().should('match', /\/clients\/[a-f0-9-]{36}\/edit$/);

    cy.get('input[id="full-name"]').clear().type(`${clientName} Alterado`);
    cy.get('select[id="status"]').select('SUSPENDED').should('have.value', 'SUSPENDED');

    cy.get('button[type="submit"]').contains('Salvar').click();

    // 6. Voltar para a listagem e validar alteração
    cy.url().should('match', /\/clients$/);
    cy.get('tbody').should('contain.text', `${clientName} Alterado`);
    cy.get('tbody').should('contain.text', 'Suspenso');

    // 7. Excluir o cliente definitivamente (exclusão física)
    cy.get('tbody').contains(`${clientName} Alterado`).parent().find('button[title="Excluir"]').click({ force: true });
    
    // Modal aberta
    cy.get('h2').should('contain.text', 'Excluir Cliente?');
    cy.get('button').contains('Remover').should('be.disabled');

    // Digitar confirmacao
    cy.get('input[id="delete-confirm"]').type('delete');
    cy.get('button').contains('Remover').should('be.enabled').click();

    // Com a exclusão física, o cliente não deve mais constar na listagem
    cy.get('tbody').should('not.contain.text', `${clientName} Alterado`);
  });

  it('deve bloquear a exclusão de um cliente se ele possuir processos associados no banco', () => {
    const clientCPF = Date.now().toString().substring(2, 13);
    const clientRG = Math.floor(100000000 + Math.random() * 900000000).toString();
    const clientCNH = Math.floor(10000000000 + Math.random() * 90000000000).toString().substring(0, 11);
    const clientName = `Cliente Bloqueado ${Date.now()}`;
    const clientEmail = `blocked_${Date.now()}@teste.com`;
    let clientId;

    // 1. Criar dados via API primeiro, usando token obtido programaticamente
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
      
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const userId = decodedPayload.user_id;

      // Criar o cliente
      cy.request({
        method: 'POST',
        url: `${Cypress.env('backendUrl')}/api/clients`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          full_name: clientName,
          email: clientEmail,
          phone: '11977775555',
          birth_date: '1985-05-20',
          cpf: clientCPF,
          rg: clientRG,
          cnh: clientCNH
        }
      }).then((clientRes) => {
        clientId = clientRes.body.id;

        // Criar o processo associado
        cy.request({
          method: 'POST',
          url: `${Cypress.env('backendUrl')}/api/processes`,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            client_id: clientId,
            user_id: userId,
            title: 'Processo Trabalhista Inc.',
            description: 'Ação trabalhista contra empresa XPTO',
            external_id: `PROC-${Date.now()}`,
            status: 'IN_PROGRESS'
          }
        }).then((procRes) => {
          expect(procRes.status).to.eq(201);

          // 2. Com os dados prontos no banco, fazer login via UI para acessar a tela com segurança
          cy.visit('/login');
          cy.get('input[name="email"]').type(testUser.email);
          cy.get('input[name="password"]').type(testUser.password);
          cy.get('button[type="submit"]').click();
          cy.url().should('match', /\/clients$/);

          // 3. Buscar e tentar excluir o cliente usando click forçado
          cy.get('tbody').should('contain.text', clientName);
          cy.get('tbody').contains(clientName).parent().find('button[title="Excluir"]').click({ force: true });

          // 4. Confirmar digitando "delete"
          cy.get('input[id="delete-confirm"]').type('delete');
          cy.get('button').contains('Remover').click();

          // 5. Validar mensagem de bloqueio referencial retornada pelo backend
          cy.get('.text-red-600').should('contain.text', 'O cliente está vinculado a um processo e não pode ser removido.');
          
          // 6. Cancelar modal e verificar persistência
          cy.get('button').contains('Cancelar').click();
          cy.get('tbody').should('contain.text', clientName);
        });
      });
    });
  });
});
