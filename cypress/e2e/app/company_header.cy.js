describe('Fluxo E2E do Header de Empresa Dinâmico e Cache', () => {
  const companyId = '11111111-1111-1111-1111-111111111111';
  let testUser;

  beforeEach(() => {
    const email = `company_header_qa_${Date.now()}@acme.com`;
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

    cy.registerUserDirectly(testUser);
  });

  it('deve fazer login e exibir o nome da empresa Acme Corp no header e verificar cache no localStorage', () => {
    // 1. Visitar a página de login
    cy.visit('/login');
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    
    // Marcar para manter conectado (persiste no localStorage)
    cy.get('input[type="checkbox"]').check();
    
    cy.get('button[type="submit"]').click();
    cy.url().should('match', /\/clients$/);

    // 2. Verificar se o nome da empresa "Acme Corp" está sendo exibido dinamicamente no header
    // O texto deve ser formatado com "Acme" e "Corp" (última palavra destacada)
    cy.get('header').should('contain.text', 'Acme');
    cy.get('header').should('contain.text', 'Corp');

    // 3. Confirmar que o nome da empresa foi salvo no localStorage
    cy.window().then((win) => {
      const companyName = win.localStorage.getItem('companyName');
      expect(companyName).to.equal('Acme Corp');
    });

    // 4. Navegar para a página de Processos e garantir que a empresa continua sendo exibida
    // e nenhum request novo para /api/company é disparado (o cache resolve em silêncio)
    cy.intercept('GET', '**/api/company').as('getCompany');
    cy.get('header nav button').contains('Processos').click();
    cy.url().should('match', /\/processes$/);
    cy.get('header').should('contain.text', 'Acme');
    cy.get('header').should('contain.text', 'Corp');
    
    // A chamada não deve acontecer de novo porque está cacheado no Redux/Storage
    cy.get('@getCompany.all').should('have.length', 0);

    // 5. Fazer logout e confirmar a limpeza absoluta dos caches
    cy.get('header').find('button').contains('Sair').click();
    cy.url().should('include', '/login');

    cy.window().then((win) => {
      const companyName = win.localStorage.getItem('companyName');
      const token = win.localStorage.getItem('accessToken');
      expect(companyName).to.be.null;
      expect(token).to.be.null;
    });
  });
});
