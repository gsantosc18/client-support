package service

import (
	"errors"
	"fmt"
	"io"
	"path/filepath"
	"strings"
	"time"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
)

type DocumentService struct {
	docRepo     domain.DocumentRepository
	storage     domain.FileStorage
	processRepo domain.ProcessRepository
}

func NewDocumentService(docRepo domain.DocumentRepository, storage domain.FileStorage, processRepo domain.ProcessRepository) *DocumentService {
	return &DocumentService{
		docRepo:     docRepo,
		storage:     storage,
		processRepo: processRepo,
	}
}

func (s *DocumentService) Create(
	name string,
	description string,
	file io.Reader,
	size int64,
	fileName string,
	processID uuid.UUID,
	companyID uuid.UUID,
	userID uuid.UUID,
) (*domain.Document, error) {
	proc, err := s.processRepo.FindByIDAndCompany(processID, companyID)
	if err != nil || proc == nil {
		return nil, errors.New("processo não encontrado ou não pertence a esta empresa")
	}

	name = strings.TrimSpace(name)
	if name == "" {
		return nil, domain.ErrDocumentInvalidName
	}
	if len(name) > 255 {
		return nil, errors.New("o nome do documento não pode exceder 255 caracteres")
	}

	const maxLimit = 10 * 1024 * 1024
	if size > maxLimit {
		return nil, domain.ErrDocumentTooLarge
	}

	ext := strings.ToLower(filepath.Ext(fileName))
	allowed := map[string]bool{
		".pdf":  true,
		".png":  true,
		".jpg":  true,
		".jpeg": true,
		".docx": true,
		".xlsx": true,
	}
	if !allowed[ext] {
		return nil, domain.ErrDocumentInvalidType
	}

	contentType := "application/octet-stream"
	switch ext {
	case ".pdf":
		contentType = "application/pdf"
	case ".png":
		contentType = "image/png"
	case ".jpg", ".jpeg":
		contentType = "image/jpeg"
	case ".docx":
		contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	case ".xlsx":
		contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	}

	docID := uuid.New()
	uniqueFileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	filePathKey := fmt.Sprintf("%s/%s/%s/%s", companyID.String(), processID.String(), docID.String(), uniqueFileName)

	if err := s.storage.Upload(filePathKey, file, size, contentType); err != nil {
		return nil, err
	}

	doc := &domain.Document{
		ID:          docID,
		Name:        name,
		Description: description,
		FilePath:    filePathKey,
		FileType:    contentType,
		FileSize:    size,
		UserID:      userID,
		ProcessID:   processID,
		CompanyID:   companyID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := s.docRepo.Create(doc); err != nil {
		_ = s.storage.TagAsDeleted(filePathKey)
		return nil, err
	}

	return doc, nil
}

func (s *DocumentService) FindAllByProcess(processID uuid.UUID, companyID uuid.UUID) ([]*domain.Document, error) {
	proc, err := s.processRepo.FindByIDAndCompany(processID, companyID)
	if err != nil || proc == nil {
		return nil, errors.New("processo não encontrado ou não pertence a esta empresa")
	}

	return s.docRepo.FindAllByProcess(processID, companyID)
}

func (s *DocumentService) FindByID(id uuid.UUID, companyID uuid.UUID) (*domain.Document, error) {
	doc, err := s.docRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if doc.CompanyID != companyID {
		return nil, errors.New("não autorizado a acessar este documento")
	}

	return doc, nil
}

func (s *DocumentService) Download(id uuid.UUID, companyID uuid.UUID) (io.ReadCloser, *domain.Document, error) {
	doc, err := s.FindByID(id, companyID)
	if err != nil {
		return nil, nil, err
	}

	reader, err := s.storage.Download(doc.FilePath)
	if err != nil {
		return nil, nil, err
	}

	return reader, doc, nil
}

func (s *DocumentService) Update(
	id uuid.UUID,
	name string,
	description string,
	file io.Reader,
	size int64,
	fileName string,
	companyID uuid.UUID,
	userID uuid.UUID,
) (*domain.Document, error) {
	doc, err := s.FindByID(id, companyID)
	if err != nil {
		return nil, err
	}

	name = strings.TrimSpace(name)
	if name == "" {
		return nil, domain.ErrDocumentInvalidName
	}
	if len(name) > 255 {
		return nil, errors.New("o nome do documento não pode exceder 255 caracteres")
	}

	doc.Name = name
	doc.Description = description
	doc.UpdatedAt = time.Now()

	if file != nil {
		const maxLimit = 10 * 1024 * 1024
		if size > maxLimit {
			return nil, domain.ErrDocumentTooLarge
		}

		ext := strings.ToLower(filepath.Ext(fileName))
		allowed := map[string]bool{
			".pdf":  true,
			".png":  true,
			".jpg":  true,
			".jpeg": true,
			".docx": true,
			".xlsx": true,
		}
		if !allowed[ext] {
			return nil, domain.ErrDocumentInvalidType
		}

		contentType := "application/octet-stream"
		switch ext {
		case ".pdf":
			contentType = "application/pdf"
		case ".png":
			contentType = "image/png"
		case ".jpg", ".jpeg":
			contentType = "image/jpeg"
		case ".docx":
			contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
		case ".xlsx":
			contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		}

		oldFilePathKey := doc.FilePath
		uniqueFileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
		newFilePathKey := fmt.Sprintf("%s/%s/%s/%s", companyID.String(), doc.ProcessID.String(), doc.ID.String(), uniqueFileName)

		if err := s.storage.Upload(newFilePathKey, file, size, contentType); err != nil {
			return nil, err
		}

		_ = s.storage.TagAsDeleted(oldFilePathKey)

		doc.FilePath = newFilePathKey
		doc.FileType = contentType
		doc.FileSize = size
	}

	if err := s.docRepo.Update(doc); err != nil {
		return nil, err
	}

	return doc, nil
}

func (s *DocumentService) Delete(id uuid.UUID, companyID uuid.UUID) error {
	doc, err := s.FindByID(id, companyID)
	if err != nil {
		return err
	}

	trashPathKey := fmt.Sprintf("trash/%s", doc.FilePath)

	if err := s.storage.MoveToTrash(doc.FilePath, trashPathKey); err != nil {
		return err
	}

	return s.docRepo.Delete(id)
}
