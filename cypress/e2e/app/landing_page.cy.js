describe('Fluxo E2E da Landing Page', () => {
  const companyId = '11111111-1111-1111-1111-111111111111';
  let testUser;

  beforeEach(() => {
    const email = `landing_page_qa_${Date.now()}@acme.com`;
    const password = 'P@ssw0rd99!';
    testUser = {
      first_name: 'Ana',
      last_name: 'Silva',
      email,
      phone: '11977778888',
      birth_date: '1990-08-20',
      password,
      company_id: companyId
    };
  });

  it('deve carregar a landing page para visitantes anônimos e permitir navegar para login/cadastro', () => {
    // 1. Visitar a rota raiz
    cy.visit('/');

    // 2. Validar elementos principais da página
    cy.get('h1').should('contain.text', 'Gerencie seus clientes e processos');
    cy.get('#nav-login-btn').should('exist').and('contain.text', 'Entrar');
    cy.get('#nav-register-btn').should('exist').and('contain.text', 'Criar Conta');
    cy.get('#hero-cta-primary').should('contain.text', 'Iniciar Agora Grátis');

    // 3. Validar seções secundárias
    cy.get('#features').should('exist');
    cy.get('footer').should('contain.text', 'SuporteCliente');

    // 4. Testar navegação do CTA principal para a página de registro
    cy.get('#hero-cta-primary').click();
    cy.url().should('include', '/register');
    
    // 5. Testar navegação do botão "Entrar" do Header para login
    cy.visit('/');
    cy.get('#nav-login-btn').click();
    cy.url().should('include', '/login');
  });

  it('deve exibir botões "Ir para o Painel" e redirecionar corretamente quando o usuário estiver logado', () => {
    // 1. Registrar e autenticar o usuário
    cy.registerUserDirectly(testUser);
    
    cy.visit('/login');
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('input[type="checkbox"]').check();
    cy.get('button[type="submit"]').click();
    cy.url().should('match', /\/clients$/);

    // 2. Retornar à raiz (Landing Page)
    cy.visit('/');

    // 3. Confirmar botões alterados para usuários logados
    cy.get('#nav-dashboard-btn').should('exist').and('contain.text', 'Ir para o Painel');
    cy.get('#nav-login-btn').should('not.exist');
    cy.get('#nav-register-btn').should('not.exist');
    cy.get('#hero-cta-primary').should('contain.text', 'Ir para o Painel');

    // 4. Clicar no CTA principal e garantir redirecionamento para o painel de clientes
    cy.get('#hero-cta-primary').click();
    cy.url().should('match', /\/clients$/);
  });
});
