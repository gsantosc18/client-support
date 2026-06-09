package service

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/client-support/backend/internal/domain"
	"github.com/client-support/backend/pkg/utils"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// --- Mocks ---

type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) Create(user *domain.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserRepository) FindByID(id uuid.UUID) (*domain.User, error) {
	args := m.Called(id)
	var user *domain.User
	if args.Get(0) != nil {
		user = args.Get(0).(*domain.User)
	}
	return user, args.Error(1)
}

func (m *MockUserRepository) FindByEmailAndCompany(email string, companyID uuid.UUID) (*domain.User, error) {
	args := m.Called(email, companyID)
	var user *domain.User
	if args.Get(0) != nil {
		user = args.Get(0).(*domain.User)
	}
	return user, args.Error(1)
}

func (m *MockUserRepository) Update(user *domain.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserRepository) SaveRecoveryToken(token *domain.PasswordRecoveryToken) error {
	args := m.Called(token)
	return args.Error(0)
}

func (m *MockUserRepository) FindRecoveryToken(token string) (*domain.PasswordRecoveryToken, error) {
	args := m.Called(token)
	var recToken *domain.PasswordRecoveryToken
	if args.Get(0) != nil {
		recToken = args.Get(0).(*domain.PasswordRecoveryToken)
	}
	return recToken, args.Error(1)
}

func (m *MockUserRepository) MarkRecoveryTokenUsed(id uuid.UUID) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockUserRepository) FindAllByCompany(companyID uuid.UUID) ([]*domain.User, error) {
	args := m.Called(companyID)
	var users []*domain.User
	if args.Get(0) != nil {
		users = args.Get(0).([]*domain.User)
	}
	return users, args.Error(1)
}

func (m *MockUserRepository) SaveInvitation(invitation *domain.UserInvitation) error {
	args := m.Called(invitation)
	return args.Error(0)
}

func (m *MockUserRepository) FindInvitationByToken(token string) (*domain.UserInvitation, error) {
	args := m.Called(token)
	var inv *domain.UserInvitation
	if args.Get(0) != nil {
		inv = args.Get(0).(*domain.UserInvitation)
	}
	return inv, args.Error(1)
}

func (m *MockUserRepository) MarkInvitationUsed(id uuid.UUID) error {
	args := m.Called(id)
	return args.Error(0)
}

type MockCompanyRepository struct {
	mock.Mock
}

func (m *MockCompanyRepository) FindByID(id uuid.UUID) (*domain.Company, error) {
	args := m.Called(id)
	var company *domain.Company
	if args.Get(0) != nil {
		company = args.Get(0).(*domain.Company)
	}
	return company, args.Error(1)
}

type MockEmailService struct {
	mock.Mock
}

func (m *MockEmailService) SendPasswordRecoveryEmail(to, companyName, link string) error {
	args := m.Called(to, companyName, link)
	return args.Error(0)
}

type MockBlacklistRepo struct {
	mock.Mock
}

func (m *MockBlacklistRepo) Add(ctx context.Context, token string, expiration time.Duration) error {
	args := m.Called(ctx, token, expiration)
	return args.Error(0)
}

func (m *MockBlacklistRepo) IsBlacklisted(ctx context.Context, token string) (bool, error) {
	args := m.Called(ctx, token)
	return args.Bool(0), args.Error(1)
}

// --- Tests ---

func TestAuthService_Register(t *testing.T) {
	companyID := uuid.New()
	
	t.Run("Termos não aceitos", func(t *testing.T) {
		svc := NewAuthService(nil, nil, nil, nil, uuid.Nil, "", 24*time.Hour)
		err := svc.Register(RegisterRequest{TermsAccepted: false})
		assert.EqualError(t, err, "é necessário aceitar os termos de uso")
	})

	t.Run("Companhia Inativa", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: "INACTIVE"}, nil)

		svc := NewAuthService(nil, mockCompany, nil, nil, uuid.Nil, "", 24*time.Hour)
		err := svc.Register(RegisterRequest{
			TermsAccepted:   true,
			Password:        "Test@123",
			PasswordConfirm: "Test@123",
			CompanyID:       companyID,
		})
		assert.EqualError(t, err, "a companhia informada não está ativa")
	})

	t.Run("Sucesso", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: domain.CompanyStatusActive}, nil)

		mockUser := new(MockUserRepository)
		mockUser.On("FindByEmailAndCompany", "test@test.com", companyID).Return(nil, errors.New("not found"))
		mockUser.On("Create", mock.Anything).Return(nil)

		svc := NewAuthService(mockUser, mockCompany, nil, nil, uuid.Nil, "", 24*time.Hour)
		err := svc.Register(RegisterRequest{
			TermsAccepted:   true,
			Password:        "Valid@592",
			PasswordConfirm: "Valid@592",
			CompanyID:       companyID,
			Email:           "test@test.com",
			FirstName:       "John",
			LastName:        "Doe",
		})
		assert.NoError(t, err)
		mockUser.AssertCalled(t, "Create", mock.Anything)
	})

	t.Run("Senha e confirmacao diferentes", func(t *testing.T) {
		svc := NewAuthService(nil, nil, nil, nil, uuid.Nil, "", 24*time.Hour)
		err := svc.Register(RegisterRequest{
			TermsAccepted:   true,
			Password:        "Valid@592",
			PasswordConfirm: "Mismatch@123",
		})
		assert.EqualError(t, err, "a senha e a confirmação devem ser iguais")
	})

	t.Run("Usuario ja cadastrado", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: domain.CompanyStatusActive}, nil)

		mockUser := new(MockUserRepository)
		mockUser.On("FindByEmailAndCompany", "existing@test.com", companyID).Return(&domain.User{Email: "existing@test.com"}, nil)

		svc := NewAuthService(mockUser, mockCompany, nil, nil, uuid.Nil, "", 24*time.Hour)
		err := svc.Register(RegisterRequest{
			TermsAccepted:   true,
			Password:        "Valid@592",
			PasswordConfirm: "Valid@592",
			CompanyID:       companyID,
			Email:           "existing@test.com",
		})
		assert.EqualError(t, err, "já existe um usuário com este e-mail na companhia")
	})
}

