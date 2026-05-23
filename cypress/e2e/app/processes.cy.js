describe('Fluxo E2E de Processos e Estabelecimentos - CRUD completo e Validações', () => {
  const companyId = '11111111-1111-1111-1111-111111111111';
  let testUser;
  let testClientA;
  let testClientB;

  beforeEach(() => {
    // Criar um novo usuário a cada teste para isolamento absoluto
    const email = `processes_qa_${Date.now()}@acme.com`;
    const password = 'P@ssw0rd99!';
    const uniqueSuffix = Date.now().toString().substring(8);
    testUser = {
      first_name: `Beto${uniqueSuffix}`,
      last_name: 'Oliveira',
      email,
      phone: '11977776666',
      birth_date: '1990-08-20',
      password,
      company_id: companyId
    };

    cy.registerUserDirectly(testUser);

    // Criar dois clientes ativos via API para associarmos ao processo e validar ordem alfabética
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
      
      // Criar Cliente B (Bruna)
      cy.request({
        method: 'POST',
        url: `${Cypress.env('backendUrl')}/api/clients`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          full_name: `Bruna Cliente ${now}`,
          email: `bruna_${now}@test.com`,
          phone: '11988887777',
          birth_date: '1988-06-15',
          cpf: now.toString().substring(2, 13)
        }
      }).then((clientBRes) => {
        testClientB = clientBRes.body;
        
        // Criar Cliente A (Ana)
        cy.request({
          method: 'POST',
          url: `${Cypress.env('backendUrl')}/api/clients`,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            full_name: `Ana Cliente ${now}`,
            email: `ana_${now}@test.com`,
            phone: '11988886666',
            birth_date: '1989-07-20',
            cpf: (now + 1).toString().substring(2, 13)
          }
        }).then((clientARes) => {
          testClientA = clientARes.body;
        });
      });
    });
  });

  it('deve realizar todo o fluxo de abertura de processo, criação de estabelecimento inline, selects pesquisáveis, visualização, atualização de status e exclusão com palavra-chave', () => {
    // 1. Fazer login via UI
    cy.visit('/login');
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('match', /\/clients$/);

    // 2. Navegar para Processos
    cy.get('header').contains('Processos').click();
    cy.url().should('match', /\/processes$/);

    cy.get('h1').should('contain.text', 'Processos');

    // 3. Clicar em Adicionar Processo
    cy.get('button').contains('Adicionar Processo').click();
    cy.url().should('include', '/processes/new');

    // Validações visuais do formulário (estilos de label, asterisco vermelho de campos obrigatórios, grid responsivo)
    cy.get('form').should('be.visible');
    cy.get('label').should('have.class', 'text-slate-800').and('have.class', 'font-bold');
    cy.get('span.text-red-500.font-extrabold').should('contain.text', '*').and('have.length.at.least', 4);
    cy.get('input[id="protocol"]').should('have.class', 'bg-white').and('have.class', 'text-slate-800');
    cy.get('textarea[id="observation"]').should('have.class', 'bg-white').and('have.class', 'text-slate-800');
    
    // 4. Selecionar cliente na modal clicando no botão de adicionar
    cy.get('button').contains('Adicionar Clientes').click();
    cy.get('input[placeholder="Buscar por nome ou CPF..."]').type('Cliente');
    cy.get('input[type="checkbox"]').should('have.length.at.least', 2);
    cy.get('input[type="checkbox"]').eq(0).check({ force: true });
    cy.get('input[type="checkbox"]').eq(1).check({ force: true });
    cy.get('button').contains('Confirmar Seleção').click();

    // Validar chip de cliente adicionado
    cy.get('span').should('contain.text', testClientA.full_name);
    cy.get('span').should('contain.text', testClientB.full_name);

    // 5. Cadastrar estabelecimento inline
    cy.get('button').contains('Novo Estabelecimento').click();
    
    // Preencher modal de estabelecimento
    const estName = `CRAS QA ${Date.now()}`;
    cy.get('input[id="est-name"]').type(estName);
    cy.get('input[id="est-address"]').type('Rua das Flores, 123');
    cy.get('input[id="est-city"]').type('São Paulo');
    cy.get('input[id="est-state"]').type('SP');
    
    cy.get('button[type="submit"]').contains('Salvar Estabelecimento').click();

    // Modal deve sumir e o estabelecimento deve estar selecionado na dropdown customizada
    cy.contains('label', 'Estabelecimento').parent().find('button').should('contain.text', estName);

    // 6. Selecionar o operador responsável via select pesquisável customizado
    cy.contains('label', 'Responsável pelo Processo').parent().find('button').click();
    cy.get('input[placeholder="Digite para filtrar..."]').type(testUser.first_name);
    cy.get('button').contains(`${testUser.first_name} ${testUser.last_name}`).click();

    // 7. Preencher os demais campos do processo e enviar
    const protocolCode = `PROC-E2E-${Date.now()}`;
    cy.get('input[id="protocol"]').type(protocolCode);
    cy.get('textarea[id="observation"]').type('Esta é uma observação premium do processo de QA');

    cy.get('button[type="submit"]').contains('Salvar Processo').click();

    // 8. Deve voltar para a listagem e conter o processo cadastrado com status Pendente
    cy.url().should('match', /\/processes$/);
    cy.get('tbody').should('contain.text', protocolCode);
    
    // O badge de cliente deve conter apenas o primeiro nome do primeiro cliente
    const clientFirstNameA = testClientA.full_name.split(' ')[0];
    cy.get('tbody').should('contain.text', clientFirstNameA);
    cy.get('tbody').should('contain.text', testUser.first_name);
    cy.get('tbody').should('contain.text', 'Pendente');

    // 9. Visualizar detalhes
    cy.get('tbody').contains(protocolCode).parents('tr').find('[title="Ver detalhes"]').click();
    cy.url().should('match', /\/processes\/[a-f0-9-]{36}$/);

    // Validar as categorias visuais
    cy.get('h1').should('contain.text', protocolCode); // Informações do Processo
    cy.get('span').should('contain.text', 'Pendente');
    
    // Validar Grid e Ordem Alfabética (Ana deve vir antes de Bruna)
    cy.get('.grid-cols-1').should('exist'); // Existe o container grid
    cy.get('h3').eq(0).should('contain.text', testClientA.full_name); // Ana
    cy.get('h3').eq(1).should('contain.text', testClientB.full_name); // Bruna
    
    cy.get('p').should('contain.text', '(São Paulo/SP)'); // Formato Nome (Cidade/Estado)
    cy.get('div').should('not.contain.text', 'CPF:'); // Não deve renderizar metadados extras
    cy.get('div').should('not.contain.text', 'Telefone:');
    cy.get('button').contains('Ver Perfil do Cliente').should('be.visible');
    
    cy.get('h2').should('contain.text', 'Responsável'); // Responsável
    cy.get('div').should('contain.text', testUser.email);
    
    cy.get('h2').should('contain.text', 'Estabelecimento'); // Estabelecimento
    cy.get('h3').should('contain.text', estName);

    // 10. Alterar status a partir da tela de detalhes
    cy.get('select').select('IN_PROGRESS');
    
    // O badge deve atualizar
    cy.get('span').should('contain.text', 'Em Andamento');

    // 11. Editar processo pela nova seção de Ações do Processo
    cy.contains('h2', 'Ações do Processo').should('be.visible');
    cy.contains('button', 'Editar Processo').click();
    cy.url().should('match', /\/processes\/[a-f0-9-]{36}\/edit$/);

    cy.get('input[id="protocol"]').clear().type(`${protocolCode}-ALT`);
    cy.get('button[type="submit"]').contains('Salvar Processo').click();

    // 12. Voltar para listagem e confirmar alteração
    cy.url().should('match', /\/processes$/);
    cy.get('tbody').should('contain.text', `${protocolCode}-ALT`);

    // Entrar nos detalhes novamente para excluir a partir das ações internas do card
    cy.get('tbody').contains(`${protocolCode}-ALT`).parents('tr').find('[title="Ver detalhes"]').click();
    cy.url().should('match', /\/processes\/[a-f0-9-]{36}$/);

    // 13. Excluir processo a partir da categoria Ações do Processo
    cy.contains('button', 'Excluir Processo').click();
    cy.get('h2').should('contain.text', 'Excluir Processo?');
    
    // Tenta clicar sem digitar nada (botão deve estar desativado)
    cy.get('button').contains('Remover').should('be.disabled');
    
    // Digita incorretamente
    cy.get('input[placeholder="Digite delete aqui"]').type('del');
    cy.get('button').contains('Remover').should('be.disabled');
    
    // Digita corretamente para habilitar
    cy.get('input[placeholder="Digite delete aqui"]').clear().type('delete');
    cy.get('button').contains('Remover').should('not.be.disabled').click();

    // Processo excluído deve sumir e redirecionar para a listagem
    cy.url().should('match', /\/processes$/);
    cy.get('tbody').should('not.contain.text', `${protocolCode}-ALT`);
  });
});
