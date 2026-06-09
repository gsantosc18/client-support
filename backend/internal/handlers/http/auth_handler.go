package http

import (
	"strings"

	"github.com/client-support/backend/internal/service"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req service.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "dados inválidos"})
	}

	companyIDStr := c.Query("company_id")
	if companyIDStr != "" {
		companyID, err := uuid.Parse(companyIDStr)
		if err == nil {
			req.CompanyID = companyID
		}
	}

	if err := h.authService.Register(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "usuário cadastrado com sucesso"})
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req struct {
		Email          string `json:"email"`
		Password       string `json:"password"`
		KeepMeLoggedIn bool   `json:"keep_me_logged_in"`
		CompanyID      string `json:"company_id"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "dados inválidos"})
	}

	companyID, err := uuid.Parse(req.CompanyID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "company_id inválido"})
	}

	tokens, err := h.authService.Login(req.Email, req.Password, companyID, req.KeepMeLoggedIn)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(tokens)
}

func (h *AuthHandler) RecoverPassword(c *fiber.Ctx) error {
	var req struct {
		Email     string `json:"email"`
		CompanyID string `json:"company_id"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "dados inválidos"})
	}

	companyID, err := uuid.Parse(req.CompanyID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "company_id inválido"})
	}

	_ = h.authService.RecoverPassword(req.Email, companyID)
	// Always return success
	return c.JSON(fiber.Map{"message": "Se o e-mail estiver cadastrado e ativo, você receberá um link de recuperação."})
}

func (h *AuthHandler) ResetPassword(c *fiber.Ctx) error {
	var req struct {
		Token           string `json:"token"`
		Password        string `json:"password"`
		PasswordConfirm string `json:"password_confirm"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "dados inválidos"})
	}

	if err := h.authService.ResetPassword(req.Token, req.Password, req.PasswordConfirm); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "senha redefinida com sucesso"})
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	if err := h.authService.Logout(c.Context(), token); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "erro ao fazer logout"})
	}

	return c.JSON(fiber.Map{"message": "logout realizado com sucesso"})
}

func (h *AuthHandler) ValidateInvitation(c *fiber.Ctx) error {
	token := c.Query("token")
	if token == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "token não informado"})
	}

	invitation, err := h.authService.ValidateInvitation(token)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"valid":      true,
		"email":      invitation.Email,
		"company_id": invitation.CompanyID.String(),
	})
}

func (h *AuthHandler) CreateInvitation(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "não autorizado"})
	}

	var req struct {
		Email string `json:"email"`
	}
	if err := c.BodyParser(&req); err != nil || req.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "e-mail inválido"})
	}

	invitation, err := h.authService.CreateInvitation(req.Email, userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(invitation)
}
