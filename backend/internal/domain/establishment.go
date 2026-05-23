package domain

import (
	"time"

	"github.com/google/uuid"
)

type Establishment struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	CompanyID uuid.UUID `json:"company_id" gorm:"type:uuid;not null"`
	Company   Company   `json:"company" gorm:"foreignKey:CompanyID"`
	Name      string    `json:"name" gorm:"type:varchar(255);not null"`
	Address   string    `json:"address" gorm:"type:text;not null"`
	City      string    `json:"city" gorm:"type:varchar(100);not null"`
	State     string    `json:"state" gorm:"type:varchar(2);not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type EstablishmentRepository interface {
	Create(est *Establishment) error
	FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*Establishment, error)
	FindAll(companyID uuid.UUID, search string, page int, limit int) ([]*Establishment, int, error)
	Update(est *Establishment) error
	ExistsByNameAndCompany(name string, companyID uuid.UUID, excludeID *uuid.UUID) (bool, error)
}
