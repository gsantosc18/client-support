package http

import (
	"io"

	"github.com/client-support/backend/internal/domain"
	"github.com/client-support/backend/internal/service"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type DocumentHandler struct {
	docService *service.DocumentService
}

func NewDocumentHandler(docService *service.DocumentService) *DocumentHandler {
	return &DocumentHandler{docService: docService}
}

func (h *DocumentHandler) Upload(c *fiber.Ctx) error {
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

	name := c.FormValue("name")
	description := c.FormValue("description")

	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "arquivo é obrigatório para upload"})
	}

	fileReader, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "falha ao ler o arquivo"})
	}
	defer fileReader.Close()

	doc, err := h.docService.Create(
		name,
		description,
		fileReader,
		fileHeader.Size,
		fileHeader.Filename,
		processID,
		companyID,
		userID,
	)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(doc)
}

func (h *DocumentHandler) List(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	processID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "process_id inválido"})
	}

	docs, err := h.docService.FindAllByProcess(processID, companyID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
	}

	return c.JSON(docs)
}

func (h *DocumentHandler) Download(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	docID, err := uuid.Parse(c.Params("document_id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "document_id inválido"})
	}

	reader, doc, err := h.docService.Download(docID, companyID)
	if err != nil {
		if err == domain.ErrDocumentNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "NOT_FOUND", "message": err.Error()})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
	}
	defer reader.Close()

	bodyBytes, err := io.ReadAll(reader)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "INTERNAL_SERVER_ERROR", "message": "falha ao ler o arquivo"})
	}

	c.Set("Content-Disposition", "attachment; filename="+doc.Name)
	c.Set("Content-Type", doc.FileType)

	return c.Send(bodyBytes)
}

func (h *DocumentHandler) Update(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	docID, err := uuid.Parse(c.Params("document_id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "document_id inválido"})
	}

	name := c.FormValue("name")
	description := c.FormValue("description")

	var fileReader io.ReadCloser
	var fileSize int64
	var fileName string

	fileHeader, err := c.FormFile("file")
	if err == nil && fileHeader != nil {
		fileReader, err = fileHeader.Open()
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "falha ao ler o arquivo"})
		}
		defer fileReader.Close()
		fileSize = fileHeader.Size
		fileName = fileHeader.Filename
	}

	doc, err := h.docService.Update(
		docID,
		name,
		description,
		fileReader,
		fileSize,
		fileName,
		companyID,
		userID,
	)
	if err != nil {
		if err == domain.ErrDocumentNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "NOT_FOUND", "message": err.Error()})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
	}

	return c.JSON(doc)
}

func (h *DocumentHandler) Delete(c *fiber.Ctx) error {
	companyID, ok := c.Locals("company_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Não autorizado"})
	}

	docID, err := uuid.Parse(c.Params("document_id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "document_id inválido"})
	}

	err = h.docService.Delete(docID, companyID)
	if err != nil {
		if err == domain.ErrDocumentNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "NOT_FOUND", "message": err.Error()})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "BAD_REQUEST", "message": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Documento excluído com sucesso", "id": docID})
}
