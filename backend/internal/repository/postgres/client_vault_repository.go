package postgres

import (
	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ClientVaultRepository struct {
	db *gorm.DB
}

func NewClientVaultRepository(db *gorm.DB) *ClientVaultRepository {
	return &ClientVaultRepository{db: db}
}

func (r *ClientVaultRepository) Create(item *domain.ClientVaultItem) error {
	return r.db.Create(item).Error
}

func (r *ClientVaultRepository) FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*domain.ClientVaultItem, error) {
	var item domain.ClientVaultItem
	err := r.db.Where("id = ? AND company_id = ?", id, companyID).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *ClientVaultRepository) FindAllByClient(clientID uuid.UUID, companyID uuid.UUID) ([]*domain.ClientVaultItem, error) {
	var items []*domain.ClientVaultItem
	err := r.db.Where("client_id = ? AND company_id = ?", clientID, companyID).Order("created_at DESC").Find(&items).Error
	if err != nil {
		return nil, err
	}
	return items, nil
}

func (r *ClientVaultRepository) Update(item *domain.ClientVaultItem) error {
	return r.db.Save(item).Error
}

func (r *ClientVaultRepository) Delete(item *domain.ClientVaultItem) error {
	return r.db.Delete(item).Error
}
