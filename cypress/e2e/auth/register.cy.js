describe('Cadastro de Usuário - E2E', () => {
  const companyId = '11111111-1111-1111-1111-111111111111'; // seeded active company
  
  beforeEach(() => {
    // Acessa a página de registro
    cy.visit(`/register`);
  });

  it('deve renderizar a tela de cadastro e todos os seus campos obrigatórios', () => {
    cy.get('h2').should('contain.text', 'Crie sua conta');
    cy.get('input[name="first_name"]').should('be.visible');
    cy.get('input[name="last_name"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="phone"]').should('be.visible');
    cy.get('input[name="birth_date"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('input[name="password_confirm"]').should('be.visible');
    cy.get('input[id="terms_accepted"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain.text', 'Cadastrar');
  });

  it('deve falhar ao cadastrar sem aceitar os termos de uso', () => {
    cy.get('input[name="first_name"]').type('João');
    cy.get('input[name="last_name"]').type('Silva');
    cy.get('input[name="email"]').type(`joaosilva_${Date.now()}@acme.com`);
    cy.get('input[name="birth_date"]').type('1990-05-10');
    cy.get('input[name="access_code"]').type('test-passcode');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="password_confirm"]').type('Password123!');
    // Não marcamos termos_accepted
    
    // Como terms_accepted tem o atributo required do HTML5, vamos remover o atributo "required"
    // temporariamente apenas para testar a validação do backend (caso burlado pelo console)
    cy.get('input[id="terms_accepted"]').then(($el) => {
      $el.removeAttr('required');
    });
    
    cy.get('button[type="submit"]').click();
    cy.get('.text-red-600').should('contain.text', 'é necessário aceitar os termos de uso');
  });

  it('deve falhar se as senhas não forem iguais', () => {
    cy.get('input[name="first_name"]').type('João');
    cy.get('input[name="last_name"]').type('Silva');
    cy.get('input[name="email"]').type(`joaosilva_${Date.now()}@acme.com`);
    cy.get('input[name="birth_date"]').type('1990-05-10');
    cy.get('input[name="access_code"]').type('test-passcode');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="password_confirm"]').type('OutraSenha123!');
    cy.get('input[id="terms_accepted"]').check();
    cy.get('button[type="submit"]').click();
    
    cy.get('.text-red-600').should('contain.text', 'a senha e a confirmação devem ser iguais');
  });

  it('deve falhar se a senha tiver menos de 8 caracteres', () => {
    cy.get('input[name="first_name"]').type('João');
    cy.get('input[name="last_name"]').type('Silva');
    cy.get('input[name="email"]').type(`joaosilva_${Date.now()}@acme.com`);
    cy.get('input[name="birth_date"]').type('1990-05-10');
    cy.get('input[name="access_code"]').type('test-passcode');
    cy.get('input[name="password"]').type('Pass1!');
    cy.get('input[name="password_confirm"]').type('Pass1!');
    cy.get('input[id="terms_accepted"]').check();
    cy.get('button[type="submit"]').click();
    
    cy.get('.text-red-600').should('contain.text', 'a senha deve ter pelo menos 8 caracteres');
  });

  it('deve falhar se a senha não contiver número', () => {
    const email = `joao_${Date.now()}@acme.com`;
    cy.get('input[name="first_name"]').type('João');
    cy.get('input[name="last_name"]').type('Silva');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="birth_date"]').type('1990-05-10');
    cy.get('input[name="access_code"]').type('test-passcode');
    cy.get('input[name="password"]').type('Password!');
    cy.get('input[name="password_confirm"]').type('Password!');
    cy.get('input[id="terms_accepted"]').check();
    cy.get('button[type="submit"]').click();
    
    cy.get('.text-red-600').should('contain.text', 'a senha deve ter pelo menos 1 número');
  });

  it('deve falhar se a senha não contiver caractere especial', () => {
    const email = `joao_${Date.now()}@acme.com`;
    cy.get('input[name="first_name"]').type('João');
    cy.get('input[name="last_name"]').type('Silva');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="birth_date"]').type('1990-05-10');
    cy.get('input[name="access_code"]').type('test-passcode');
    cy.get('input[name="password"]').type('Password123');
    cy.get('input[name="password_confirm"]').type('Password123');
    cy.get('input[id="terms_accepted"]').check();
    cy.get('button[type="submit"]').click();
    
    cy.get('.text-red-600').should('contain.text', 'a senha deve ter pelo menos 1 caractere especial');
  });

  it('deve falhar se a senha não contiver letra maiúscula', () => {
    const email = `joao_${Date.now()}@acme.com`;
    cy.get('input[name="first_name"]').type('João');
    cy.get('input[name="last_name"]').type('Silva');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="birth_date"]').type('1990-05-10');
    cy.get('input[name="access_code"]').type('test-passcode');
    cy.get('input[name="password"]').type('password123!');
    cy.get('input[name="password_confirm"]').type('password123!');
    cy.get('input[id="terms_accepted"]').check();
    cy.get('button[type="submit"]').click();
    
    cy.get('.text-red-600').should('contain.text', 'a senha deve ter pelo menos 1 letra maiúscula');
  });

  it('deve falhar se a senha não contiver letra minúscula', () => {
    const email = `joao_${Date.now()}@acme.com`;
    cy.get('input[name="first_name"]').type('João');
    cy.get('input[name="last_name"]').type('Silva');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="birth_date"]').type('1990-05-10');
    cy.get('input[name="access_code"]').type('test-passcode');
    cy.get('input[name="password"]').type('PASSWORD123!');
    cy.get('input[name="password_confirm"]').type('PASSWORD123!');
    cy.get('input[id="terms_accepted"]').check();
    cy.get('button[type="submit"]').click();
    
    cy.get('.text-red-600').should('contain.text', 'a senha deve ter pelo menos 1 letra minúscula');
  });

  it('deve falhar se a senha contiver sequência de 3 ou mais letras', () => {
    const email = `joao_${Date.now()}@acme.com`;
    cy.get('input[name="first_name"]').type('João');
    cy.get('input[name="last_name"]').type('Silva');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="birth_date"]').type('1990-05-10');
    cy.get('input[name="access_code"]').type('test-passcode');
    cy.get('input[name="password"]').type('Abcde12!'); // "abc" ou "bcd" é sequência
    cy.get('input[name="password_confirm"]').type('Abcde12!');
    cy.get('input[id="terms_accepted"]').check();
    cy.get('button[type="submit"]').click();
    
    cy.get('.text-red-600').should('contain.text', 'a senha não deve conter sequências de 3 ou mais letras');
  });

  it('deve falhar se a senha contiver sequência de 3 ou mais números', () => {
    const email = `joao_${Date.now()}@acme.com`;
    cy.get('input[name="first_name"]').type('João');
    cy.get('input[name="last_name"]').type('Silva');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="birth_date"]').type('1990-05-10');
    cy.get('input[name="access_code"]').type('test-passcode');
    cy.get('input[name="password"]').type('Password123!'); // "123" é sequência
    cy.get('input[name="password_confirm"]').type('Password123!');
    cy.get('input[id="terms_accepted"]').check();
    cy.get('button[type="submit"]').click();
    
    cy.get('.text-red-600').should('contain.text', 'a senha não deve conter sequências de 3 ou mais números');
  });

  it('deve falhar se a senha contiver o nome completo', () => {
    const email = `joao_${Date.now()}@acme.com`;
    cy.get('input[name="first_name"]').type('João');
    cy.get('input[name="last_name"]').type('Silva');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="birth_date"]').type('1990-05-10');
    cy.get('input[name="access_code"]').type('test-passcode');
    cy.get('input[name="password"]').type('João Silva1!');
    cy.get('input[name="password_confirm"]').type('João Silva1!');
    cy.get('input[id="terms_accepted"]').check();
    cy.get('button[type="submit"]').click();
    
    cy.get('.text-red-600').should('contain.text', 'a senha não deve ser igual ao nome completo');
  });

  it('deve falhar se a senha contiver o email', () => {
    const email = `joaosilva_valida@acme.com`;
    cy.get('input[name="first_name"]').type('João');
    cy.get('input[name="last_name"]').type('Silva');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="birth_date"]').type('1990-05-10');
    cy.get('input[name="access_code"]').type('test-passcode');
    
    // Senha forte que contém o e-mail completo e um número (1) para passar no hasNumber
    const strongPasswordWithEmail = `P@ss1_${email}`;
    cy.get('input[name="password"]').type(strongPasswordWithEmail);
    cy.get('input[name="password_confirm"]').type(strongPasswordWithEmail);
    cy.get('input[id="terms_accepted"]').check();
    cy.get('button[type="submit"]').click();
    
    cy.get('.text-red-600').should('contain.text', 'a senha não deve ser igual ao e-mail');
  });

  it('deve cadastrar um novo usuário com sucesso e redirecionar para login', () => {
    const email = `usuario_${Date.now()}@acme.com`;
    
    cy.get('input[name="first_name"]').type('Carlos');
    cy.get('input[name="last_name"]').type('Oliveira');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="phone"]').type('11987654321');
    cy.get('input[name="birth_date"]').type('1988-12-05');
    cy.get('input[name="access_code"]').type('test-passcode');
    // Senha forte: tem 8+ chars, maiúscula, minúscula, número, especial, sem sequências de 3, sem nome/email
    cy.get('input[name="password"]').type('P@ssw0rd99!');
    cy.get('input[name="password_confirm"]').type('P@ssw0rd99!');
    cy.get('input[id="terms_accepted"]').check();
    
    cy.get('button[type="submit"]').click();
    
    // Deve redirecionar para a tela de login
    cy.url().should('include', '/login');
    cy.url().should('include', 'registered=true');
  });

  it('deve falhar ao cadastrar se o e-mail já existir na companhia', () => {
    const email = `duplicado_${Date.now()}@acme.com`;
    
    // Cadastra o primeiro usuário
    cy.get('input[name="first_name"]').type('Ana');
    cy.get('input[name="last_name"]').type('Lima');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="birth_date"]').type('1995-02-15');
    cy.get('input[name="access_code"]').type('test-passcode');
    cy.get('input[name="password"]').type('P@ssw0rd99!');
    cy.get('input[name="password_confirm"]').type('P@ssw0rd99!');
    cy.get('input[id="terms_accepted"]').check();
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/login');
    
    // Tenta cadastrar novamente com o mesmo e-mail
    cy.visit(`/register`);
    cy.get('input[name="first_name"]').type('Ana');
    cy.get('input[name="last_name"]').type('Lima');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="birth_date"]').type('1995-02-15');
    cy.get('input[name="access_code"]').type('test-passcode');
    cy.get('input[name="password"]').type('P@ssw0rd99!');
    cy.get('input[name="password_confirm"]').type('P@ssw0rd99!');
    cy.get('input[id="terms_accepted"]').check();
    cy.get('button[type="submit"]').click();
    
    // Deve exibir mensagem do backend sobre e-mail duplicado
    cy.get('.text-red-600').should('contain.text', 'já existe um usuário com este e-mail na companhia');
  });

  it('deve exigir o código de acesso quando não houver convite e falhar se incorreto', () => {
    const email = `passcode_err_${Date.now()}@acme.com`;
    
    cy.get('input[name="first_name"]').type('João');
    cy.get('input[name="last_name"]').type('Silva');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="birth_date"]').type('1990-05-10');
    cy.get('input[name="access_code"]').type('CodigoIncorreto');
    cy.get('input[name="password"]').type('P@ssw0rd99!');
    cy.get('input[name="password_confirm"]').type('P@ssw0rd99!');
    cy.get('input[id="terms_accepted"]').check();
    cy.get('button[type="submit"]').click();

    cy.get('.text-red-600').should('be.visible');
  });

  it('deve exibir erro para token de convite inválido ou inexistente', () => {
    cy.visit('/register?invitation_token=token-invalido-qualquer');
    cy.get('.text-destructive').should('contain.text', 'convite inválido, expirado ou já utilizado');
  });

  it('deve permitir cadastro com sucesso a partir de um convite válido', () => {
    // 1. Cadastra um administrador
    const adminEmail = `admin_inv_${Date.now()}@acme.com`;
    const adminUser = {
      first_name: 'Admin',
      last_name: 'User',
      email: adminEmail,
      password: 'P@ssw0rd99!',
      company_id: companyId
    };

    cy.registerUserDirectly(adminUser).then(() => {
      // Promove o usuário recém-criado a admin via tarefa de banco de dados
      cy.task('queryDb', `UPDATE users SET admin = true WHERE email = '${adminEmail}'`).then(() => {
        // Login do admin para gerar o token de convite
        const backendUrl = Cypress.env('backendUrl');
        cy.request({
          method: 'POST',
          url: `${backendUrl}/api/auth/login`,
          body: {
            email: adminEmail,
            password: adminUser.password,
            company_id: companyId
          }
        }).then((loginRes) => {
          const token = loginRes.body.access_token;
          const invitedEmail = `invited_${Date.now()}@acme.com`;

          // Posta solicitação de convite utilizando token de acesso do admin
          cy.request({
            method: 'POST',
            url: `${backendUrl}/api/auth/invitations`,
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: {
              email: invitedEmail
            }
          }).then((inviteRes) => {
            const invitationToken = inviteRes.body.Token;

            // 2. Visita a página de registro usando o token gerado
            cy.visit(`/register?invitation_token=${invitationToken}`);

            // Verifica se a tela exibe o e-mail pré-preenchido e bloqueado
            cy.get('input[name="email"]').should('have.value', invitedEmail);
            cy.get('input[name="email"]').should('be.disabled');

            // Preenche os dados e realiza o cadastro (sem necessidade de preencher o código de acesso)
            cy.get('input[name="first_name"]').type('Convidado');
            cy.get('input[name="last_name"]').type('Silva');
            cy.get('input[name="phone"]').type('11999999999');
            cy.get('input[name="birth_date"]').type('1990-01-01');
            cy.get('input[name="password"]').type('P@ssw0rd99!');
            cy.get('input[name="password_confirm"]').type('P@ssw0rd99!');
            cy.get('input[id="terms_accepted"]').check();

            cy.get('button[type="submit"]').click();

            // Deve redirecionar para a tela de login
            cy.url().should('include', '/login');
            cy.url().should('include', 'registered=true');
          });
        });
      });
    });
  });
});

