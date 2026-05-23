package http

import (
	"strconv"

	"github.com/client-support/backend/internal/domain"
	"github.com/client-support/backend/internal/service"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type EstablishmentHandler struct {
	estService *service.EstablishmentService
}

func NewEstablishmentHandler(estService *service.EstablishmentService) *EstablishmentHandler {
	return &EstablishmentHandler{estService: estService}
}

type CreateEstablishmentRequest struct {
	Name    string `json:"name"`
	Address string `json:"address"`
	City    string `json:"city"`
	State   string `json:"state"`
}

func (h *EstablishmentHandler) Create(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	var req CreateEstablishmentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "dados inválidos"})
	}

	est := &domain.Establishment{
		CompanyID: companyID,
		Name:      req.Name,
		Address:   req.Address,
		City:      req.City,
		State:     req.State,
	}

	if err := h.estService.Create(est); err != nil {
		if isConflictError(estServiceError(err)) {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "CONFLITO", "message": err.Error()})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(est)
}

func (h *EstablishmentHandler) List(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	search := c.Query("search")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	establishments, total, err := h.estService.FindAll(companyID, search, page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "erro ao buscar estabelecimentos"})
	}

	totalPages := (total + limit - 1) / limit

	return c.JSON(fiber.Map{
		"data": establishments,
		"pagination": fiber.Map{
			"current_page":  page,
			"limit":         limit,
			"total_records": total,
			"total_pages":   totalPages,
		},
	})
}

func estServiceError(err error) error {
	return err
}
