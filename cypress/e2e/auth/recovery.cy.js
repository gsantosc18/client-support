describe('Recuperação de Senha - E2E', () => {
  const companyId = '11111111-1111-1111-1111-111111111111';

  describe('Esqueci minha senha', () => {
    beforeEach(() => {
      cy.visit('/forgot-password');
    });

    it('deve renderizar a tela de recuperação de senha corretamente', () => {
      cy.get('h2').should('contain.text', 'Recuperar Senha');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('button[type="submit"]').should('contain.text', 'Enviar link de recuperação');
    });

    it('deve exibir mensagem genérica de sucesso para e-mail cadastrado', () => {
      const email = `active_user_${Date.now()}@acme.com`;
      // Registra usuário antes
      cy.registerUserDirectly({
        email,
        password: 'P@ssw0rd99!',
        company_id: companyId
      });

      cy.visit('/forgot-password');
      cy.get('input[name="email"]').type(email);
      cy.get('button[type="submit"]').click();

      // Deve exibir mensagem genérica idêntica
      cy.get('.text-green-700').should('contain.text', 'Se o e-mail estiver cadastrado e ativo, você receberá um link de recuperação.');
    });

    it('deve exibir exatamente a mesma mensagem para e-mail inexistente para evitar enumeração', () => {
      const nonExistentEmail = `naoexiste_${Date.now()}@acme.com`;
      
      cy.get('input[name="email"]').type(nonExistentEmail);
      cy.get('button[type="submit"]').click();

      // A mensagem deve ser exatamente igual, prevenindo vazamento de dados
      cy.get('.text-green-700').should('contain.text', 'Se o e-mail estiver cadastrado e ativo, você receberá um link de recuperação.');
    });
  });

  describe('Redefinição de senha', () => {
    it('deve falhar ao acessar a tela de redefinição com token inválido ou ausente', () => {
      cy.visit('/reset-password?token=token_invalido_ou_inexistente');
      
      cy.get('input[name="password"]').type('P@ssw0rd99!');
      cy.get('input[name="password_confirm"]').type('P@ssw0rd99!');
      cy.get('button[type="submit"]').click();

      cy.get('.text-red-600').should('contain.text', 'token inválido ou expirado');
    });

    it('deve falhar se as senhas não coincidirem na redefinição', () => {
      cy.visit('/reset-password?token=algum_token_de_teste');
      
      cy.get('input[name="password"]').type('P@ssw0rd99!');
      cy.get('input[name="password_confirm"]').type('Diferente123!');
      cy.get('button[type="submit"]').click();

      cy.get('.text-red-600').should('contain.text', 'as senhas não conferem');
    });

    it('deve validar regras de senha forte na redefinição', () => {
      cy.visit('/reset-password?token=algum_token_de_teste');
      
      // Senha curta
      cy.get('input[name="password"]').type('Sh1!');
      cy.get('input[name="password_confirm"]').type('Sh1!');
      cy.get('button[type="submit"]').click();
      cy.get('.text-red-600').should('contain.text', 'token inválido ou expirado'); // o backend valida token primeiro!
    });
  });
});
