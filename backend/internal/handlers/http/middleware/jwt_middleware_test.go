package middleware

import (
	"context"
	"errors"
	"net/http/httptest"
	"testing"

	"github.com/client-support/backend/pkg/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockBlacklistRepository struct {
	mock.Mock
}

func (m *MockBlacklistRepository) IsBlacklisted(ctx context.Context, token string) (bool, error) {
	args := m.Called(ctx, token)
	return args.Bool(0), args.Error(1)
}

func TestProtectedMiddleware(t *testing.T) {
	t.Run("Missing Authorization Header", func(t *testing.T) {
		app := fiber.New()
		mockBlacklist := new(MockBlacklistRepository)
		app.Get("/protected", Protected(mockBlacklist), func(c *fiber.Ctx) error {
			return c.SendStatus(fiber.StatusOK)
		})

		req := httptest.NewRequest("GET", "/protected", nil)
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("Malformed Authorization Header", func(t *testing.T) {
		app := fiber.New()
		mockBlacklist := new(MockBlacklistRepository)
		app.Get("/protected", Protected(mockBlacklist), func(c *fiber.Ctx) error {
			return c.SendStatus(fiber.StatusOK)
		})

		req := httptest.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "InvalidFormat token")
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("Blacklisted Token", func(t *testing.T) {
		app := fiber.New()
		mockBlacklist := new(MockBlacklistRepository)
		app.Get("/protected", Protected(mockBlacklist), func(c *fiber.Ctx) error {
			return c.SendStatus(fiber.StatusOK)
		})

		token := "some-token"
		mockBlacklist.On("IsBlacklisted", mock.Anything, token).Return(true, nil).Once()

		req := httptest.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)
		mockBlacklist.AssertExpectations(t)
	})

	t.Run("Blacklist Error", func(t *testing.T) {
		app := fiber.New()
		mockBlacklist := new(MockBlacklistRepository)
		app.Get("/protected", Protected(mockBlacklist), func(c *fiber.Ctx) error {
			return c.SendStatus(fiber.StatusOK)
		})

		token := "some-token"
		mockBlacklist.On("IsBlacklisted", mock.Anything, token).Return(false, errors.New("redis error")).Once()

		req := httptest.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)
		mockBlacklist.AssertExpectations(t)
	})

	t.Run("Invalid JWT Token Signature/Format", func(t *testing.T) {
		app := fiber.New()
		mockBlacklist := new(MockBlacklistRepository)
		app.Get("/protected", Protected(mockBlacklist), func(c *fiber.Ctx) error {
			return c.SendStatus(fiber.StatusOK)
		})

		mockBlacklist.On("IsBlacklisted", mock.Anything, "invalid-jwt").Return(false, nil).Once()

		req := httptest.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer invalid-jwt")
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)
		mockBlacklist.AssertExpectations(t)
	})

	t.Run("Valid JWT Token", func(t *testing.T) {
		app := fiber.New()
		mockBlacklist := new(MockBlacklistRepository)
		app.Get("/protected", Protected(mockBlacklist), func(c *fiber.Ctx) error {
			userID := c.Locals("user_id").(uuid.UUID)
			companyID := c.Locals("company_id").(uuid.UUID)
			return c.Status(fiber.StatusOK).JSON(fiber.Map{
				"user_id":    userID.String(),
				"company_id": companyID.String(),
			})
		})

		userID := uuid.New()
		companyID := uuid.New()
		pair, err := utils.GenerateTokenPair(userID, companyID, false)
		assert.NoError(t, err)

		mockBlacklist.On("IsBlacklisted", mock.Anything, pair.AccessToken).Return(false, nil).Once()

		req := httptest.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+pair.AccessToken)
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, resp.StatusCode)
		mockBlacklist.AssertExpectations(t)
	})

	t.Run("Wrong Token Type (Refresh Token instead of Access)", func(t *testing.T) {
		app := fiber.New()
		mockBlacklist := new(MockBlacklistRepository)
		app.Get("/protected", Protected(mockBlacklist), func(c *fiber.Ctx) error {
			return c.SendStatus(fiber.StatusOK)
		})

		userID := uuid.New()
		companyID := uuid.New()
		pair, err := utils.GenerateTokenPair(userID, companyID, false)
		assert.NoError(t, err)

		mockBlacklist.On("IsBlacklisted", mock.Anything, pair.RefreshToken).Return(false, nil).Once()

		req := httptest.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+pair.RefreshToken)
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusUnauthorized, resp.StatusCode)
		mockBlacklist.AssertExpectations(t)
	})
}
