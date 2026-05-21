package postgres

import (
	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProcessRepository struct {
	db *gorm.DB
}

func NewProcessRepository(db *gorm.DB) *ProcessRepository {
	return &ProcessRepository{db: db}
}

func (r *ProcessRepository) Create(process *domain.Process) error {
	return r.db.Create(process).Error
}

func (r *ProcessRepository) FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*domain.Process, error) {
	var process domain.Process
	err := r.db.Preload("Client").Preload("User").Where("id = ? AND company_id = ?", id, companyID).First(&process).Error
	if err != nil {
		return nil, err
	}
	return &process, nil
}

func (r *ProcessRepository) FindAll(companyID uuid.UUID, clientID *uuid.UUID, userID *uuid.UUID, status string, externalID string, page int, limit int) ([]*domain.Process, int, error) {
	var processes []*domain.Process
	var total int64

	query := r.db.Model(&domain.Process{}).Where("company_id = ?", companyID)

	if clientID != nil {
		query = query.Where("client_id = ?", *clientID)
	}

	if userID != nil {
		query = query.Where("user_id = ?", *userID)
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if externalID != "" {
		query = query.Where("external_id = ?", externalID)
	}

	// Contagem total
	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Paginação e Preload
	offset := (page - 1) * limit
	err = query.Preload("Client").Preload("User").Limit(limit).Offset(offset).Order("created_at DESC").Find(&processes).Error
	if err != nil {
		return nil, 0, err
	}

	return processes, int(total), nil
}

func (r *ProcessRepository) Update(process *domain.Process) error {
	return r.db.Save(process).Error
}

func (r *ProcessRepository) ExistsExternalIDInCompany(externalID string, companyID uuid.UUID, excludeID *uuid.UUID) (bool, error) {
	if externalID == "" {
		return false, nil
	}

	var count int64
	query := r.db.Model(&domain.Process{}).Where("external_id = ? AND company_id = ?", externalID, companyID)

	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}

	err := query.Count(&count).Error
	if err != nil {
		return false, err
	}

	return count > 0, nil
}
