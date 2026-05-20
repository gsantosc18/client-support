package middleware

import (
	"context"
	"strings"

	"github.com/client-support/backend/pkg/utils"
	"github.com/gofiber/fiber/v2"
)

func Protected(blacklistRepo interface {
	IsBlacklisted(ctx context.Context, token string) (bool, error)
}) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Token ausente ou mal formatado"})
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Verifica se o token está na blacklist (logout)
		isBlacklisted, err := blacklistRepo.IsBlacklisted(c.Context(), tokenString)
		if err != nil || isBlacklisted {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Token expirado ou inválido"})
		}

		claims, err := utils.ValidateToken(tokenString)
		if err != nil || claims.TokenType != "access" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Token inválido ou expirado"})
		}

		c.Locals("user_id", claims.UserID)
		c.Locals("company_id", claims.CompanyID)

		return c.Next()
	}
}
