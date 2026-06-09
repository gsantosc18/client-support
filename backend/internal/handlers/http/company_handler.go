package http

import (
	"github.com/client-support/backend/internal/service"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type CompanyHandler struct {
	companyService *service.CompanyService
}

func NewCompanyHandler(companyService *service.CompanyService) *CompanyHandler {
	return &CompanyHandler{
		companyService: companyService,
	}
}

func (h *CompanyHandler) GetCompany(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado: company_id ausente"})
	}

	company, err := h.companyService.FindByID(companyID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Empresa não encontrada"})
	}

	return c.JSON(company)
}