func TestAuthService_Login(t *testing.T) {
	companyID := uuid.New()
	
	t.Run("Usuário Bloqueado", func(t *testing.T) {
		mockUser := new(MockUserRepository)
		futureTime := time.Now().Add(10 * time.Minute)
		mockUser.On("FindByEmailAndCompany", "test@test.com", companyID).Return(&domain.User{
			LockedUntil: &futureTime,
		}, nil)

		svc := NewAuthService(mockUser, nil, nil, nil, uuid.Nil, "", 24*time.Hour)
		_, err := svc.Login("test@test.com", "any", companyID, false)
		assert.EqualError(t, err, "usuário bloqueado por excesso de tentativas. Tente novamente mais tarde")
	})
	
	t.Run("Falha de Credenciais (Atinge Bloqueio)", func(t *testing.T) {
		mockUser := new(MockUserRepository)
		user := &domain.User{
			Password:            "hash", // Senha real difere
			FailedLoginAttempts: 2,
		}
		mockUser.On("FindByEmailAndCompany", "test@test.com", companyID).Return(user, nil)
		mockUser.On("Update", mock.Anything).Return(nil)

		svc := NewAuthService(mockUser, nil, nil, nil, uuid.Nil, "", 24*time.Hour)
		_, err := svc.Login("test@test.com", "wrong", companyID, false)
		assert.EqualError(t, err, "credenciais inválidas")
		assert.Equal(t, 3, user.FailedLoginAttempts)
		assert.NotNil(t, user.LockedUntil)
	})

	t.Run("Login Sucesso", func(t *testing.T) {
		mockUser := new(MockUserRepository)
		passwordHash, _ := utils.HashPassword("ValidPassword@135")
		user := &domain.User{
			ID:        uuid.New(),
			CompanyID: companyID,
			Email:     "user@company.com",
			Password:  passwordHash,
		}
		mockUser.On("FindByEmailAndCompany", "user@company.com", companyID).Return(user, nil)

		svc := NewAuthService(mockUser, nil, nil, nil, uuid.Nil, "", 24*time.Hour)
		tokens, err := svc.Login("user@company.com", "ValidPassword@135", companyID, true)
		assert.NoError(t, err)
		assert.NotNil(t, tokens)
	})

	t.Run("Login Falha Credenciais - Nao Bloqueia Ainda", func(t *testing.T) {
		mockUser := new(MockUserRepository)
		user := &domain.User{
			Password:            "hash",
			FailedLoginAttempts: 0,
		}
		mockUser.On("FindByEmailAndCompany", "user@company.com", companyID).Return(user, nil)
		mockUser.On("Update", mock.Anything).Return(nil)

		svc := NewAuthService(mockUser, nil, nil, nil, uuid.Nil, "", 24*time.Hour)
		_, err := svc.Login("user@company.com", "wrong", companyID, false)
		assert.EqualError(t, err, "credenciais inválidas")
		assert.Equal(t, 1, user.FailedLoginAttempts)
	})
}

