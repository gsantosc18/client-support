package postgres

import (
	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AnnotationRepository struct {
	db *gorm.DB
}

func NewAnnotationRepository(db *gorm.DB) *AnnotationRepository {
	return &AnnotationRepository{db: db}
}

func (r *AnnotationRepository) Create(annotation *domain.Annotation) error {
	if err := r.db.Create(annotation).Error; err != nil {
		return err
	}
	return r.db.Preload("User").First(annotation, "id = ?", annotation.ID).Error
}

func (r *AnnotationRepository) FindByID(id uuid.UUID) (*domain.Annotation, error) {
	var annotation domain.Annotation
	err := r.db.Preload("User").Where("id = ?", id).First(&annotation).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrAnnotationNotFound
		}
		return nil, err
	}
	return &annotation, nil
}

func (r *AnnotationRepository) FindAllByProcess(processID uuid.UUID, companyID uuid.UUID) ([]*domain.Annotation, error) {
	var annotations []*domain.Annotation
	err := r.db.Preload("User").Where("process_id = ? AND company_id = ?", processID, companyID).
		Order("created_at DESC").
		Find(&annotations).Error
	if err != nil {
		return nil, err
	}
	return annotations, nil
}

func (r *AnnotationRepository) Update(annotation *domain.Annotation) error {
	if err := r.db.Save(annotation).Error; err != nil {
		return err
	}
	return r.db.Preload("User").First(annotation, "id = ?", annotation.ID).Error
}

func (r *AnnotationRepository) Delete(id uuid.UUID) error {
	result := r.db.Delete(&domain.Annotation{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrAnnotationNotFound
	}
	return nil
}
