describe('Login de Usuário - E2E', () => {
  const companyId = '11111111-1111-1111-1111-111111111111';
  let testUser;

  beforeEach(() => {
    // Cria um usuário novo para cada teste para termos um estado limpo
    const email = `login_test_${Date.now()}@acme.com`;
    const password = 'P@ssw0rd99!';
    testUser = {
      first_name: 'Marcos',
      last_name: 'Souza',
      email,
      phone: '11977777777',
      birth_date: '1992-06-20',
      password,
      company_id: companyId
    };

    cy.registerUserDirectly(testUser);
    cy.visit('/login');
  });

  it('deve renderizar a tela de login com todos os campos e links necessários', () => {
    cy.get('h2').should('contain.text', 'Acesse sua conta');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('input[id="remember-me"]').should('be.visible');
    cy.get('a[href="/forgot-password"]').should('contain.text', 'Esqueci minha senha');
    cy.get('a[href="/register"]').should('contain.text', 'Cadastre-se');
    cy.get('button[type="submit"]').should('contain.text', 'Entrar');
  });

  it('deve realizar login com sucesso e redirecionar para o dashboard', () => {
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();

    // Deve ser redirecionado para a tela de dashboard
    cy.url().should('include', '/dashboard');
  });

  it('deve salvar o refreshToken no localStorage se "Manter-me logado" estiver marcado', () => {
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('input[id="remember-me"]').check();
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.window().then((window) => {
      expect(window.localStorage.getItem('refreshToken')).to.not.be.null;
    });
  });

  it('não deve salvar o refreshToken no localStorage se "Manter-me logado" estiver desmarcado', () => {
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('input[id="remember-me"]').uncheck();
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.window().then((window) => {
      expect(window.localStorage.getItem('refreshToken')).to.be.null;
    });
  });

  it('deve exibir mensagem amigável e genérica em caso de erro de login', () => {
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type('SenhaErrada99!'); // Senha incorreta
    cy.get('button[type="submit"]').click();

    // Não deve indicar se é e-mail ou senha errados, apenas erro genérico
    cy.get('.text-red-600').should('contain.text', 'credenciais inválidas');
  });

  it('deve bloquear o usuário por 30 minutos após 3 tentativas falhas de login', () => {
    // 1ª tentativa incorreta
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type('SenhaIncorreta1!');
    cy.get('button[type="submit"]').click();
    cy.get('.text-red-600').should('contain.text', 'credenciais inválidas');

    // 2ª tentativa incorreta
    cy.get('input[name="password"]').clear().type('SenhaIncorreta2!');
    cy.get('button[type="submit"]').click();
    cy.get('.text-red-600').should('contain.text', 'credenciais inválidas');

    // 3ª tentativa incorreta -> Registra a terceira falha e ativa o bloqueio
    cy.get('input[name="password"]').clear().type('SenhaIncorreta3!');
    cy.get('button[type="submit"]').click();
    cy.get('.text-red-600').should('contain.text', 'credenciais inválidas');

    // 4ª tentativa -> O backend barra pelo bloqueio ativo antes de validar a senha
    cy.get('input[name="password"]').clear().type('QualquerSenha!');
    cy.get('button[type="submit"]').click();
    cy.get('.text-red-600').should('contain.text', 'usuário bloqueado por excesso de tentativas. Tente novamente mais tarde');
  });

  it('deve redirecionar corretamente ao clicar nos links de navegação', () => {
    cy.get('a[href="/forgot-password"]').click();
    cy.url().should('include', '/forgot-password');

    cy.visit('/login');
    cy.get('a[href="/register"]').click();
    cy.url().should('include', '/register');
  });
});
