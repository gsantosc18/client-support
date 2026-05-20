package http

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/client-support/backend/internal/domain"
	"github.com/client-support/backend/internal/service"
	"github.com/client-support/backend/pkg/utils"
	"github.com/gofiber/fiber/v2"
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

func setupTestApp() (*fiber.App, *MockUserRepository, *MockCompanyRepository, *MockBlacklistRepo, *MockEmailService) {
	app := fiber.New()
	mockUserRepo := new(MockUserRepository)
	mockCompanyRepo := new(MockCompanyRepository)
	mockBlacklistRepo := new(MockBlacklistRepo)
	mockEmailService := new(MockEmailService)

	authService := service.NewAuthService(mockUserRepo, mockCompanyRepo, mockEmailService, mockBlacklistRepo)
	handler := NewAuthHandler(authService)

	app.Post("/api/auth/register", handler.Register)
	app.Post("/api/auth/login", handler.Login)
	app.Post("/api/auth/recover", handler.RecoverPassword)
	app.Post("/api/auth/reset", handler.ResetPassword)
	app.Post("/api/auth/logout", handler.Logout)

	return app, mockUserRepo, mockCompanyRepo, mockBlacklistRepo, mockEmailService
}

func TestAuthHandler(t *testing.T) {
	companyID := uuid.New()
	company := &domain.Company{
		ID:        companyID,
		Name:      "Test Company",
		Status:    domain.CompanyStatusActive,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	t.Run("Register - Success", func(t *testing.T) {
		_, _, mockCompanyRepo, _, _ := setupTestApp()
		mockUserRepo := new(MockUserRepository)
		// Reset AuthService in Setup specifically for register mock injection
		mockCompanyRepo.On("FindByID", companyID).Return(company, nil).Once()
		mockUserRepo.On("FindByEmailAndCompany", "new@company.com", companyID).Return(nil, nil).Once()
		mockUserRepo.On("Create", mock.Anything).Return(nil).Once()

		authService := service.NewAuthService(mockUserRepo, mockCompanyRepo, new(MockEmailService), new(MockBlacklistRepo))
		handler := NewAuthHandler(authService)
		appRegister := fiber.New()
		appRegister.Post("/api/auth/register", handler.Register)

		body := map[string]interface{}{
			"first_name":     "John",
			"last_name":      "Doe",
			"email":          "new@company.com",
			"password":       "ValidPassword@135",
			"password_confirm": "ValidPassword@135",
			"phone":          "951357246",
			"terms_accepted": true,
		}
		jsonBody, _ := json.Marshal(body)

		req := httptest.NewRequest("POST", "/api/auth/register?company_id="+companyID.String(), bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := appRegister.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusCreated, resp.StatusCode)

		mockCompanyRepo.AssertExpectations(t)
		mockUserRepo.AssertExpectations(t)
	})

	t.Run("Register - Body Parse Error", func(t *testing.T) {
		app, _, _, _, _ := setupTestApp()
		req := httptest.NewRequest("POST", "/api/auth/register", bytes.NewBufferString("invalid json"))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Register - Service Error", func(t *testing.T) {
		app, mockUserRepo, mockCompanyRepo, _, _ := setupTestApp()
		mockCompanyRepo.On("FindByID", companyID).Return(nil, errors.New("not found")).Once()

		body := map[string]interface{}{
			"first_name":     "John",
			"last_name":      "Doe",
			"email":          "new@company.com",
			"password":       "ValidPassword@135",
			"password_confirm": "ValidPassword@135",
			"terms_accepted": true,
		}
		jsonBody, _ := json.Marshal(body)

		req := httptest.NewRequest("POST", "/api/auth/register?company_id="+companyID.String(), bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)

		mockCompanyRepo.AssertExpectations(t)
		mockUserRepo.AssertExpectations(t)
	})

	t.Run("Login - Success", func(t *testing.T) {
		app, mockUserRepo, _, _, _ := setupTestApp()
		passwordHash, _ := utils.HashPassword("ValidPassword@135")
		user := &domain.User{
			ID:        uuid.New(),
			CompanyID: companyID,
			FirstName: "Test",
			LastName:  "User",
			Email:     "user@company.com",
			Password:  passwordHash,
			Status:    domain.UserStatusActive,
		}

		mockUserRepo.On("FindByEmailAndCompany", "user@company.com", companyID).Return(user, nil).Once()

		body := map[string]interface{}{
			"email":             "user@company.com",
			"password":          "ValidPassword@135",
			"company_id":        companyID.String(),
			"keep_me_logged_in": true,
		}
		jsonBody, _ := json.Marshal(body)

		req := httptest.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		var responseTokens map[string]string
		json.NewDecoder(resp.Body).Decode(&responseTokens)
		assert.NotEmpty(t, responseTokens["access_token"])
		assert.NotEmpty(t, responseTokens["refresh_token"])

		mockUserRepo.AssertExpectations(t)
	})

	t.Run("Login - Invalid JSON", func(t *testing.T) {
		app, _, _, _, _ := setupTestApp()
		req := httptest.NewRequest("POST", "/api/auth/login", bytes.NewBufferString("invalid"))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Login - Invalid Company ID", func(t *testing.T) {
		app, _, _, _, _ := setupTestApp()
		body := map[string]interface{}{
			"email":      "user@company.com",
			"password":   "ValidPassword@135",
			"company_id": "invalid-uuid",
		}
		jsonBody, _ := json.Marshal(body)

		req := httptest.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Login - Service Error (Unauthorized)", func(t *testing.T) {
		app, mockUserRepo, _, _, _ := setupTestApp()
		mockUserRepo.On("FindByEmailAndCompany", "user@company.com", companyID).Return(nil, errors.New("user not found")).Once()

		body := map[string]interface{}{
			"email":      "user@company.com",
			"password":   "ValidPassword@135",
			"company_id": companyID.String(),
		}
		jsonBody, _ := json.Marshal(body)

		req := httptest.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)

		mockUserRepo.AssertExpectations(t)
	})

	t.Run("RecoverPassword - Success", func(t *testing.T) {
		app, mockUserRepo, _, _, _ := setupTestApp()
		mockUserRepo.On("FindByEmailAndCompany", "user@company.com", companyID).Return(nil, errors.New("always returns success to prevent enumeration")).Once()

		body := map[string]interface{}{
			"email":      "user@company.com",
			"company_id": companyID.String(),
		}
		jsonBody, _ := json.Marshal(body)

		req := httptest.NewRequest("POST", "/api/auth/recover", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		mockUserRepo.AssertExpectations(t)
	})

	t.Run("RecoverPassword - Invalid JSON", func(t *testing.T) {
		app, _, _, _, _ := setupTestApp()
		req := httptest.NewRequest("POST", "/api/auth/recover", bytes.NewBufferString("invalid"))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("RecoverPassword - Invalid Company ID", func(t *testing.T) {
		app, _, _, _, _ := setupTestApp()
		body := map[string]interface{}{
			"email":      "user@company.com",
			"company_id": "invalid-uuid",
		}
		jsonBody, _ := json.Marshal(body)

		req := httptest.NewRequest("POST", "/api/auth/recover", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("ResetPassword - Success", func(t *testing.T) {
		app, mockUserRepo, _, _, _ := setupTestApp()
		user := &domain.User{
			ID:        uuid.New(),
			CompanyID: companyID,
			FirstName: "John",
			LastName:  "Doe",
			Email:     "user@company.com",
		}
		recToken := &domain.PasswordRecoveryToken{
			ID:        uuid.New(),
			UserID:    user.ID,
			Token:     "recovery-token",
			ExpiresAt: time.Now().Add(1 * time.Hour),
			Used:      false,
		}

		mockUserRepo.On("FindRecoveryToken", "recovery-token").Return(recToken, nil).Once()
		mockUserRepo.On("FindByID", user.ID).Return(user, nil).Once()
		mockUserRepo.On("Update", mock.Anything).Return(nil).Once()
		mockUserRepo.On("MarkRecoveryTokenUsed", recToken.ID).Return(nil).Once()

		body := map[string]interface{}{
			"token":            "recovery-token",
			"password":         "NewValidPassword@951",
			"password_confirm": "NewValidPassword@951",
		}
		jsonBody, _ := json.Marshal(body)

		req := httptest.NewRequest("POST", "/api/auth/reset", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		mockUserRepo.AssertExpectations(t)
	})

	t.Run("ResetPassword - Invalid JSON", func(t *testing.T) {
		app, _, _, _, _ := setupTestApp()
		req := httptest.NewRequest("POST", "/api/auth/reset", bytes.NewBufferString("invalid"))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("ResetPassword - Validation Error", func(t *testing.T) {
		app, _, _, _, _ := setupTestApp()
		body := map[string]interface{}{
			"token":            "recovery-token",
			"password":         "NewValidPassword@951",
			"password_confirm": "MismatchingPassword@123",
		}
		jsonBody, _ := json.Marshal(body)

		req := httptest.NewRequest("POST", "/api/auth/reset", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)
	})

	t.Run("Logout - Success", func(t *testing.T) {
		app, _, _, mockBlacklistRepo, _ := setupTestApp()
		userID := uuid.New()
		pair, err := utils.GenerateTokenPair(userID, companyID, false)
		assert.NoError(t, err)

		mockBlacklistRepo.On("Add", mock.Anything, pair.AccessToken, mock.Anything).Return(nil).Once()

		req := httptest.NewRequest("POST", "/api/auth/logout", nil)
		req.Header.Set("Authorization", "Bearer "+pair.AccessToken)
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		mockBlacklistRepo.AssertExpectations(t)
	})

	t.Run("Logout - Missing Token", func(t *testing.T) {
		app, _, _, _, _ := setupTestApp()
		req := httptest.NewRequest("POST", "/api/auth/logout", nil)
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("Logout - Service Error", func(t *testing.T) {
		app, _, _, mockBlacklistRepo, _ := setupTestApp()
		userID := uuid.New()
		pair, err := utils.GenerateTokenPair(userID, companyID, false)
		assert.NoError(t, err)

		mockBlacklistRepo.On("Add", mock.Anything, pair.AccessToken, mock.Anything).Return(errors.New("redis err")).Once()

		req := httptest.NewRequest("POST", "/api/auth/logout", nil)
		req.Header.Set("Authorization", "Bearer "+pair.AccessToken)
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)

		mockBlacklistRepo.AssertExpectations(t)
	})
}
