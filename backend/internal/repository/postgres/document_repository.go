package postgres

import (
	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DocumentRepository struct {
	db *gorm.DB
}

func NewDocumentRepository(db *gorm.DB) *DocumentRepository {
	return &DocumentRepository{db: db}
}

func (r *DocumentRepository) Create(document *domain.Document) error {
	return r.db.Create(document).Error
}

func (r *DocumentRepository) FindByID(id uuid.UUID) (*domain.Document, error) {
	var document domain.Document
	err := r.db.Where("id = ?", id).First(&document).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrDocumentNotFound
		}
		return nil, err
	}
	return &document, nil
}

func (r *DocumentRepository) FindAllByProcess(processID uuid.UUID, companyID uuid.UUID) ([]*domain.Document, error) {
	var documents []*domain.Document
	err := r.db.Where("process_id = ? AND company_id = ?", processID, companyID).
		Order("created_at DESC").
		Find(&documents).Error
	if err != nil {
		return nil, err
	}
	return documents, nil
}

func (r *DocumentRepository) Update(document *domain.Document) error {
	return r.db.Save(document).Error
}

func (r *DocumentRepository) Delete(id uuid.UUID) error {
	result := r.db.Delete(&domain.Document{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrDocumentNotFound
	}
	return nil
}
