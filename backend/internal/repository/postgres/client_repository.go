package postgres

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ClientRepository struct {
	db *gorm.DB
}

func NewClientRepository(db *gorm.DB) *ClientRepository {
	return &ClientRepository{db: db}
}

func (r *ClientRepository) Create(client *domain.Client) error {
	return r.db.Create(client).Error
}

func (r *ClientRepository) FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*domain.Client, error) {
	var client domain.Client
	err := r.db.Where("id = ? AND company_id = ?", id, companyID).First(&client).Error
	if err != nil {
		return nil, err
	}
	return &client, nil
}

func (r *ClientRepository) FindAll(companyID uuid.UUID, search string, status string, page int, limit int) ([]*domain.Client, int, error) {
	var clients []*domain.Client
	var total int64

	query := r.db.Model(&domain.Client{}).Where("company_id = ?", companyID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if search != "" {
		searchTerm := "%" + strings.ToLower(search) + "%"
		query = query.Where(
			"LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR cpf LIKE ?",
			searchTerm, searchTerm, "%"+search+"%",
		)
	}

	// Contagem total
	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Paginação
	offset := (page - 1) * limit
	err = query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&clients).Error
	if err != nil {
		return nil, 0, err
	}

	return clients, int(total), nil
}

func (r *ClientRepository) Update(client *domain.Client) error {
	return r.db.Save(client).Error
}

func (r *ClientRepository) ExistsByFieldAndCompany(field string, value string, companyID uuid.UUID, excludeID *uuid.UUID) (bool, error) {
	if value == "" {
		return false, nil
	}

	var count int64
	query := r.db.Model(&domain.Client{}).Where(fmt.Sprintf("%s = ? AND company_id = ?", field), value, companyID)

	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}

	err := query.Count(&count).Error
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (r *ClientRepository) Delete(client *domain.Client) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		clientJSON, err := json.Marshal(client)
		if err != nil {
			return err
		}

		deletedClient := &domain.DeletedClient{
			Data:      clientJSON,
			DeletedAt: time.Now(),
		}

		if err := tx.Create(deletedClient).Error; err != nil {
			return err
		}

		if err := tx.Unscoped().Delete(client).Error; err != nil {
			return err
		}

		return nil
	})
}
