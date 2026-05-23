package http

import (
	"github.com/client-support/backend/internal/domain"
	"github.com/client-support/backend/internal/service"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type AnnotationHandler struct {
	annoService *service.AnnotationService
}

func NewAnnotationHandler(annoService *service.AnnotationService) *AnnotationHandler {
	return &AnnotationHandler{annoService: annoService}
}

type CreateAnnotationRequest struct {
	Annotation string `json:"annotation"`
	Visibility string `json:"visibility"`
}

func (h *AnnotationHandler) Create(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	processID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "process_id inválido"})
	}

	var req CreateAnnotationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "dados inválidos"})
	}

	annotation := &domain.Annotation{
		ProcessID:  processID,
		CompanyID:  companyID,
		UserID:     userID,
		Annotation: req.Annotation,
		Visibility: domain.AnnotationVisibility(req.Visibility),
	}

	if err := h.annoService.Create(annotation); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(annotation)
}

func (h *AnnotationHandler) List(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	processID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "process_id inválido"})
	}

	annotations, err := h.annoService.FindAllByProcess(processID, companyID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
	}

	return c.JSON(annotations)
}

type UpdateAnnotationRequest struct {
	Annotation string `json:"annotation"`
}

func (h *AnnotationHandler) Update(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	annotationID, err := uuid.Parse(c.Params("annotation_id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "annotation_id inválido"})
	}

	var req UpdateAnnotationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "dados inválidos"})
	}

	annotation, err := h.annoService.Update(annotationID, req.Annotation, userID, companyID)
	if err != nil {
		if err == domain.ErrAnnotationNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "NOT_FOUND", "message": err.Error()})
		}
		if err == domain.ErrAnnotationNotOwner {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "FORBIDDEN", "message": err.Error()})
		}
		if err == domain.ErrAnnotationModificationWindowExpired {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
	}

	return c.JSON(annotation)
}

func (h *AnnotationHandler) Delete(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	annotationID, err := uuid.Parse(c.Params("annotation_id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "annotation_id inválido"})
	}

	err = h.annoService.Delete(annotationID, userID, companyID)
	if err != nil {
		if err == domain.ErrAnnotationNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "NOT_FOUND", "message": err.Error()})
		}
		if err == domain.ErrAnnotationNotOwner {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "FORBIDDEN", "message": err.Error()})
		}
		if err == domain.ErrAnnotationModificationWindowExpired {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Anotação excluída com sucesso.", "id": annotationID})
}
