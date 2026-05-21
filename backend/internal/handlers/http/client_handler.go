package http

import (
	"strconv"
	"strings"
	"time"

	"github.com/client-support/backend/internal/domain"
	"github.com/client-support/backend/internal/service"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type ClientHandler struct {
	clientService *service.ClientService
}

func NewClientHandler(clientService *service.ClientService) *ClientHandler {
	return &ClientHandler{clientService: clientService}
}

type CreateClientRequest struct {
	FullName  string  `json:"full_name"`
	Email     *string `json:"email"`
	Phone     *string `json:"phone"`
	BirthDate *string `json:"birth_date"` // Recebido como string YYYY-MM-DD
	CPF       *string `json:"cpf"`
	RG        *string `json:"rg"`
	CNH       *string `json:"cnh"`
	Status    *string `json:"status"`
}

func (h *ClientHandler) Create(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado: company_id ausente"})
	}

	var req CreateClientRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "dados inválidos"})
	}

	// Sanitizar strings vazias para nil
	email := sanitizeOptionalString(req.Email)
	phone := sanitizeOptionalString(req.Phone)
	cpf := sanitizeOptionalString(req.CPF)
	rg := sanitizeOptionalString(req.RG)
	cnh := sanitizeOptionalString(req.CNH)

	var birthDate *time.Time
	if req.BirthDate != nil && *req.BirthDate != "" {
		t, err := time.Parse("2006-01-02", *req.BirthDate)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "birth_date deve estar no formato YYYY-MM-DD"})
		}
		birthDate = &t
	}

	client := &domain.Client{
		CompanyID: companyID,
		FullName:  req.FullName,
		Email:     email,
		Phone:     phone,
		BirthDate: birthDate,
		CPF:       cpf,
		RG:        rg,
		CNH:       cnh,
	}

	if err := h.clientService.Create(client); err != nil {
		if isConflictError(err) {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "CONFLITO", "message": err.Error()})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(client)
}

func (h *ClientHandler) List(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	search := c.Query("search")
	status := c.Query("status")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	clients, total, err := h.clientService.FindAll(companyID, search, status, page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "erro ao buscar clientes"})
	}

	totalPages := (total + limit - 1) / limit

	return c.JSON(fiber.Map{
		"data": clients,
		"pagination": fiber.Map{
			"current_page":  page,
			"limit":         limit,
			"total_records": total,
			"total_pages":   totalPages,
		},
	})
}

func (h *ClientHandler) GetByID(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID inválido"})
	}

	client, err := h.clientService.FindByIDAndCompany(id, companyID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "cliente não encontrado"})
	}

	return c.JSON(client)
}

func (h *ClientHandler) Update(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID inválido"})
	}

	var req CreateClientRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "dados inválidos"})
	}

	email := sanitizeOptionalString(req.Email)
	phone := sanitizeOptionalString(req.Phone)
	cpf := sanitizeOptionalString(req.CPF)
	rg := sanitizeOptionalString(req.RG)
	cnh := sanitizeOptionalString(req.CNH)

	var birthDate *time.Time
	if req.BirthDate != nil && *req.BirthDate != "" {
		t, err := time.Parse("2006-01-02", *req.BirthDate)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "birth_date deve estar no formato YYYY-MM-DD"})
		}
		birthDate = &t
	}

	client := &domain.Client{
		ID:        id,
		CompanyID: companyID,
		FullName:  req.FullName,
		Email:     email,
		Phone:     phone,
		BirthDate: birthDate,
		CPF:       cpf,
		RG:        rg,
		CNH:       cnh,
	}

	if req.Status != nil && *req.Status != "" {
		client.Status = domain.ClientStatus(*req.Status)
	}

	if err := h.clientService.Update(client); err != nil {
		if isConflictError(err) {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "CONFLITO", "message": err.Error()})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
	}

	return c.JSON(client)
}

func (h *ClientHandler) Delete(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID inválido"})
	}

	if err := h.clientService.Delete(id, companyID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Cliente excluído e arquivado com sucesso.", "id": id})
}

func sanitizeOptionalString(s *string) *string {
	if s == nil || *s == "" {
		return nil
	}
	return s
}

func isConflictError(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "já está cadastrado") ||
		strings.Contains(msg, "unique") ||
		strings.Contains(msg, "conflito")
}
