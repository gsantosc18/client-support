package http

import (
	"strconv"

	"github.com/client-support/backend/internal/domain"
	"github.com/client-support/backend/internal/service"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type ProcessHandler struct {
	processService *service.ProcessService
}

func NewProcessHandler(processService *service.ProcessService) *ProcessHandler {
	return &ProcessHandler{processService: processService}
}

type CreateProcessRequest struct {
	ClientIDs       []string `json:"client_ids"`
	UserID          string   `json:"user_id"`
	EstablishmentID string   `json:"establishment_id"`
	Protocol        *string  `json:"protocol"`
	Observation     *string  `json:"observation"`
}

func (h *ProcessHandler) Create(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	var req CreateProcessRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "dados inválidos"})
	}

	if len(req.ClientIDs) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "pelo menos um client_id é obrigatório"})
	}

	var clientUUIDs []uuid.UUID
	for _, cidStr := range req.ClientIDs {
		cid, err := uuid.Parse(cidStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "client_id inválido: " + cidStr})
		}
		clientUUIDs = append(clientUUIDs, cid)
	}

	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "user_id inválido"})
	}

	estID, err := uuid.Parse(req.EstablishmentID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "establishment_id inválido"})
	}

	protocol := sanitizeOptionalString(req.Protocol)
	observation := sanitizeOptionalString(req.Observation)

	process := &domain.Process{
		CompanyID:       companyID,
		UserID:          userID,
		EstablishmentID: estID,
		Protocol:        protocol,
		Observation:     observation,
	}

	if err := h.processService.Create(process, clientUUIDs); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
	}

	// Carrega dados completos para retorno
	fullProcess, err := h.processService.FindByIDAndCompany(process.ID, companyID)
	if err == nil {
		return c.Status(fiber.StatusCreated).JSON(fullProcess)
	}

	return c.Status(fiber.StatusCreated).JSON(process)
}

func (h *ProcessHandler) List(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	status := c.Query("status")
	protocol := c.Query("protocol")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	var clientID *uuid.UUID
	if cidStr := c.Query("client_id"); cidStr != "" {
		if cid, err := uuid.Parse(cidStr); err == nil {
			clientID = &cid
		}
	}

	var userID *uuid.UUID
	if uidStr := c.Query("user_id"); uidStr != "" {
		if uid, err := uuid.Parse(uidStr); err == nil {
			userID = &uid
		}
	}

	processes, total, err := h.processService.FindAll(companyID, clientID, userID, status, protocol, page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "erro ao buscar processos"})
	}

	totalPages := (total + limit - 1) / limit

	return c.JSON(fiber.Map{
		"data": processes,
		"pagination": fiber.Map{
			"current_page":  page,
			"limit":         limit,
			"total_records": total,
			"total_pages":   totalPages,
		},
	})
}

func (h *ProcessHandler) GetByID(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID inválido"})
	}

	process, err := h.processService.FindByIDAndCompany(id, companyID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "processo não encontrado"})
	}

	return c.JSON(process)
}

func (h *ProcessHandler) Update(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID inválido"})
	}

	var req CreateProcessRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "dados inválidos"})
	}

	if len(req.ClientIDs) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "pelo menos um client_id é obrigatório"})
	}

	var clientUUIDs []uuid.UUID
	for _, cidStr := range req.ClientIDs {
		cid, err := uuid.Parse(cidStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "client_id inválido: " + cidStr})
		}
		clientUUIDs = append(clientUUIDs, cid)
	}

	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "user_id inválido"})
	}

	estID, err := uuid.Parse(req.EstablishmentID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "establishment_id inválido"})
	}

	protocol := sanitizeOptionalString(req.Protocol)
	observation := sanitizeOptionalString(req.Observation)

	process := &domain.Process{
		ID:              id,
		CompanyID:       companyID,
		UserID:          userID,
		EstablishmentID: estID,
		Protocol:        protocol,
		Observation:     observation,
	}

	if err := h.processService.Update(process, clientUUIDs); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
	}

	// Retorna completo
	fullProcess, err := h.processService.FindByIDAndCompany(id, companyID)
	if err == nil {
		return c.JSON(fullProcess)
	}

	return c.JSON(process)
}

func (h *ProcessHandler) UpdateStatus(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID inválido"})
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "dados inválidos"})
	}

	status := domain.ProcessStatus(req.Status)
	if err := h.processService.UpdateStatus(id, companyID, status); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
	}

	fullProcess, err := h.processService.FindByIDAndCompany(id, companyID)
	if err == nil {
		return c.JSON(fullProcess)
	}

	return c.JSON(fiber.Map{"message": "status atualizado com sucesso", "id": id, "status": status})
}

func (h *ProcessHandler) Delete(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID inválido"})
	}

	if err := h.processService.Delete(id, companyID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Processo excluído com sucesso.", "id": id})
}
