package postgres

import (
	"fmt"
	"strings"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EstablishmentRepository struct {
	db *gorm.DB
}

func NewEstablishmentRepository(db *gorm.DB) *EstablishmentRepository {
	return &EstablishmentRepository{db: db}
}

func (r *EstablishmentRepository) Create(est *domain.Establishment) error {
	return r.db.Create(est).Error
}

func (r *EstablishmentRepository) FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*domain.Establishment, error) {
	var est domain.Establishment
	err := r.db.Where("id = ? AND company_id = ?", id, companyID).First(&est).Error
	if err != nil {
		return nil, err
	}
	return &est, nil
}

func (r *EstablishmentRepository) FindAll(companyID uuid.UUID, search string, page int, limit int) ([]*domain.Establishment, int, error) {
	var establishments []*domain.Establishment
	var total int64

	query := r.db.Model(&domain.Establishment{}).Where("company_id = ?", companyID)

	if search != "" {
		searchTerm := fmt.Sprintf("%%%s%%", strings.ToLower(search))
		query = query.Where("LOWER(name) LIKE ?", searchTerm)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err = query.Limit(limit).Offset(offset).Order("name ASC").Find(&establishments).Error
	if err != nil {
		return nil, 0, err
	}

	return establishments, int(total), nil
}

func (r *EstablishmentRepository) Update(est *domain.Establishment) error {
	return r.db.Save(est).Error
}

func (r *EstablishmentRepository) ExistsByNameAndCompany(name string, companyID uuid.UUID, excludeID *uuid.UUID) (bool, error) {
	if name == "" {
		return false, nil
	}

	var count int64
	query := r.db.Model(&domain.Establishment{}).Where("LOWER(name) = ? AND company_id = ?", strings.ToLower(name), companyID)

	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}

	err := query.Count(&count).Error
	if err != nil {
		return false, err
	}

	return count > 0, nil
}