func TestAuthService_RecoverPassword(t *testing.T) {
	companyID := uuid.New()
	t.Run("Usuário inativo ou inexistente não envia", func(t *testing.T) {
		mockUser := new(MockUserRepository)
		mockUser.On("FindByEmailAndCompany", "test@test.com", companyID).Return(nil, errors.New("not found"))
		svc := NewAuthService(mockUser, nil, nil, nil, uuid.Nil, "", 24*time.Hour)
		err := svc.RecoverPassword("test@test.com", companyID)
		assert.NoError(t, err) // Sempre retorna nil para evitar enumeração
	})

	t.Run("Sucesso - envia recovery", func(t *testing.T) {
		mockUser := new(MockUserRepository)
		user := &domain.User{ID: uuid.New(), Status: domain.UserStatusActive, Email: "test@test.com"}
		mockUser.On("FindByEmailAndCompany", "test@test.com", companyID).Return(user, nil)
		mockUser.On("SaveRecoveryToken", mock.Anything).Return(nil)

		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Name: "Acme"}, nil)

		mockEmail := new(MockEmailService)
		mockEmail.On("SendPasswordRecoveryEmail", "test@test.com", "Acme", mock.Anything).Return(nil)

		svc := NewAuthService(mockUser, mockCompany, mockEmail, nil, uuid.Nil, "", 24*time.Hour)
		err := svc.RecoverPassword("test@test.com", companyID)
		assert.NoError(t, err)
	})
}

func TestAuthService_ResetPassword(t *testing.T) {
	t.Run("Senhas não conferem", func(t *testing.T) {
		svc := NewAuthService(nil, nil, nil, nil, uuid.Nil, "", 24*time.Hour)
		err := svc.ResetPassword("token123", "Valid@592", "Valid@999")
		assert.EqualError(t, err, "as senhas não conferem")
	})

	t.Run("Token Inválido ou expirado", func(t *testing.T) {
		mockUser := new(MockUserRepository)
		mockUser.On("FindRecoveryToken", "token123").Return(nil, errors.New("not found"))
		svc := NewAuthService(mockUser, nil, nil, nil, uuid.Nil, "", 24*time.Hour)
		err := svc.ResetPassword("token123", "Valid@592", "Valid@592")
		assert.EqualError(t, err, "token inválido ou expirado")
	})

	t.Run("Sucesso redefinição", func(t *testing.T) {
		mockUser := new(MockUserRepository)
		userID := uuid.New()
		tokenID := uuid.New()
		mockUser.On("FindRecoveryToken", "token123").Return(&domain.PasswordRecoveryToken{
			ID: tokenID, UserID: userID, ExpiresAt: time.Now().Add(time.Hour), Used: false,
		}, nil)
		mockUser.On("FindByID", userID).Return(&domain.User{
			FirstName: "Jane", LastName: "Doe", Email: "jane@doe.com",
		}, nil)
		mockUser.On("Update", mock.Anything).Return(nil)
		mockUser.On("MarkRecoveryTokenUsed", tokenID).Return(nil)

		svc := NewAuthService(mockUser, nil, nil, nil, uuid.Nil, "", 24*time.Hour)
		err := svc.ResetPassword("token123", "Valid@592", "Valid@592")
		assert.NoError(t, err)
	})

	t.Run("Token Expirado", func(t *testing.T) {
		mockUser := new(MockUserRepository)
		mockUser.On("FindRecoveryToken", "expired-token").Return(&domain.PasswordRecoveryToken{
			ExpiresAt: time.Now().Add(-5 * time.Minute), Used: false,
		}, nil)
		svc := NewAuthService(mockUser, nil, nil, nil, uuid.Nil, "", 24*time.Hour)
		err := svc.ResetPassword("expired-token", "Valid@592", "Valid@592")
		assert.EqualError(t, err, "token inválido ou expirado")
	})

	t.Run("Token Ja Usado", func(t *testing.T) {
		mockUser := new(MockUserRepository)
		mockUser.On("FindRecoveryToken", "used-token").Return(&domain.PasswordRecoveryToken{
			ExpiresAt: time.Now().Add(5 * time.Minute), Used: true,
		}, nil)
		svc := NewAuthService(mockUser, nil, nil, nil, uuid.Nil, "", 24*time.Hour)
		err := svc.ResetPassword("used-token", "Valid@592", "Valid@592")
		assert.EqualError(t, err, "token inválido ou expirado")
	})

	t.Run("Usuario Nao Encontrado", func(t *testing.T) {
		mockUser := new(MockUserRepository)
		userID := uuid.New()
		mockUser.On("FindRecoveryToken", "valid-token").Return(&domain.PasswordRecoveryToken{
			UserID: userID, ExpiresAt: time.Now().Add(5 * time.Minute), Used: false,
		}, nil)
		mockUser.On("FindByID", userID).Return(nil, errors.New("not found"))
		svc := NewAuthService(mockUser, nil, nil, nil, uuid.Nil, "", 24*time.Hour)
		err := svc.ResetPassword("valid-token", "Valid@592", "Valid@592")
		assert.EqualError(t, err, "usuário não encontrado")
	})
}

func TestAuthService_Logout(t *testing.T) {
	t.Run("Sucesso logout", func(t *testing.T) {
		mockBlacklist := new(MockBlacklistRepo)
		mockBlacklist.On("Add", mock.Anything, "tokenABC", 30*time.Minute).Return(nil)

		svc := NewAuthService(nil, nil, nil, mockBlacklist, uuid.Nil, "", 24*time.Hour)
		err := svc.Logout(context.Background(), "tokenABC")
		assert.NoError(t, err)
	})
}
